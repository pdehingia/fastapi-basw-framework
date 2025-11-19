"""
Dependency injection for Course Management
"""

from typing import Optional
from uuid import UUID

from fastapi import Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db

from .schemas import CourseFilters, AcademyCourseFilters


def get_course_filters(
    category: Optional[str] = Query(None),
    level: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    is_featured: Optional[bool] = Query(None),
    search: Optional[str] = Query(None)
) -> CourseFilters:
    """Dependency to extract course filters from query params"""
    return CourseFilters(
        category=category,
        level=level,
        is_active=is_active,
        is_featured=is_featured,
        search=search
    )


def get_academy_course_filters(
    academy_id: Optional[UUID] = Query(None),
    course_id: Optional[UUID] = Query(None),
    is_available: Optional[bool] = Query(None),
    category: Optional[str] = Query(None),
    level: Optional[str] = Query(None)
) -> AcademyCourseFilters:
    """Dependency to extract academy course filters from query params"""
    return AcademyCourseFilters(
        academy_id=academy_id,
        course_id=course_id,
        is_available=is_available,
        category=category,
        level=level
    )
