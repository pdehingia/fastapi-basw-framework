"""
Admin Domain Router with Constants Refactored

Example of how to use the new constants system in routers.
This demonstrates the before and after of using constants.
"""

from fastapi import APIRouter

# Import the new constants
from app.shared.constants import (
    API_PREFIXES, 
    API_TAGS
)

from app.domains.admin.features.v1 import (
    auth_router,
    booking_management_router,
    user_management_router,
    customer_management_router,
    provider_management_router,
    business_management_router,
    payment_management_router,
    review_management_router,
    artist_verification_router,
    support_management_router,
    promotions_marketing_router,
    analytics_reports_router,
    system_configuration_router,
    admin_user_management_router,
    financial_management_router,
    marketing_management_router
)

# REFACTORED: Use constants instead of hardcoded strings
admin_router = APIRouter(
    prefix=API_PREFIXES.ADMIN_V1,  # Instead of "/admin/v1"
    tags=[API_TAGS.ADMIN]          # Instead of ["admin-v1"]
)

# Include all v1 feature routers
admin_router.include_router(auth_router)
admin_router.include_router(booking_management_router)
admin_router.include_router(user_management_router)
admin_router.include_router(customer_management_router)
admin_router.include_router(provider_management_router)
admin_router.include_router(business_management_router)
admin_router.include_router(payment_management_router)
admin_router.include_router(review_management_router)
admin_router.include_router(artist_verification_router)
admin_router.include_router(support_management_router)
admin_router.include_router(promotions_marketing_router)
admin_router.include_router(analytics_reports_router)
admin_router.include_router(system_configuration_router)
admin_router.include_router(admin_user_management_router)
admin_router.include_router(financial_management_router)
admin_router.include_router(marketing_management_router)

__all__ = ["admin_router"]

"""
REFACTORING NOTES:

BEFORE:
- admin_router = APIRouter(prefix="/admin/v1", tags=["admin-v1"])

AFTER:
- admin_router = APIRouter(prefix=API_PREFIXES.ADMIN_V1, tags=[API_TAGS.ADMIN])

BENEFITS:
1. Single source of truth for API prefixes
2. IDE autocompletion helps prevent typos
3. Easy to change all admin routes by updating one constant
4. Consistent naming across the application
5. Better maintainability and refactoring support
"""