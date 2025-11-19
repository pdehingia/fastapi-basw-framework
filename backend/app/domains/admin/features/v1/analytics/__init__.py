"""Unified Analytics module with sub-routers for reports and platform analytics."""

from fastapi import APIRouter

# Import from subdirectories
from .reports import api as analytics_reports_api
from .platform import api as platform_analytics_api

# Create unified router
router = APIRouter(prefix="/analytics", tags=["Analytics"])

# Create sub-routers
reports_router = APIRouter(prefix="/reports", tags=["Analytics Reports"])
platform_router = APIRouter(prefix="/platform", tags=["Platform Analytics"])

# Copy routes
reports_router.routes = analytics_reports_api.router.routes
platform_router.routes = platform_analytics_api.router.routes

# Include all sub-routers
router.include_router(reports_router)
router.include_router(platform_router)

__all__ = ["router"]
