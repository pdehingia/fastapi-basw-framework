"""Unified Content Management module with sub-routers for courses, businesses, and reviews."""

from fastapi import APIRouter

# Import from subdirectories
from .courses import api as course_management_api
from .businesses import api as business_management_api
from .reviews import api as review_management_api

# Create unified router
router = APIRouter(prefix="/content-management", tags=["Content Management"])

# Create sub-routers
courses_router = APIRouter(prefix="/courses", tags=["Course Management"])
businesses_router = APIRouter(prefix="/businesses", tags=["Business Management"])
reviews_router = APIRouter(prefix="/reviews", tags=["Review Management"])

# Copy routes
courses_router.routes = course_management_api.router.routes
businesses_router.routes = business_management_api.router.routes
reviews_router.routes = review_management_api.router.routes

# Include all sub-routers
router.include_router(courses_router)
router.include_router(businesses_router)
router.include_router(reviews_router)

__all__ = ["router"]
