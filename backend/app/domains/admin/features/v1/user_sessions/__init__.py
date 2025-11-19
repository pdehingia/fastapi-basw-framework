"""Unified User Sessions module with sub-routers for admin, provider, and customer sessions."""

from fastapi import APIRouter

# Import from subdirectories
from .admin import api as admin_sessions_api
from .provider import api as provider_sessions_api
from .customer import api as customer_sessions_api

# Create unified router
router = APIRouter(prefix="/user-sessions", tags=["User Sessions"])

# Create sub-routers with modified prefixes
admin_router = APIRouter(prefix="/admins", tags=["Admin User Sessions"])
provider_router = APIRouter(prefix="/providers", tags=["Provider User Sessions"])
customer_router = APIRouter(prefix="/customers", tags=["Customer User Sessions"])

# Copy routes from original routers
admin_router.routes = admin_sessions_api.router.routes
provider_router.routes = provider_sessions_api.router.routes
customer_router.routes = customer_sessions_api.router.routes

# Include all sub-routers
router.include_router(admin_router)
router.include_router(provider_router)
router.include_router(customer_router)

__all__ = ["router"]
