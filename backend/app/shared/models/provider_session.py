"""Provider user session model."""

from datetime import datetime, timedelta
from sqlalchemy import (
    Column, String, Boolean, DateTime, Text, ForeignKey, Index
)
from sqlalchemy.dialects.postgresql import UUID, INET
from sqlalchemy.orm import relationship

from .base import Base


class ProviderUserSession(Base):
    """Provider user session model for session management."""
    
    __tablename__ = "provider_user_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default="uuid_generate_v4()")
    user_id = Column(UUID(as_uuid=True), ForeignKey('provider_users.id', ondelete='CASCADE'), nullable=False)
    session_token = Column(Text, nullable=False, unique=True)
    refresh_token = Column(Text, nullable=True, unique=True)
    device_id = Column(Text, nullable=True)
    device_type = Column(String(30), nullable=True)  # 'web', 'ios', 'android'
    device_name = Column(Text, nullable=True)
    os_version = Column(String(50), nullable=True)
    app_version = Column(String(50), nullable=True)
    ip_address = Column(INET, nullable=True)
    city = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    last_active_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    logged_out_at = Column(DateTime(timezone=True), nullable=True)

    # Relationship
    # user = relationship("ProviderUser", back_populates="sessions")

    __table_args__ = (
        Index('idx_provider_sessions_user_id', 'user_id'),
        Index('idx_provider_sessions_expires', 'expires_at'),
        Index('idx_provider_sessions_active', 'user_id', 'is_active'),
    )

    def __repr__(self):
        return f"<ProviderUserSession(id={self.id}, user_id={self.user_id}, device={self.device_type})>"
