"""
Pydantic schemas for Course Management
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Dict, Any
from uuid import UUID

from pydantic import BaseModel, Field, validator


# ============================================================================
# Course Schemas
# ============================================================================

class CourseBase(BaseModel):
    """Base schema for Course"""
    course_name: str = Field(..., max_length=255, description="Course name")
    course_slug: str = Field(..., max_length=255, description="URL-friendly slug")
    course_code: Optional[str] = Field(None, max_length=60, description="Unique course code")
    category: str = Field(..., max_length=100, description="Course category")
    level: str = Field(..., max_length=50, description="Course level (beginner/intermediate/advanced)")
    short_description: Optional[str] = Field(None, description="Brief course description")
    full_description: Optional[str] = Field(None, description="Detailed course description")
    duration_months: int = Field(..., gt=0, description="Course duration in months")
    total_hours: Optional[int] = Field(None, gt=0, description="Total course hours")
    syllabus: Optional[Dict[str, Any]] = Field(None, description="Course syllabus and modules")
    suggested_fees_min: Optional[Decimal] = Field(None, ge=0, description="Minimum suggested fee")
    suggested_fees_max: Optional[Decimal] = Field(None, ge=0, description="Maximum suggested fee")
    image_url: Optional[str] = Field(None, description="Course image URL")
    brochure_url: Optional[str] = Field(None, description="Course brochure URL")
    is_active: bool = Field(True, description="Course is active")
    is_featured: bool = Field(False, description="Course is featured")

    @validator('level')
    def validate_level(cls, v):
        allowed_levels = ['beginner', 'intermediate', 'advanced']
        if v.lower() not in allowed_levels:
            raise ValueError(f"Level must be one of: {', '.join(allowed_levels)}")
        return v.lower()

    @validator('suggested_fees_max')
    def validate_fees_range(cls, v, values):
        if v is not None and 'suggested_fees_min' in values and values['suggested_fees_min'] is not None:
            if v < values['suggested_fees_min']:
                raise ValueError("suggested_fees_max must be greater than or equal to suggested_fees_min")
        return v


class CourseCreate(CourseBase):
    """Schema for creating a new course"""
    pass


class CourseUpdate(BaseModel):
    """Schema for updating a course"""
    course_name: Optional[str] = Field(None, max_length=255)
    course_slug: Optional[str] = Field(None, max_length=255)
    course_code: Optional[str] = Field(None, max_length=60)
    category: Optional[str] = Field(None, max_length=100)
    level: Optional[str] = Field(None, max_length=50)
    short_description: Optional[str] = None
    full_description: Optional[str] = None
    duration_months: Optional[int] = Field(None, gt=0)
    total_hours: Optional[int] = Field(None, gt=0)
    syllabus: Optional[Dict[str, Any]] = None
    suggested_fees_min: Optional[Decimal] = Field(None, ge=0)
    suggested_fees_max: Optional[Decimal] = Field(None, ge=0)
    image_url: Optional[str] = None
    brochure_url: Optional[str] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None

    @validator('level')
    def validate_level(cls, v):
        if v is not None:
            allowed_levels = ['beginner', 'intermediate', 'advanced']
            if v.lower() not in allowed_levels:
                raise ValueError(f"Level must be one of: {', '.join(allowed_levels)}")
            return v.lower()
        return v


class CourseResponse(CourseBase):
    """Schema for course response"""
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CourseListResponse(BaseModel):
    """Schema for paginated course list"""
    items: List[CourseResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class CourseCategoryStats(BaseModel):
    """Statistics for a course category"""
    category: str
    total_courses: int
    active_courses: int
    featured_courses: int


class CourseLevelStats(BaseModel):
    """Statistics for a course level"""
    level: str
    total_courses: int
    active_courses: int


class CourseStatistics(BaseModel):
    """Overall course statistics"""
    total_courses: int
    active_courses: int
    inactive_courses: int
    featured_courses: int
    by_category: List[CourseCategoryStats]
    by_level: List[CourseLevelStats]


# ============================================================================
# Academy Course Schemas
# ============================================================================

class AcademyCourseBase(BaseModel):
    """Base schema for AcademyCourse"""
    academy_id: UUID = Field(..., description="Academy ID")
    course_id: UUID = Field(..., description="Course ID")
    actual_fees: Optional[Decimal] = Field(None, ge=0, description="Actual course fees")
    actual_duration_months: Optional[int] = Field(None, gt=0, description="Actual duration in months")
    batch_size_limit: Optional[int] = Field(None, gt=0, description="Maximum batch size")
    is_available: bool = Field(True, description="Course is available for enrollment")
    schedule_info: Optional[Dict[str, Any]] = Field(None, description="Class schedule information")


class AcademyCourseCreate(AcademyCourseBase):
    """Schema for adding a course to an academy"""
    pass


class AcademyCourseUpdate(BaseModel):
    """Schema for updating academy course details"""
    actual_fees: Optional[Decimal] = Field(None, ge=0)
    actual_duration_months: Optional[int] = Field(None, gt=0)
    batch_size_limit: Optional[int] = Field(None, gt=0)
    is_available: Optional[bool] = None
    schedule_info: Optional[Dict[str, Any]] = None


class AcademyCourseResponse(AcademyCourseBase):
    """Schema for academy course response"""
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AcademyCourseDetailResponse(AcademyCourseResponse):
    """Schema for academy course with course details"""
    course_name: str
    course_slug: str
    course_category: str
    course_level: str
    course_duration_months: int


class AcademyCourseListResponse(BaseModel):
    """Schema for paginated academy course list"""
    items: List[AcademyCourseDetailResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class AcademyCourseToggleAvailability(BaseModel):
    """Schema for toggling course availability"""
    is_available: bool = Field(..., description="Set course availability status")


class BulkAcademyCourseCreate(BaseModel):
    """Schema for adding multiple courses to an academy"""
    academy_id: UUID
    course_ids: List[UUID] = Field(..., min_items=1, description="List of course IDs to add")
    default_is_available: bool = Field(True, description="Default availability status")


class BulkAcademyCourseResponse(BaseModel):
    """Response for bulk academy course creation"""
    created_count: int
    skipped_count: int
    created_academy_courses: List[AcademyCourseResponse]
    skipped_course_ids: List[UUID]


# ============================================================================
# Filter and Query Schemas
# ============================================================================

class CourseFilters(BaseModel):
    """Filters for course queries"""
    category: Optional[str] = None
    level: Optional[str] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    search: Optional[str] = Field(None, description="Search in name, code, description")
    min_duration_months: Optional[int] = Field(None, gt=0)
    max_duration_months: Optional[int] = Field(None, gt=0)
    min_fees: Optional[Decimal] = Field(None, ge=0)
    max_fees: Optional[Decimal] = Field(None, ge=0)


class AcademyCourseFilters(BaseModel):
    """Filters for academy course queries"""
    academy_id: Optional[UUID] = None
    course_id: Optional[UUID] = None
    is_available: Optional[bool] = None
    category: Optional[str] = Field(None, description="Filter by course category")
    level: Optional[str] = Field(None, description="Filter by course level")
