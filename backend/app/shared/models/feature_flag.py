"""
Feature Flag Model

Enables A/B testing, gradual rollouts, and feature toggles
"""

from sqlalchemy import Column, String, Boolean, Integer, ARRAY, UUID, TIMESTAMP
from sqlalchemy.dialects.postgresql import JSONB
from app.shared.models.base import Base
import uuid
from datetime import datetime


class FeatureFlag(Base):
    """Feature Flag for controlling feature rollouts"""
    
    __tablename__ = "feature_flags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    key = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(String, nullable=True)
    is_enabled = Column(Boolean, default=False, nullable=False)
    rollout_percentage = Column(Integer, default=0, nullable=False)  # 0-100
    user_segments = Column(ARRAY(String), nullable=True)  # Target specific user segments
    conditions = Column(JSONB, nullable=True)  # Additional targeting conditions
    
    # Metadata
    created_at = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    created_by = Column(UUID(as_uuid=True), nullable=True)
    updated_by = Column(UUID(as_uuid=True), nullable=True)

    def __repr__(self):
        return f"<FeatureFlag(key={self.key}, enabled={self.is_enabled})>"
