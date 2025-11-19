"""Admin domain router with feature-based architecture and versioning."""

from fastapi import APIRouter

from app.domains.admin.features.v1 import (
    auth_router,
    user_management_router,
    business_operations_router,
    business_management_router,
    review_management_router,
    artist_verification_router,
    support_management_router,
    analytics_reports_router,
    academy_management_router,
    roles_permissions_router,
    course_management_router,
    user_sessions_router,
    audit_logs_router,
    campaigns_router,
    marketing_router,
    system_router,
    platform_analytics_router
)

# Create admin domain router with v1 prefix
admin_router = APIRouter(prefix="/admin/v1", tags=["admin-v1"])

# Include all v1 feature routers
admin_router.include_router(auth_router)
admin_router.include_router(user_management_router)
admin_router.include_router(business_operations_router)
admin_router.include_router(business_management_router)
admin_router.include_router(review_management_router)
admin_router.include_router(artist_verification_router)
admin_router.include_router(support_management_router)
admin_router.include_router(analytics_reports_router)
admin_router.include_router(academy_management_router)
admin_router.include_router(roles_permissions_router)
admin_router.include_router(course_management_router)
admin_router.include_router(user_sessions_router)
admin_router.include_router(audit_logs_router)
admin_router.include_router(campaigns_router)
admin_router.include_router(marketing_router)
admin_router.include_router(system_router)
admin_router.include_router(platform_analytics_router)

__all__ = ["admin_router"]