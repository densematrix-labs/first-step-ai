from fastapi import APIRouter, HTTPException, Header
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from ...schemas.next_step import NextStepRequest, NextStepResponse
from ...services.llm_service import generate_next_step
from ...database import async_session_maker
from ...models.token import GenerationToken
from ...metrics import (
    next_step_requests_total, 
    next_step_success_total, 
    next_step_errors_total,
    tokens_consumed_total,
    free_trial_used_total,
    TOOL_NAME
)

router = APIRouter()

# Free trial tracking (in-memory for simplicity, production should use Redis)
free_trial_used: set = set()

# Maximum free trials per device
MAX_FREE_TRIALS = 1


async def get_remaining_tokens(device_id: str) -> int:
    """Get total remaining tokens for a device."""
    async with async_session_maker() as db:
        result = await db.execute(
            select(func.sum(GenerationToken.remaining_generations))
            .where(GenerationToken.device_id == device_id)
            .where(GenerationToken.is_active == True)
            .where(GenerationToken.remaining_generations > 0)
        )
        total = result.scalar()
        return total or 0


async def consume_token(device_id: str) -> bool:
    """Consume one token from device's balance. Returns True if successful."""
    async with async_session_maker() as db:
        # Find first available token
        result = await db.execute(
            select(GenerationToken)
            .where(GenerationToken.device_id == device_id)
            .where(GenerationToken.is_active == True)
            .where(GenerationToken.remaining_generations > 0)
            .order_by(GenerationToken.created_at)
            .limit(1)
        )
        token = result.scalar_one_or_none()
        
        if not token:
            return False
        
        token.remaining_generations -= 1
        await db.commit()
        return True


@router.post("/next-step", response_model=NextStepResponse)
async def get_next_step(
    request: NextStepRequest,
    x_device_id: Optional[str] = Header(None, alias="X-Device-Id")
):
    """Generate the next step for a given task."""
    
    device_id = x_device_id or "anonymous"
    
    # Track request
    next_step_requests_total.labels(tool=TOOL_NAME, language=request.language).inc()
    
    # Check tokens and free trial
    remaining_tokens = await get_remaining_tokens(device_id)
    
    if remaining_tokens > 0:
        # User has tokens, consume one
        await consume_token(device_id)
        tokens_consumed_total.labels(tool=TOOL_NAME).inc()
        is_free_trial = False
    elif device_id not in free_trial_used:
        # Free trial available
        free_trial_used.add(device_id)
        free_trial_used_total.labels(tool=TOOL_NAME).inc()
        is_free_trial = True
    else:
        # No tokens and free trial used
        raise HTTPException(
            status_code=402,
            detail={
                "error": "payment_required",
                "message": "Free trial exhausted. Please purchase more steps.",
                "pricing_url": "/pricing"
            }
        )
    
    try:
        # Generate next step
        step = await generate_next_step(
            task=request.task,
            context=request.context,
            history=request.history,
            language=request.language
        )
        
        # Track success
        next_step_success_total.labels(tool=TOOL_NAME, language=request.language).inc()
        
        # Get updated token count
        new_remaining = await get_remaining_tokens(device_id) if not is_free_trial else 0
        
        return NextStepResponse(
            step=step, 
            tokens_used=1,
            remaining_tokens=new_remaining,
            is_free_trial=is_free_trial
        )
        
    except HTTPException:
        raise
    except Exception as e:
        # Track error
        error_type = type(e).__name__
        next_step_errors_total.labels(tool=TOOL_NAME, error_type=error_type).inc()
        raise HTTPException(status_code=500, detail=f"Failed to generate next step: {str(e)}")
