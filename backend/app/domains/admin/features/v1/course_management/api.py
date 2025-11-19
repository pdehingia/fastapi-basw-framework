"""
FastAPI router for Course Management
"""

from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.exceptions import NotFoundException, ConflictException

from .schemas import (
    CourseCreate,
    CourseUpdate,
    CourseResponse,
    CourseListResponse,
    CourseFilters,
    CourseStatistics,
    AcademyCourseCreate,
    AcademyCourseUpdate,
    AcademyCourseResponse,
    AcademyCourseDetailResponse,
    AcademyCourseListResponse,
    AcademyCourseFilters,
    AcademyCourseToggleAvailability,
    BulkAcademyCourseCreate,
    BulkAcademyCourseResponse,
)
from .service import CourseService, AcademyCourseService


router = APIRouter(prefix="/courses", tags=["Course Management"])


# ============================================================================
# Course Endpoints
# ============================================================================

@router.post(
    "",
    response_model=CourseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new course",
    description="Create a new course in the master catalog"
)
def create_course(
    course_data: CourseCreate,
    db: Session = Depends(get_db)
):
    """Create a new course"""
    return CourseService.create_course(db, course_data)


@router.get(
    "",
    response_model=CourseListResponse,
    summary="Get all courses",
    description="Get paginated list of courses with optional filters"
)
def get_courses(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    category: Optional[str] = Query(None, description="Filter by category"),
    level: Optional[str] = Query(None, description="Filter by level"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    is_featured: Optional[bool] = Query(None, description="Filter by featured status"),
    search: Optional[str] = Query(None, description="Search in name, code, description"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    db: Session = Depends(get_db)
):
    """Get all courses with filters and pagination"""
    filters = CourseFilters(
        category=category,
        level=level,
        is_active=is_active,
        is_featured=is_featured,
        search=search
    )
    
    courses, total = CourseService.get_courses(
        db,
        filters=filters,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order
    )
    
    total_pages = (total + page_size - 1) // page_size
    
    return CourseListResponse(
        items=courses,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get(
    "/{course_id}",
    response_model=CourseResponse,
    summary="Get course by ID",
    description="Get detailed information about a specific course"
)
def get_course(
    course_id: UUID,
    db: Session = Depends(get_db)
):
    """Get course by ID"""
    return CourseService.get_course(db, course_id)


@router.put(
    "/{course_id}",
    response_model=CourseResponse,
    summary="Update course",
    description="Update course details"
)
def update_course(
    course_id: UUID,
    course_data: CourseUpdate,
    db: Session = Depends(get_db)
):
    """Update course"""
    return CourseService.update_course(db, course_id, course_data)


@router.delete(
    "/{course_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete course",
    description="Delete a course (soft delete if in use by academies)"
)
def delete_course(
    course_id: UUID,
    db: Session = Depends(get_db)
):
    """Delete course"""
    CourseService.delete_course(db, course_id)
    return None


@router.get(
    "/metadata/categories",
    response_model=List[str],
    summary="Get course categories",
    description="Get list of unique course categories"
)
def get_course_categories(db: Session = Depends(get_db)):
    """Get all unique course categories"""
    return CourseService.get_course_categories(db)


@router.get(
    "/metadata/levels",
    response_model=List[str],
    summary="Get course levels",
    description="Get list of unique course levels"
)
def get_course_levels(db: Session = Depends(get_db)):
    """Get all unique course levels"""
    return CourseService.get_course_levels(db)


@router.get(
    "/statistics/overview",
    response_model=CourseStatistics,
    summary="Get course statistics",
    description="Get comprehensive statistics about courses"
)
def get_course_statistics(db: Session = Depends(get_db)):
    """Get course statistics"""
    return CourseService.get_course_statistics(db)


# ============================================================================
# Academy Course Endpoints
# ============================================================================

@router.post(
    "/academy-courses",
    response_model=AcademyCourseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add course to academy",
    description="Add a course to an academy's offerings"
)
def add_course_to_academy(
    academy_course_data: AcademyCourseCreate,
    db: Session = Depends(get_db)
):
    """Add a course to an academy"""
    return AcademyCourseService.add_course_to_academy(db, academy_course_data)


@router.get(
    "/academy-courses",
    response_model=AcademyCourseListResponse,
    summary="Get academy courses",
    description="Get paginated list of academy courses with filters"
)
def get_academy_courses(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    academy_id: Optional[UUID] = Query(None, description="Filter by academy"),
    course_id: Optional[UUID] = Query(None, description="Filter by course"),
    is_available: Optional[bool] = Query(None, description="Filter by availability"),
    category: Optional[str] = Query(None, description="Filter by course category"),
    level: Optional[str] = Query(None, description="Filter by course level"),
    db: Session = Depends(get_db)
):
    """Get all academy courses with filters"""
    filters = AcademyCourseFilters(
        academy_id=academy_id,
        course_id=course_id,
        is_available=is_available,
        category=category,
        level=level
    )
    
    academy_courses, total = AcademyCourseService.get_academy_courses(
        db,
        filters=filters,
        page=page,
        page_size=page_size
    )
    
    total_pages = (total + page_size - 1) // page_size
    
    return AcademyCourseListResponse(
        items=academy_courses,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.put(
    "/academy-courses/{academy_course_id}",
    response_model=AcademyCourseResponse,
    summary="Update academy course",
    description="Update academy-specific course details"
)
def update_academy_course(
    academy_course_id: UUID,
    update_data: AcademyCourseUpdate,
    db: Session = Depends(get_db)
):
    """Update academy course details"""
    return AcademyCourseService.update_academy_course(db, academy_course_id, update_data)


@router.delete(
    "/academy-courses/{academy_course_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove course from academy",
    description="Remove a course from an academy's offerings"
)
def remove_course_from_academy(
    academy_course_id: UUID,
    db: Session = Depends(get_db)
):
    """Remove course from academy"""
    AcademyCourseService.remove_course_from_academy(db, academy_course_id)
    return None


@router.patch(
    "/academy-courses/{academy_course_id}/availability",
    response_model=AcademyCourseResponse,
    summary="Toggle course availability",
    description="Toggle course availability for enrollment"
)
def toggle_course_availability(
    academy_course_id: UUID,
    availability_data: AcademyCourseToggleAvailability,
    db: Session = Depends(get_db)
):
    """Toggle course availability for enrollment"""
    return AcademyCourseService.toggle_course_availability(
        db,
        academy_course_id,
        availability_data.is_available
    )


@router.post(
    "/academy-courses/bulk",
    response_model=BulkAcademyCourseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Bulk add courses to academy",
    description="Add multiple courses to an academy at once"
)
def bulk_add_courses_to_academy(
    bulk_data: BulkAcademyCourseCreate,
    db: Session = Depends(get_db)
):
    """Bulk add courses to academy"""
    result = AcademyCourseService.bulk_add_courses_to_academy(db, bulk_data)
    return BulkAcademyCourseResponse(
        created_count=result["created_count"],
        skipped_count=result["skipped_count"],
        created_academy_courses=result["created_academy_courses"],
        skipped_course_ids=result["skipped_course_ids"]
    )
