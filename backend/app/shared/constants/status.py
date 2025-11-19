"""
Status Constants

All status values used throughout the application for consistent state management.
"""

from enum import Enum
from typing import Dict, List


# ===== BOOKING STATUS =====
class BookingStatus:
    """Booking status constants."""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"
    RESCHEDULED = "rescheduled"
    REFUNDED = "refunded"

    @classmethod
    def get_all(cls) -> List[str]:
        return [cls.PENDING, cls.CONFIRMED, cls.IN_PROGRESS, cls.COMPLETED, 
                cls.CANCELLED, cls.NO_SHOW, cls.RESCHEDULED, cls.REFUNDED]

    @classmethod
    def get_active_statuses(cls) -> List[str]:
        return [cls.PENDING, cls.CONFIRMED, cls.IN_PROGRESS]

    @classmethod
    def get_final_statuses(cls) -> List[str]:
        return [cls.COMPLETED, cls.CANCELLED, cls.NO_SHOW, cls.REFUNDED]


# ===== PAYMENT STATUS =====
class PaymentStatus:
    """Payment status constants."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"
    DISPUTED = "disputed"
    EXPIRED = "expired"

    @classmethod
    def get_all(cls) -> List[str]:
        return [cls.PENDING, cls.PROCESSING, cls.COMPLETED, cls.FAILED,
                cls.CANCELLED, cls.REFUNDED, cls.PARTIALLY_REFUNDED, 
                cls.DISPUTED, cls.EXPIRED]

    @classmethod
    def get_success_statuses(cls) -> List[str]:
        return [cls.COMPLETED]

    @classmethod
    def get_failure_statuses(cls) -> List[str]:
        return [cls.FAILED, cls.CANCELLED, cls.EXPIRED]


# ===== VERIFICATION STATUS =====
class VerificationStatus:
    """User and business verification status constants."""
    PENDING = "pending"
    IN_REVIEW = "in_review"
    VERIFIED = "verified"
    REJECTED = "rejected"
    EXPIRED = "expired"
    SUSPENDED = "suspended"

    @classmethod
    def get_all(cls) -> List[str]:
        return [cls.PENDING, cls.IN_REVIEW, cls.VERIFIED, 
                cls.REJECTED, cls.EXPIRED, cls.SUSPENDED]

    @classmethod
    def get_active_statuses(cls) -> List[str]:
        return [cls.VERIFIED]

    @classmethod
    def get_inactive_statuses(cls) -> List[str]:
        return [cls.REJECTED, cls.EXPIRED, cls.SUSPENDED]


# ===== USER STATUS =====
class UserStatus:
    """User account status constants."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"
    SUSPENDED = "suspended"
    BANNED = "banned"
    DELETED = "deleted"
    DEACTIVATED = "deactivated"

    @classmethod
    def get_all(cls) -> List[str]:
        return [cls.ACTIVE, cls.INACTIVE, cls.PENDING, cls.SUSPENDED,
                cls.BANNED, cls.DELETED, cls.DEACTIVATED]

    @classmethod
    def get_active_statuses(cls) -> List[str]:
        return [cls.ACTIVE]

    @classmethod
    def get_inactive_statuses(cls) -> List[str]:
        return [cls.INACTIVE, cls.SUSPENDED, cls.BANNED, cls.DELETED, cls.DEACTIVATED]


# ===== REFERRAL STATUS =====
class ReferralStatus:
    """Referral program status constants."""
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"
    EXPIRED = "expired"
    CANCELLED = "cancelled"
    REWARDED = "rewarded"

    @classmethod
    def get_all(cls) -> List[str]:
        return [cls.PENDING, cls.ACTIVE, cls.COMPLETED, 
                cls.EXPIRED, cls.CANCELLED, cls.REWARDED]

    @classmethod
    def get_active_statuses(cls) -> List[str]:
        return [cls.ACTIVE]

    @classmethod
    def get_final_statuses(cls) -> List[str]:
        return [cls.COMPLETED, cls.EXPIRED, cls.CANCELLED, cls.REWARDED]


# ===== ADVERTISEMENT STATUS =====
class AdStatus:
    """Advertisement campaign status constants."""
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REJECTED = "rejected"

    @classmethod
    def get_all(cls) -> List[str]:
        return [cls.DRAFT, cls.PENDING_APPROVAL, cls.APPROVED, cls.ACTIVE,
                cls.PAUSED, cls.COMPLETED, cls.CANCELLED, cls.REJECTED]

    @classmethod
    def get_active_statuses(cls) -> List[str]:
        return [cls.ACTIVE]

    @classmethod
    def get_inactive_statuses(cls) -> List[str]:
        return [cls.PAUSED, cls.COMPLETED, cls.CANCELLED, cls.REJECTED]


