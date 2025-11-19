"""Admin domain router with feature-based architecture and versioning."""

from fastapi import APIRouter

from app.domains.admin.features.v1 import (
    auth_router,
    booking_management_router,
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
    marketing_management_router,
    academy_student_management_router,
    roles_permissions_router,
    subscription_management_router,
    address_management_router,
    course_management_router,
    otp_management_router,
    provider_user_sessions_router
    # Note: salon_provider_management is now a sub-router of provider_management
)

# Create admin domain router with v1 prefix
admin_router = APIRouter(prefix="/admin/v1", tags=["admin-v1"])

# Include all v1 feature routers
admin_router.include_router(auth_router)
admin_router.include_router(booking_management_router)
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
admin_router.include_router(academy_student_management_router)
admin_router.include_router(roles_permissions_router)
admin_router.include_router(subscription_management_router)
admin_router.include_router(address_management_router)
admin_router.include_router(course_management_router)
admin_router.include_router(otp_management_router)
admin_router.include_router(provider_user_sessions_router)
# Note: salon_provider_management is now included as sub-router in provider_management

__all__ = ["admin_router"]