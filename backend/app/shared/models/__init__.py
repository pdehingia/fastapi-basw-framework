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
from app.shared.models.admission_inquiry import AdmissionInquiry
from app.shared.models.user_segment import UserSegment
from app.shared.models.email_template import EmailTemplate
from app.shared.models.email_campaign import EmailCampaign
from app.shared.models.sms_campaign import SMSCampaign
from app.shared.models.role import Role
from app.shared.models.permission import Permission
from app.shared.models.role_permission import RolePermission
from app.shared.models.feature_flag import FeatureFlag
from app.shared.models.system_notification import (
    SystemNotification,
    NotificationType,
    NotificationPriority,
    TargetAudience
)
from app.shared.models.platform_analytic import PlatformAnalytic, MetricPeriod
from app.shared.models.academy_performance import AcademyPerformance

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
    "AdmissionInquiry",
    "UserSegment",
    "EmailTemplate",
    "EmailCampaign",
    "SMSCampaign",
    # RBAC models
    "Role",
    "Permission",
    "RolePermission",
    # OTP model
    "OTPVerification",
    # Feature management
    "FeatureFlag",
    "SystemNotification",
    # Analytics models
    "PlatformAnalytic",
    "AcademyPerformance",
    # Enums
    "UserTypeEnum",
    "MetricPeriod",
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
    "TransactionStatusEnum",
    "NotificationType",
    "NotificationPriority",
    "TargetAudience"
]