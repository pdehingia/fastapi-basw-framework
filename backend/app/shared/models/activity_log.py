"""User activity log model."""

from datetime import datetime
from sqlalchemy import (
    Column, BigInteger, String, Text, DateTime, Index
)
from sqlalchemy.dialects.postgresql import UUID, INET, JSONB

from .base import Base


class UserActivityLog(Base):
    """User activity log model - polymorphic for all user types (partitioned table)."""
    
    __tablename__ = "user_activity_logs"

    id = Column(BigInteger, primary_key=True)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    user_type = Column(String(20), nullable=False)  # 'admin', 'provider', 'customer'
    activity_type = Column(String(100), nullable=False)
    activity_category = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    metadata = Column(JSONB, nullable=True)
    ip_address = Column(INET, nullable=True)
    session_id = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index('idx_activity_user_id', 'user_id', 'created_at'),
        Index('idx_activity_type', 'activity_type', 'created_at'),
        Index('idx_activity_created_at', 'created_at'),
        # Note: This is a partitioned table by created_at (monthly partitions)
        {'postgresql_partition_by': 'RANGE (created_at)'}
    )

    def __repr__(self):
        return f"<UserActivityLog(id={self.id}, user_type={self.user_type}, activity={self.activity_type})>"