# ===== NOTIFICATION STATUS =====
class NotificationStatus:
    """Notification delivery status constants."""
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"
    EXPIRED = "expired"

    @classmethod
    def get_all(cls) -> List[str]:
        return [cls.PENDING, cls.SENT, cls.DELIVERED, 
                cls.READ, cls.FAILED, cls.EXPIRED]

    @classmethod
    def get_success_statuses(cls) -> List[str]:
        return [cls.SENT, cls.DELIVERED, cls.READ]

    @classmethod
    def get_failure_statuses(cls) -> List[str]:
        return [cls.FAILED, cls.EXPIRED]


# ===== TRANSACTION STATUS =====
class TransactionStatus:
    """Financial transaction status constants."""
    PENDING = "pending"
    PROCESSING = "processing" 
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REVERSED = "reversed"
    ON_HOLD = "on_hold"

    @classmethod
    def get_all(cls) -> List[str]:
        return [cls.PENDING, cls.PROCESSING, cls.COMPLETED, cls.FAILED,
                cls.CANCELLED, cls.REVERSED, cls.ON_HOLD]

    @classmethod
    def get_final_statuses(cls) -> List[str]:
        return [cls.COMPLETED, cls.FAILED, cls.CANCELLED, cls.REVERSED]


# ===== SERVICE STATUS =====
class ServiceStatus:
    """Service offering status constants."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    DRAFT = "draft"
    ARCHIVED = "archived"
    SEASONAL = "seasonal"
    TEMPORARILY_UNAVAILABLE = "temporarily_unavailable"

    @classmethod
    def get_all(cls) -> List[str]:
        return [cls.ACTIVE, cls.INACTIVE, cls.DRAFT, cls.ARCHIVED,
                cls.SEASONAL, cls.TEMPORARILY_UNAVAILABLE]

    @classmethod
    def get_available_statuses(cls) -> List[str]:
        return [cls.ACTIVE, cls.SEASONAL]


# ===== BUSINESS STATUS =====
class BusinessStatus:
    """Business/salon status constants."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING_VERIFICATION = "pending_verification"
    VERIFIED = "verified"
    SUSPENDED = "suspended"
    CLOSED_PERMANENTLY = "closed_permanently"
    CLOSED_TEMPORARILY = "closed_temporarily"

    @classmethod
    def get_all(cls) -> List[str]:
        return [cls.ACTIVE, cls.INACTIVE, cls.PENDING_VERIFICATION, cls.VERIFIED,
                cls.SUSPENDED, cls.CLOSED_PERMANENTLY, cls.CLOSED_TEMPORARILY]

    @classmethod
    def get_operational_statuses(cls) -> List[str]:
        return [cls.ACTIVE, cls.VERIFIED]


# ===== GLOBAL STATUS MAPPINGS =====
BOOKING_STATUS = BookingStatus()
PAYMENT_STATUS = PaymentStatus()
VERIFICATION_STATUS = VerificationStatus()
USER_STATUS = UserStatus()
REFERRAL_STATUS = ReferralStatus()
AD_STATUS = AdStatus()
NOTIFICATION_STATUS = NotificationStatus()
TRANSACTION_STATUS = TransactionStatus()
SERVICE_STATUS = ServiceStatus()
BUSINESS_STATUS = BusinessStatus()


# ===== STATUS DESCRIPTIONS =====
STATUS_DESCRIPTIONS: Dict[str, Dict[str, str]] = {
    "booking": {
        BookingStatus.PENDING: "Booking request submitted, awaiting confirmation",
        BookingStatus.CONFIRMED: "Booking confirmed by provider",
        BookingStatus.IN_PROGRESS: "Service is currently being provided",
        BookingStatus.COMPLETED: "Service completed successfully",
        BookingStatus.CANCELLED: "Booking cancelled before service",
        BookingStatus.NO_SHOW: "Customer did not show up for appointment",
        BookingStatus.RESCHEDULED: "Booking has been rescheduled",
        BookingStatus.REFUNDED: "Payment has been refunded to customer"
    },
    "payment": {
        PaymentStatus.PENDING: "Payment initiated, waiting for processing",
        PaymentStatus.PROCESSING: "Payment being processed by gateway",
        PaymentStatus.COMPLETED: "Payment successfully completed",
        PaymentStatus.FAILED: "Payment failed due to error",
        PaymentStatus.CANCELLED: "Payment cancelled by user",
        PaymentStatus.REFUNDED: "Full refund processed",
        PaymentStatus.PARTIALLY_REFUNDED: "Partial refund processed",
        PaymentStatus.DISPUTED: "Payment disputed by customer",
        PaymentStatus.EXPIRED: "Payment session expired"
    },
    "verification": {
        VerificationStatus.PENDING: "Verification documents submitted",
        VerificationStatus.IN_REVIEW: "Documents under review",
        VerificationStatus.VERIFIED: "Successfully verified",
        VerificationStatus.REJECTED: "Verification rejected",
        VerificationStatus.EXPIRED: "Verification expired",
        VerificationStatus.SUSPENDED: "Verification suspended"
    }
}