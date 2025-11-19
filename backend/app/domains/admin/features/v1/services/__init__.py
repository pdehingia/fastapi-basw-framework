"""Unified Services module with sub-routers for verification, support, and roles/permissions."""

from fastapi import APIRouter

# Import from subdirectories
from .verification import api as artist_verification_api
from .support import api as support_management_api
from .roles_permissions import api as roles_permissions_api

# Create unified router
router = APIRouter(prefix="/services", tags=["Services"])

# Create sub-routers
verification_router = APIRouter(prefix="/verification", tags=["Artist Verification"])
support_router = APIRouter(prefix="/support", tags=["Support Management"])
roles_router = APIRouter(prefix="/roles-permissions", tags=["Roles & Permissions"])

# Copy routes
verification_router.routes = artist_verification_api.router.routes
support_router.routes = support_management_api.router.routes
roles_router.routes = roles_permissions_api.router.routes

# Include all sub-routers
router.include_router(verification_router)
router.include_router(support_router)
router.include_router(roles_router)

__all__ = ["router"]
