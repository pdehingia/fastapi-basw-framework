"""OTP Verifications schemas."""

from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field


# ===== OTP VERIFICATION SCHEMAS =====

class OTPVerificationBase(BaseModel):
    """Base schema for OTP verification."""
    phone_number: str = Field(..., max_length=20)
    country_code: str = Field(default="+91", max_length=5)
    purpose: str = Field(..., max_length=50, description="login, register, password_reset, etc.")


class OTPVerificationResponse(OTPVerificationBase):
    """OTP verification response schema."""
    id: int
    user_id: Optional[UUID] = None
    user_type: Optional[str] = None
    otp_code: str
    attempts_count: int
    max_attempts: int
    is_verified: bool
    is_blocked: bool
    blocked_until: Optional[datetime] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime
    expires_at: datetime
    verified_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class OTPVerificationListResponse(BaseModel):
    """Paginated OTP verification list response."""
    items: List[OTPVerificationResponse]
    total: int
    page: int
    size: int
    pages: int


class OTPVerificationFilters(BaseModel):
    """Filter parameters for OTP verifications."""
    phone_number: Optional[str] = None
    user_id: Optional[UUID] = None
    user_type: Optional[str] = None
    purpose: Optional[str] = None
    is_verified: Optional[bool] = None
    is_blocked: Optional[bool] = None
    created_from: Optional[datetime] = None
    created_to: Optional[datetime] = None


class OTPResendRequest(BaseModel):
    """Request to resend OTP."""
    phone_number: str = Field(..., max_length=20)
    country_code: str = Field(default="+91", max_length=5)
    purpose: str = Field(..., max_length=50)


class OTPUnblockRequest(BaseModel):
    """Request to unblock phone number."""
    phone_number: str = Field(..., max_length=20)
    country_code: str = Field(default="+91", max_length=5)
    reason: Optional[str] = Field(None, max_length=500)


class OTPStatistics(BaseModel):
    """OTP verification statistics."""
    total_otps: int
    verified_otps: int
    unverified_otps: int
    blocked_numbers: int
    expired_otps: int
    by_purpose: dict
    by_user_type: dict
    verification_rate: float
    avg_verification_time_seconds: Optional[float] = None


class BlockedUser(BaseModel):
    """Blocked user information."""
    phone_number: str
    country_code: str
    attempts_count: int
    blocked_until: datetime
    last_attempt_at: datetime
    reason: str
