"""
Shared models initialization.
"""

from app.shared.models.base import BaseModel, TimestampMixin
from app.shared.models.user import (
    AdminUser, 
    ProviderUser,
    CustomerUser,
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
    DiscountType
)

__all__ = [
    "BaseModel",
    "TimestampMixin", 
    "AdminUser",
    "ProviderUser", 
    "CustomerUser",
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
    "TicketMessage",
    "CannedResponse",
    "Wallet",
    "Transaction",
    "PromoCode",
    # Enums
    "UserTypeEnum",
    "TicketPriority",
    "TicketStatus",
    "SenderType",
    "WalletUserType",
    "TransactionType",
    "TransactionStatus",
    "DiscountType"
]