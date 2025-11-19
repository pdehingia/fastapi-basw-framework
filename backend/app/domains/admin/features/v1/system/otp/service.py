"""OTP Verifications service."""

from datetime import datetime, timedelta
from typing import List, Optional, Tuple
from uuid import UUID
from sqlalchemy import func, and_, or_, desc
from sqlalchemy.orm import Session

from app.shared.models.otp import OTPVerification
from app.core.exceptions import NotFoundException, ValidationException, ConflictException
from .schemas import (
    OTPVerificationResponse, OTPVerificationListResponse,
    OTPVerificationFilters, OTPResendRequest, OTPUnblockRequest,
    OTPStatistics, BlockedUser
)


class OTPManagementService:
    """Service for managing OTP verifications."""
    
    def __init__(self, db: Session):
        self.db = db

    def get_otp_verifications(
        self,
        filters: OTPVerificationFilters,
        page: int = 1,
        size: int = 20
    ) -> OTPVerificationListResponse:
        """Get OTP verifications with filtering and pagination."""
        query = self.db.query(OTPVerification)
        
        # Apply filters
        if filters.phone_number:
            query = query.filter(OTPVerification.phone_number == filters.phone_number)
        
        if filters.user_id:
            query = query.filter(OTPVerification.user_id == filters.user_id)
        
        if filters.user_type:
            query = query.filter(OTPVerification.user_type == filters.user_type)
        
        if filters.purpose:
            query = query.filter(OTPVerification.purpose == filters.purpose)
        
        if filters.is_verified is not None:
            query = query.filter(OTPVerification.is_verified == filters.is_verified)
        
        if filters.is_blocked is not None:
            query = query.filter(OTPVerification.is_blocked == filters.is_blocked)
        
        if filters.created_from:
            query = query.filter(OTPVerification.created_at >= filters.created_from)
        
        if filters.created_to:
            query = query.filter(OTPVerification.created_at <= filters.created_to)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * size
        items = query.order_by(desc(OTPVerification.created_at))\
                     .offset(offset)\
                     .limit(size)\
                     .all()
        
        pages = (total + size - 1) // size
        
        return OTPVerificationListResponse(
            items=[OTPVerificationResponse.model_validate(item) for item in items],
            total=total,
            page=page,
            size=size,
            pages=pages
        )

    def get_otp_by_id(self, otp_id: int) -> OTPVerificationResponse:
        """Get OTP verification by ID."""
        otp = self.db.query(OTPVerification).filter(
            OTPVerification.id == otp_id
        ).first()
        
        if not otp:
            raise NotFoundException(f"OTP verification with ID {otp_id} not found")
        
        return OTPVerificationResponse.model_validate(otp)

    def delete_otp(self, otp_id: int) -> None:
        """Delete OTP verification."""
        otp = self.db.query(OTPVerification).filter(
            OTPVerification.id == otp_id
        ).first()
        
        if not otp:
            raise NotFoundException(f"OTP verification with ID {otp_id} not found")
        
        self.db.delete(otp)
        self.db.commit()

    def resend_otp(self, request: OTPResendRequest) -> dict:
        """Resend OTP to phone number."""
        # Check if phone is blocked
        blocked = self.db.query(OTPVerification).filter(
            and_(
                OTPVerification.phone_number == request.phone_number,
                OTPVerification.is_blocked == True,
                OTPVerification.blocked_until > datetime.utcnow()
            )
        ).first()
        
        if blocked:
            raise ValidationException(
                f"Phone number is blocked until {blocked.blocked_until}. "
                f"Too many failed attempts."
            )
        
        # Delete old unverified OTPs for this phone/purpose
        self.db.query(OTPVerification).filter(
            and_(
                OTPVerification.phone_number == request.phone_number,
                OTPVerification.purpose == request.purpose,
                OTPVerification.is_verified == False
            )
        ).delete()
        
        # Generate new OTP (simplified - in production, integrate with SMS gateway)
        import random
        otp_code = str(random.randint(100000, 999999))
        
        # Create new OTP record
        new_otp = OTPVerification(
            phone_number=request.phone_number,
            country_code=request.country_code,
            otp_code=otp_code,
            otp_hash=otp_code,  # In production, hash this
            purpose=request.purpose,
            expires_at=datetime.utcnow() + timedelta(minutes=5)
        )
        
        self.db.add(new_otp)
        self.db.commit()
        
        return {
            "message": "OTP resent successfully",
            "phone_number": request.phone_number,
            "expires_at": new_otp.expires_at
        }

    def unblock_phone(self, request: OTPUnblockRequest) -> dict:
        """Unblock a phone number."""
        blocked_otps = self.db.query(OTPVerification).filter(
            and_(
                OTPVerification.phone_number == request.phone_number,
                OTPVerification.is_blocked == True
            )
        ).all()
        
        if not blocked_otps:
            raise NotFoundException(
                f"No blocked OTP records found for phone {request.phone_number}"
            )
        
        # Unblock all OTP records for this phone
        for otp in blocked_otps:
            otp.is_blocked = False
            otp.blocked_until = None
            otp.attempts_count = 0
        
        self.db.commit()
        
        return {
            "message": "Phone number unblocked successfully",
            "phone_number": request.phone_number,
            "records_updated": len(blocked_otps)
        }

    def get_blocked_users(self) -> List[BlockedUser]:
        """Get list of currently blocked phone numbers."""
        blocked = self.db.query(OTPVerification).filter(
            and_(
                OTPVerification.is_blocked == True,
                OTPVerification.blocked_until > datetime.utcnow()
            )
        ).order_by(desc(OTPVerification.created_at)).all()
        
        blocked_users = []
        seen_phones = set()
        
        for otp in blocked:
            phone_key = f"{otp.country_code}{otp.phone_number}"
            if phone_key not in seen_phones:
                seen_phones.add(phone_key)
                blocked_users.append(BlockedUser(
                    phone_number=otp.phone_number,
                    country_code=otp.country_code,
                    attempts_count=otp.attempts_count,
                    blocked_until=otp.blocked_until,
                    last_attempt_at=otp.created_at,
                    reason=f"Exceeded maximum attempts ({otp.max_attempts})"
                ))
        
        return blocked_users

    def get_statistics(self) -> OTPStatistics:
        """Get OTP verification statistics."""
        # Total OTPs
        total_otps = self.db.query(func.count(OTPVerification.id)).scalar()
        
        # Verified OTPs
        verified_otps = self.db.query(func.count(OTPVerification.id)).filter(
            OTPVerification.is_verified == True
        ).scalar()
        
        # Unverified OTPs
        unverified_otps = total_otps - verified_otps
        
        # Blocked numbers
        blocked_numbers = self.db.query(func.count(func.distinct(OTPVerification.phone_number))).filter(
            and_(
                OTPVerification.is_blocked == True,
                OTPVerification.blocked_until > datetime.utcnow()
            )
        ).scalar()
        
        # Expired OTPs
        expired_otps = self.db.query(func.count(OTPVerification.id)).filter(
            and_(
                OTPVerification.expires_at < datetime.utcnow(),
                OTPVerification.is_verified == False
            )
        ).scalar()
        
        # By purpose
        by_purpose_data = self.db.query(
            OTPVerification.purpose,
            func.count(OTPVerification.id)
        ).group_by(OTPVerification.purpose).all()
        by_purpose = {purpose: count for purpose, count in by_purpose_data}
        
        # By user type
        by_user_type_data = self.db.query(
            OTPVerification.user_type,
            func.count(OTPVerification.id)
        ).filter(OTPVerification.user_type.isnot(None))\
         .group_by(OTPVerification.user_type).all()
        by_user_type = {user_type: count for user_type, count in by_user_type_data}
        
        # Verification rate
        verification_rate = (verified_otps / total_otps * 100) if total_otps > 0 else 0.0
        
        # Average verification time
        avg_time_data = self.db.query(
            func.avg(
                func.extract('epoch', OTPVerification.verified_at - OTPVerification.created_at)
            )
        ).filter(
            OTPVerification.is_verified == True,
            OTPVerification.verified_at.isnot(None)
        ).scalar()
        
        return OTPStatistics(
            total_otps=total_otps or 0,
            verified_otps=verified_otps or 0,
            unverified_otps=unverified_otps or 0,
            blocked_numbers=blocked_numbers or 0,
            expired_otps=expired_otps or 0,
            by_purpose=by_purpose,
            by_user_type=by_user_type,
            verification_rate=round(verification_rate, 2),
            avg_verification_time_seconds=float(avg_time_data) if avg_time_data else None
        )
