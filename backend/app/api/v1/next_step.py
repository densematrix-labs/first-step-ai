from fastapi import APIRouter, HTTPException
from ...schemas.next_step import NextStepRequest, NextStepResponse
from ...services.llm_service import generate_next_step
from ...metrics import (
    next_step_requests_total, 
    next_step_success_total, 
    next_step_errors_total,
    tokens_consumed_total,
    free_trial_used_total,
    TOOL_NAME
)

router = APIRouter()


@router.post("/next-step", response_model=NextStepResponse)
async def get_next_step(request: NextStepRequest):
    """Generate the next step for a given task."""
    
    # Track request
    next_step_requests_total.labels(tool=TOOL_NAME, language=request.language).inc()
    
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
        tokens_consumed_total.labels(tool=TOOL_NAME).inc()
        
        # TODO: Check if user has tokens, otherwise count as free trial
        # For now, count everything as token consumption
        
        return NextStepResponse(step=step, tokens_used=1)
        
    except Exception as e:
        # Track error
        error_type = type(e).__name__
        next_step_errors_total.labels(tool=TOOL_NAME, error_type=error_type).inc()
        raise HTTPException(status_code=500, detail=f"Failed to generate next step: {str(e)}")
