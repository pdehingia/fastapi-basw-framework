"""Admin domain API v1 features."""

from .auth import auth_router
from .booking_management import booking_management_router  
from .customer_management import customer_management_router
from .provider_management import provider_management_router
from .business_management import business_management_router
from .payment_management import payment_management_router
from .review_management import review_management_router
from .artist_verification import artist_verification_router
from .support_management import support_management_router
from .promotions_marketing import promotions_marketing_router
from .analytics_reports import analytics_reports_router
from .system_configuration import system_configuration_router
from .admin_user_management import admin_user_management_router
from .financial_management import financial_management_router
from .marketing_management import marketing_management_router
from .academy_management import router as academy_management_router
from .roles_permissions import roles_permissions_router
from .subscription_management import subscription_management_router
from .address_management import address_management_router
from .course_management import router as course_management_router
from .otp_management import otp_management_router
from .user_sessions import router as user_sessions_router
from .audit_logs import router as audit_logs_router
from .ppc_campaigns import ppc_campaigns_router
from .admission_inquiries import admission_inquiries_router
from .user_segments import user_segments_router
from .campaigns import router as campaigns_router
from .feature_flags import router as feature_flags_router
from .system_notifications import router as system_notifications_router
from .platform_analytics import platform_analytics_router

__all__ = [
    "auth_router", 
    "booking_management_router", 
    "customer_management_router",
    "provider_management_router",  # Now includes salon-providers & business details as sub-routers
    "business_management_router",
    "payment_management_router",
    "review_management_router",
    "artist_verification_router",
    "support_management_router",
    "promotions_marketing_router",
    "analytics_reports_router",
    "system_configuration_router",
    "admin_user_management_router",
    "financial_management_router",
    "marketing_management_router",
    "academy_management_router",
    "roles_permissions_router",
    "subscription_management_router",
    "address_management_router",
    "course_management_router",
    "otp_management_router",
    "user_sessions_router",
    "audit_logs_router",
    "ppc_campaigns_router",
    "admission_inquiries_router",
    "user_segments_router",
    "campaigns_router",
    "feature_flags_router",
    "system_notifications_router",
    "platform_analytics_router"
]