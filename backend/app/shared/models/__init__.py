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
    "AdStatus"
]