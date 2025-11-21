"""Unified User Management module with sub-routers for admins, customers, and providers."""

from fastapi import APIRouter

# Import from subdirectories
from .admins import api as admin_management_api
from .customers import api as customer_management_api
from .providers import api as provider_management_api

# Create unified router
router = APIRouter(prefix="/users", tags=["User Management"])

# Include all sub-routers with appropriate prefixes
router.include_router(admin_management_api.router)
router.include_router(customer_management_api.router, prefix="/customers")
router.include_router(provider_management_api.router, prefix="/providers")

__all__ = ["router"]
