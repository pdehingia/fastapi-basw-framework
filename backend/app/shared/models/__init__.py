"""
Shared models initialization.
"""

from app.shared.models.base import BaseModel, TimestampMixin
from app.shared.models.user import (
    AdminUser, 
    ProviderUser,
    CustomerUser,
    AdminUserSession,
    CustomerUserSession,
    AdminAuditLog,
    ProviderAuditLog,
    CustomerAuditLog
)
from app.shared.models.booking import (
    Booking,
    BookingStatus,
    PaymentStatus,
    CancelledBy,
    Review,
    ModerationStatus,
    SupportTicket,
    SupportTicketMessage,  # Changed from TicketMessage
    CannedResponse,
    Wallet,
    Transaction,
    PromoCode,
    UserTypeEnum,
    TicketPriority,
    TicketStatus,
    SenderType,
    WalletUserType,
    TransactionType,
    TransactionStatus,
    DiscountType,
    BankAccount,
    WalletTransaction,
    WalletTransactionType,
    Referral,
    ReferralStatus,
    Ad,
    AdType,
    AdStatus
)
from app.shared.models.subscription import (
    Subscription,
    SubscriptionPayment,
    SubscriptionPlanEnum,
    SubscriptionStatusEnum,
    TransactionStatusEnum
)
from app.shared.models.address import Address
from app.shared.models.provider_business import ProviderBusinessDetail, ProviderSalon
from app.shared.models.otp import OTPVerification
from app.shared.models.provider_session import ProviderUserSession
from app.shared.models.activity_log import UserActivityLog
from app.shared.models.ppc_campaign import PPCCampaign

__all__ = [
    "BaseModel",
    "TimestampMixin", 
    "AdminUser",
    "ProviderUser", 
    "CustomerUser",
    "AdminUserSession",
    "CustomerUserSession",
    "AdminAuditLog",
    "ProviderAuditLog",
    "CustomerAuditLog",
    # Business models
    "Booking",
    "BookingStatus",
    "PaymentStatus",
    "CancelledBy",
    "Review",
    "ModerationStatus",
    "SupportTicket",
    "SupportTicketMessage",
    "CannedResponse",
    "Wallet",
    "Transaction",
    "PromoCode",
    "BankAccount",
    "WalletTransaction",
    "Referral",
    "Ad",
    # Subscription models
    "Subscription",
    "SubscriptionPayment",
    # Address model
    "Address",
    # Provider business models
    "ProviderBusinessDetail",
    "ProviderSalon",
    # Session models
    "ProviderUserSession",
    # Activity log model
    "UserActivityLog",
    # Marketing models
    "PPCCampaign",
    # OTP model
    "OTPVerification",
    # Enums
    "UserTypeEnum",
    "TicketPriority",
    "TicketStatus",
    "SenderType",
    "WalletUserType",
    "WalletTransactionType",
    "TransactionType",
    "TransactionStatus",
    "DiscountType",
    "ReferralStatus",
    "AdType",
    "AdStatus",
    "SubscriptionPlanEnum",
    "SubscriptionStatusEnum",
    "TransactionStatusEnum"
]