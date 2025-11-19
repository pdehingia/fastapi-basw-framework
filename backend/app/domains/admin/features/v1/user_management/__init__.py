"""Unified User Management module with sub-routers for admins, customers, and providers."""

from fastapi import APIRouter

# Import from subdirectories
from .admins import api as admin_management_api
from .customers import api as customer_management_api
from .providers import api as provider_management_api

# Create unified router
router = APIRouter(prefix="/user-management", tags=["User Management"])

# Create sub-routers
admin_router = APIRouter(prefix="/admins", tags=["Admin Management"])
customer_router = APIRouter(prefix="/customers", tags=["Customer Management"])
provider_router = APIRouter(prefix="/providers", tags=["Provider Management"])

# Copy routes
admin_router.routes = admin_management_api.router.routes
customer_router.routes = customer_management_api.router.routes
provider_router.routes = provider_management_api.router.routes

# Include all sub-routers
router.include_router(admin_router)
router.include_router(customer_router)
router.include_router(provider_router)

__all__ = ["router"]
