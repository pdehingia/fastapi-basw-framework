"""Unified Analytics module with sub-routers for reports and platform analytics."""

from fastapi import APIRouter

# Import from subdirectories
from .reports import api as analytics_reports_api
from .platform import api as platform_analytics_api

# Create unified router
router = APIRouter(prefix="/analytics", tags=["Analytics"])

# Include all sub-routers with proper prefixes
router.include_router(analytics_reports_api.router)
router.include_router(platform_analytics_api.router, prefix="/platform", tags=["Platform Analytics"])

__all__ = ["router"]
