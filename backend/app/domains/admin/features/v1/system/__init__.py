"""Unified System module with sub-routers for configuration, notifications, feature flags, and OTP."""

from fastapi import APIRouter

# Import from subdirectories
from .configuration import api as system_config_api
from .notifications import api as system_notifications_api
from .feature_flags import api as feature_flags_api
from .otp import api as otp_management_api

# Create unified router
router = APIRouter(prefix="/system", tags=["System"])

# Create sub-routers
config_router = APIRouter(prefix="/configuration", tags=["System Configuration"])
notifications_router = APIRouter(prefix="/notifications", tags=["System Notifications"])
flags_router = APIRouter(prefix="/feature-flags", tags=["Feature Flags"])
otp_router = APIRouter(prefix="/otp", tags=["OTP Management"])

# Copy routes
config_router.routes = system_config_api.router.routes
notifications_router.routes = system_notifications_api.router.routes
flags_router.routes = feature_flags_api.router.routes
otp_router.routes = otp_management_api.router.routes

# Include all sub-routers
router.include_router(config_router)
router.include_router(notifications_router)
router.include_router(flags_router)
router.include_router(otp_router)

__all__ = ["router"]
