"""Admin domain router with feature-based architecture and versioning."""

from fastapi import APIRouter

from app.domains.admin.features.v1 import (
    auth_router,
    user_management_router,
    business_operations_router,
    content_management_router,
    analytics_router,
    academy_management_router,
    services_router,
    user_sessions_router,
    audit_logs_router,
    campaigns_router,
    # marketing_router,  # TODO: Fix import paths
    # system_router  # TODO: Fix import paths
)

# Create admin domain router with v1 prefix
admin_router = APIRouter(prefix="/admin/v1", tags=["admin-v1"])

# Include all v1 feature routers
admin_router.include_router(auth_router)
admin_router.include_router(user_management_router)
admin_router.include_router(business_operations_router)
admin_router.include_router(content_management_router)
admin_router.include_router(analytics_router)
admin_router.include_router(academy_management_router)
admin_router.include_router(services_router)
admin_router.include_router(user_sessions_router)
admin_router.include_router(audit_logs_router)
admin_router.include_router(campaigns_router)
# admin_router.include_router(marketing_router)  # TODO: Fix import paths
# admin_router.include_router(system_router)  # TODO: Fix import paths

__all__ = ["admin_router"]