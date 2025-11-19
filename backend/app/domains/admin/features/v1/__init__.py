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

__all__ = [
    "auth_router", 
    "booking_management_router", 
    "customer_management_router",
    "provider_management_router",
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
    "marketing_management_router"
]