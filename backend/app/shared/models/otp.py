"""OTP verification model."""

from datetime import datetime, timedelta
from sqlalchemy import (
    Column, BigInteger, String, Integer, Boolean, DateTime, Text,
    ForeignKey, CheckConstraint, Index
)
from sqlalchemy.dialects.postgresql import UUID, INET
from sqlalchemy.orm import relationship

from .base import Base


class OTPVerification(Base):
    """OTP verification model for phone number verification."""
    
    __tablename__ = "otp_verifications"

    id = Column(BigInteger, primary_key=True, index=True)
    phone_number = Column(String(20), nullable=False)
    country_code = Column(String(5), nullable=False, default="+91")
    user_id = Column(UUID(as_uuid=True), nullable=True)
    user_type = Column(String(20), nullable=True)  # 'admin', 'provider', 'customer'
    otp_code = Column(String(6), nullable=False)
    otp_hash = Column(String(255), nullable=False)
    purpose = Column(String(50), nullable=False)  # 'login', 'register', 'password_reset', etc.
    attempts_count = Column(Integer, default=0)
    max_attempts = Column(Integer, default=3)
    is_verified = Column(Boolean, default=False)
    is_blocked = Column(Boolean, default=False)
    blocked_until = Column(DateTime(timezone=True), nullable=True)
    ip_address = Column(INET, nullable=True)
    user_agent = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index('idx_otp_phone_purpose', 'phone_number', 'purpose'),
        Index('idx_otp_expires_at', 'expires_at'),
        Index('idx_otp_user_id_type', 'user_id', 'user_type'),
        CheckConstraint('attempts_count >= 0', name='ck_otp_attempts_positive'),
        CheckConstraint('max_attempts > 0', name='ck_otp_max_attempts_positive'),
    )

    def __repr__(self):
        return f"<OTPVerification(id={self.id}, phone={self.phone_number}, purpose={self.purpose})>"
