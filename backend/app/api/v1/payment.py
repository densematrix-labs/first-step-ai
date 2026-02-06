"""
Simplified Payment Router for First Step AI.
"""
import os
import hmac
import hashlib
import json
import httpx
from fastapi import APIRouter, HTTPException, Request, Header, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from ...database import get_db
from ...models.token import GenerationToken

# Creem configuration
CREEM_API_KEY = os.getenv("CREEM_API_KEY", "")
CREEM_WEBHOOK_SECRET = os.getenv("CREEM_WEBHOOK_SECRET", "")

# Product configuration
PRODUCTS = {
    "pack_5": {"price": 499, "generations": 5, "creem_product_id": os.getenv("CREEM_PRODUCT_5", "")},
    "pack_15": {"price": 999, "generations": 15, "creem_product_id": os.getenv("CREEM_PRODUCT_15", "")},
}


def get_creem_api_base():
    """Use test API for test keys, production API for live keys."""
    if CREEM_API_KEY.startswith("creem_test_"):
        return "https://test-api.creem.io/v1"
    return "https://api.creem.io/v1"


router = APIRouter()


# === Schemas ===

class Product(BaseModel):
    sku: str
    name: str
    price_cents: int
    generations: int


class CreateCheckoutRequest(BaseModel):
    product_sku: str
    device_id: str
    success_url: str
    optional_email: str | None = None


class CreateCheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str


# === Routes ===

@router.get("/payment/products", response_model=list[Product])
async def get_products():
    """Get available product packages."""
    return [
        Product(
            sku=sku,
            name=sku.replace("_", " ").title(),
            price_cents=info["price"],
            generations=info["generations"],
        )
        for sku, info in PRODUCTS.items()
        if info.get("creem_product_id")  # Only return configured products
    ]


@router.post("/payment/create-checkout", response_model=CreateCheckoutResponse)
async def create_checkout(request: CreateCheckoutRequest):
    """Create a Creem checkout session."""
    if request.product_sku not in PRODUCTS:
        raise HTTPException(status_code=400, detail="Invalid product SKU")

    product = PRODUCTS[request.product_sku]
    creem_product_id = product.get("creem_product_id")
    
    if not creem_product_id:
        raise HTTPException(status_code=400, detail="Product not configured in Creem")
    
    if not CREEM_API_KEY:
        raise HTTPException(status_code=500, detail="Payment not configured")

    try:
        async with httpx.AsyncClient() as client:
            payload = {
                "product_id": creem_product_id,
                "success_url": request.success_url,
                "metadata": {
                    "product_sku": request.product_sku,
                    "device_id": request.device_id,
                    "generations": str(product["generations"]),
                },
            }
            if request.optional_email:
                payload["customer"] = {"email": request.optional_email}

            response = await client.post(
                f"{get_creem_api_base()}/checkouts",
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": CREEM_API_KEY,
                },
                json=payload,
                timeout=30.0,
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Creem API error: {response.text}",
                )

            data = response.json()
            return CreateCheckoutResponse(
                checkout_url=data["checkout_url"],
                session_id=data["id"],
            )

    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Payment service error: {str(e)}")


def verify_creem_signature(payload: bytes, signature: str, secret: str) -> bool:
    """Verify Creem webhook signature using HMAC-SHA256."""
    expected = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(signature, expected)


@router.post("/webhooks/creem")
async def creem_webhook(
    request: Request,
    creem_signature: str = Header(None, alias="creem-signature"),
    db: AsyncSession = Depends(get_db),
):
    """Handle Creem webhook events."""
    payload = await request.body()

    if not CREEM_WEBHOOK_SECRET:
        raise HTTPException(status_code=500, detail="Webhook not configured")

    if not creem_signature or not verify_creem_signature(
        payload, creem_signature, CREEM_WEBHOOK_SECRET
    ):
        raise HTTPException(status_code=400, detail="Invalid signature")

    try:
        event = json.loads(payload.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_type = event.get("eventType")

    if event_type == "checkout.completed":
        await _handle_checkout_completed(event, db)

    return {"received": True}


async def _handle_checkout_completed(event: dict, db: AsyncSession):
    """Handle successful checkout — create token."""
    obj = event.get("object", {})
    metadata = obj.get("metadata", {})

    product_sku = metadata.get("product_sku")
    device_id = metadata.get("device_id")
    generations = int(metadata.get("generations", 1))

    # Create token
    token = GenerationToken.create_token(
        product_sku=product_sku,
        generations=generations,
        device_id=device_id,
    )
    db.add(token)
    await db.commit()


# === Token Routes ===

@router.get("/tokens/by-device/{device_id}")
async def get_tokens_by_device(device_id: str, db: AsyncSession = Depends(get_db)):
    """Get remaining generations for a device."""
    result = await db.execute(
        select(GenerationToken)
        .where(GenerationToken.device_id == device_id)
        .where(GenerationToken.is_active == True)
        .where(GenerationToken.remaining_generations > 0)
    )
    tokens = result.scalars().all()
    
    total_remaining = sum(t.remaining_generations for t in tokens)
    
    return {
        "device_id": device_id,
        "remaining_generations": total_remaining,
        "tokens": [
            {
                "token": t.token[:8] + "...",
                "remaining": t.remaining_generations,
                "total": t.total_generations,
            }
            for t in tokens
        ],
    }


@router.post("/tokens/consume")
async def consume_token(device_id: str, db: AsyncSession = Depends(get_db)):
    """Consume one generation from device's tokens."""
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
        raise HTTPException(status_code=402, detail="No generations available")
    
    if not token.consume():
        raise HTTPException(status_code=402, detail="Token expired or exhausted")
    
    await db.commit()
    
    return {"remaining": token.remaining_generations}
