"""
Generation Token model for tracking user credits.
"""
import secrets
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship

from ..database import Base


class GenerationToken(Base):
    __tablename__ = "generation_tokens"

    id = Column(Integer, primary_key=True)
    token = Column(String(64), unique=True, nullable=False, index=True)
    device_id = Column(String(64), nullable=False, index=True)
    product_sku = Column(String(32), nullable=False)
    total_generations = Column(Integer, nullable=False)
    remaining_generations = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime(timezone=True), nullable=True)  # None = no expiry
    is_active = Column(Boolean, default=True)

    @classmethod
    def create_token(
        cls,
        product_sku: str,
        generations: int,
        device_id: str,
        expires_at: datetime | None = None,
    ) -> "GenerationToken":
        """Create a new generation token."""
        return cls(
            token=secrets.token_urlsafe(32),
            device_id=device_id,
            product_sku=product_sku,
            total_generations=generations,
            remaining_generations=generations,
            expires_at=expires_at,
        )

    def consume(self) -> bool:
        """Consume one generation. Returns True if successful."""
        if self.remaining_generations <= 0:
            return False
        if self.expires_at and datetime.now(timezone.utc) > self.expires_at:
            return False
        self.remaining_generations -= 1
        return True
