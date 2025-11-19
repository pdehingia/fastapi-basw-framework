"""Unified Academy Management module with sub-routers for students and performance."""

from fastapi import APIRouter

# Import from original modules
from ..academy_student_management import api as students_api
from ..academy_performance import api as performance_api

# Create unified router
router = APIRouter(prefix="/academy-management", tags=["Academy Management"])

# Create sub-routers with modified prefixes
students_router = APIRouter(prefix="/students", tags=["Academy Students"])
performance_router = APIRouter(prefix="/performance", tags=["Academy Performance"])

# Copy routes from original routers
students_router.routes = students_api.router.routes
performance_router.routes = performance_api.router.routes

# Include all sub-routers
router.include_router(students_router)
router.include_router(performance_router)

__all__ = ["router"]
