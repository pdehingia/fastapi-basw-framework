"""OTP Verifications API endpoints."""

from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from .dependencies import get_otp_management_service
from .schemas import (
    OTPVerificationResponse, OTPVerificationListResponse,
    OTPVerificationFilters, OTPResendRequest, OTPUnblockRequest,
    OTPStatistics, BlockedUser
)
from .service import OTPManagementService


router = APIRouter(prefix="/otp-verifications", tags=["OTP Management"])


@router.get(
    "",
    response_model=OTPVerificationListResponse,
    summary="List OTP verifications",
    description="Get paginated list of OTP verifications with filtering options"
)
def list_otp_verifications(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    phone_number: Optional[str] = Query(None, description="Filter by phone number"),
    user_type: Optional[str] = Query(None, description="Filter by user type"),
    purpose: Optional[str] = Query(None, description="Filter by purpose"),
    is_verified: Optional[bool] = Query(None, description="Filter by verification status"),
    is_blocked: Optional[bool] = Query(None, description="Filter by blocked status"),
    created_from: Optional[datetime] = Query(None, description="Filter from date"),
    created_to: Optional[datetime] = Query(None, description="Filter to date"),
    service: OTPManagementService = Depends(get_otp_management_service)
):
    """List OTP verifications with filters."""
    filters = OTPVerificationFilters(
        phone_number=phone_number,
        user_type=user_type,
        purpose=purpose,
        is_verified=is_verified,
        is_blocked=is_blocked,
        created_from=created_from,
        created_to=created_to
    )
    return service.get_otp_verifications(filters, page, size)


@router.get(
    "/stats",
    response_model=OTPStatistics,
    summary="Get OTP statistics",
    description="Get comprehensive OTP verification statistics"
)
def get_otp_statistics(
    service: OTPManagementService = Depends(get_otp_management_service)
):
    """Get OTP statistics."""
    return service.get_statistics()


@router.get(
    "/blocked-users",
    response_model=list[BlockedUser],
    summary="Get blocked users",
    description="Get list of currently blocked phone numbers"
)
def get_blocked_users(
    service: OTPManagementService = Depends(get_otp_management_service)
):
    """Get blocked users."""
    return service.get_blocked_users()


@router.get(
    "/{otp_id}",
    response_model=OTPVerificationResponse,
    summary="Get OTP verification",
    description="Get specific OTP verification by ID"
)
def get_otp_verification(
    otp_id: int,
    service: OTPManagementService = Depends(get_otp_management_service)
):
    """Get OTP verification by ID."""
    return service.get_otp_by_id(otp_id)


@router.delete(
    "/{otp_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete OTP verification",
    description="Delete OTP verification record"
)
def delete_otp_verification(
    otp_id: int,
    service: OTPManagementService = Depends(get_otp_management_service)
):
    """Delete OTP verification."""
    service.delete_otp(otp_id)


@router.post(
    "/resend",
    response_model=dict,
    summary="Resend OTP",
    description="Resend OTP to phone number for specified purpose"
)
def resend_otp(
    request: OTPResendRequest,
    service: OTPManagementService = Depends(get_otp_management_service)
):
    """Resend OTP."""
    return service.resend_otp(request)


@router.post(
    "/unblock",
    response_model=dict,
    summary="Unblock phone number",
    description="Unblock a phone number that was blocked due to too many attempts"
)
def unblock_phone_number(
    request: OTPUnblockRequest,
    service: OTPManagementService = Depends(get_otp_management_service)
):
    """Unblock phone number."""
    return service.unblock_phone(request)
