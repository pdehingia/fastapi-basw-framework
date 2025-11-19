"""User segment model."""

from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, DateTime, Text, Boolean,
    ForeignKey, Index
)
from sqlalchemy.dialects.postgresql import UUID, JSONB

from .base import Base


class UserSegment(Base):
    """User segment model for audience segmentation and targeted campaigns."""
    
    __tablename__ = "user_segments"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default="uuid_generate_v4()")
    segment_name = Column(String(255), nullable=False)
    segment_description = Column(Text, nullable=True)
    segment_type = Column(String(50), nullable=False)  # 'demographic', 'behavioral', 'geographic'
    user_type = Column(String(50), nullable=False)  # 'admin', 'provider', 'customer'
    criteria = Column(JSONB, nullable=False)  # Flexible criteria for segment definition
    estimated_size = Column(Integer, default=0)
    last_calculated_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey('admin_users.id'), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index('idx_user_segments_type', 'segment_type'),
        Index('idx_user_segments_user_type', 'user_type'),
    )

    def __repr__(self):
        return f"<UserSegment(id={self.id}, name={self.segment_name}, type={self.segment_type})>"
