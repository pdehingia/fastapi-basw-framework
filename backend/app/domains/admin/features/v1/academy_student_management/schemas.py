"""
Academy student management schemas for admin domain.
Comprehensive CRUD and oversight operations for academy students.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, date
from uuid import UUID
from enum import Enum

from pydantic import BaseModel, Field, ConfigDict

from app.shared.schemas.base import BaseSchema, BaseResponse


class RegistrationStatus(str, Enum):
    """Academy student registration status options."""
    PENDING = "pending"
    INVITED = "invited"
    REGISTERED = "registered"
    ACTIVE = "active"
    GRADUATED = "graduated"
    DROPPED_OUT = "dropped_out"
    SUSPENDED = "suspended"


class StudentType(str, Enum):
    """Student types."""
    REGULAR = "regular"
    SCHOLARSHIP = "scholarship"
    EXCHANGE = "exchange"
    PART_TIME = "part_time"
    FULL_TIME = "full_time"


# Academy student filtering and search schemas
class AcademyStudentFilterParams(BaseSchema):
    """Parameters for filtering academy students."""
    
    search: Optional[str] = Field(None, description="Search in course name, student name")
    academy_id: Optional[UUID] = None
    course_id: Optional[UUID] = None
    registration_status: Optional[RegistrationStatus] = None
    invitation_sent: Optional[bool] = None
    has_graduated: Optional[bool] = None
    enrolled_after: Optional[date] = None
    enrolled_before: Optional[date] = None
    graduation_after: Optional[date] = None
    graduation_before: Optional[date] = None
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
    sort_by: Optional[str] = Field("enrollment_date", pattern="^(enrollment_date|graduation_date|course_name|updated_at)$")
    sort_order: Optional[str] = Field("desc", pattern="^(asc|desc)$")


# Academy student CRUD schemas
class AcademyStudentCreate(BaseSchema):
    """Schema for creating academy students."""
    
    academy_id: UUID = Field(..., description="Academy ID")
    artist_user_id: UUID = Field(..., description="Artist/Provider user ID")
    course_id: Optional[UUID] = Field(None, description="Course ID")
    course_name: str = Field(..., min_length=2, max_length=255, description="Course name")
    enrollment_date: date = Field(..., description="Enrollment date")
    graduation_date: Optional[date] = Field(None, description="Expected/actual graduation date")
    maya_registration_status: RegistrationStatus = Field(RegistrationStatus.PENDING, description="Registration status")
    send_invitation: bool = Field(False, description="Send invitation immediately")
    student_photo_url: Optional[str] = Field(None, description="Student photo URL")
    notes: Optional[str] = Field(None, max_length=1000, description="Additional notes")


class AcademyStudentUpdate(BaseSchema):
    """Schema for updating academy students."""
    
    course_id: Optional[UUID] = None
    course_name: Optional[str] = Field(None, min_length=2, max_length=255)
    enrollment_date: Optional[date] = None
    graduation_date: Optional[date] = None
    maya_registration_status: Optional[RegistrationStatus] = None
    student_photo_url: Optional[str] = None
    certificate_url: Optional[str] = None
    notes: Optional[str] = Field(None, max_length=1000)


class AcademyStudentResponse(BaseSchema):
    """Schema for academy student responses."""
    
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    academy_id: UUID
    artist_user_id: UUID
    course_id: Optional[UUID]
    course_name: str
    enrollment_date: date
    graduation_date: Optional[date]
    maya_registration_status: RegistrationStatus
    invitation_sent: bool
    invitation_sent_at: Optional[datetime]
    student_photo_url: Optional[str]
    certificate_url: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    # Related data
    academy_name: Optional[str] = None
    student_name: Optional[str] = None
    student_email: Optional[str] = None
    student_phone: Optional[str] = None


class AcademyStudentDetailResponse(AcademyStudentResponse):
    """Extended academy student details with additional information."""
    
    # Academy information
    academy: Optional[Dict[str, Any]] = None
    
    # Student information
    student_profile: Optional[Dict[str, Any]] = None
    
    # Course information
    course_details: Optional[Dict[str, Any]] = None
    
    # Progress tracking
    progress_percentage: Optional[float] = Field(None, ge=0, le=100)
    attendance_percentage: Optional[float] = Field(None, ge=0, le=100)
    assignments_completed: Optional[int] = Field(None, ge=0)
    total_assignments: Optional[int] = Field(None, ge=0)
    
    # Performance metrics
    average_grade: Optional[float] = Field(None, ge=0, le=100)
    skills_acquired: List[str] = []
    certifications: List[Dict[str, Any]] = []
    
    # Additional information
    notes: Optional[str] = None
    last_activity: Optional[datetime] = None


# Academy student status management
class StudentStatusUpdate(BaseSchema):
    """Schema for updating student status."""
    
    status: RegistrationStatus
    reason: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = Field(None, max_length=1000)
    send_notification: bool = True
    update_graduation_date: bool = False
    graduation_date: Optional[date] = None


class StudentInvitation(BaseSchema):
    """Schema for sending student invitations."""
    
    student_ids: List[UUID] = Field(..., min_length=1, max_length=50)
    custom_message: Optional[str] = Field(None, max_length=1000)
    include_course_details: bool = True
    include_academy_info: bool = True


# Academy student statistics and analytics
class AcademyStudentStatistics(BaseSchema):
    """Academy student statistics for dashboard."""
    
    total_students: int
    active_students: int
    graduated_students: int
    pending_registration: int
    invited_students: int
    dropout_students: int
    new_enrollments_today: int
    new_enrollments_this_week: int
    new_enrollments_this_month: int
    enrollment_growth_percentage: float
    
    # Performance metrics
    average_completion_rate: float
    average_time_to_graduate: Optional[float]  # in days
    top_performing_academies: List[Dict[str, Any]] = []
    most_popular_courses: List[Dict[str, Any]] = []
    
    # Geographic and demographic distribution
    students_by_academy: List[Dict[str, Any]] = []
    students_by_course: List[Dict[str, Any]] = []
    enrollments_by_month: List[Dict[str, Any]] = []
    graduation_trend: List[Dict[str, Any]] = []


# Bulk operations
class BulkStudentAction(str, Enum):
    """Bulk action types for academy students."""
    SEND_INVITATION = "send_invitation"
    UPDATE_STATUS = "update_status"
    GRADUATE = "graduate"
    TRANSFER_COURSE = "transfer_course"
    SEND_NOTIFICATION = "send_notification"


class BulkStudentOperation(BaseSchema):
    """Schema for bulk academy student operations."""
    
    student_ids: List[UUID] = Field(..., min_length=1, max_length=100)
    action: BulkStudentAction
    reason: Optional[str] = Field(None, max_length=500)
    
    # Additional parameters for specific actions
    new_status: Optional[RegistrationStatus] = None  # For update_status action
    new_course_id: Optional[UUID] = None  # For transfer_course action
    graduation_date: Optional[date] = None  # For graduate action
    notification_message: Optional[str] = Field(None, max_length=1000)  # For send_notification action
    custom_invitation_message: Optional[str] = Field(None, max_length=1000)  # For send_invitation action


class BulkStudentOperationResponse(BaseResponse):
    """Response for bulk academy student operations."""
    
    processed: int
    successful: int
    failed: int
    errors: List[Dict[str, Any]] = []


# Progress and performance tracking
class StudentProgress(BaseSchema):
    """Schema for student progress tracking."""
    
    student_id: UUID
    progress_percentage: float = Field(..., ge=0, le=100)
    attendance_percentage: Optional[float] = Field(None, ge=0, le=100)
    assignments_completed: int = Field(..., ge=0)
    total_assignments: int = Field(..., ge=0)
    average_grade: Optional[float] = Field(None, ge=0, le=100)
    skills_acquired: List[str] = []
    notes: Optional[str] = Field(None, max_length=1000)
    last_updated: datetime = Field(default_factory=datetime.now)


class StudentCertification(BaseSchema):
    """Schema for student certifications."""
    
    certification_name: str = Field(..., min_length=2, max_length=255)
    certification_type: str = Field(..., max_length=100)
    issued_date: date
    expiry_date: Optional[date] = None
    certificate_url: Optional[str] = None
    issuing_authority: Optional[str] = Field(None, max_length=255)
    verification_code: Optional[str] = Field(None, max_length=100)


# Academy student export schemas
class StudentExportFormat(str, Enum):
    """Export format options."""
    CSV = "csv"
    EXCEL = "excel"
    JSON = "json"
    PDF = "pdf"


class StudentExportRequest(BaseSchema):
    """Request for student data export."""
    
    format: StudentExportFormat = StudentExportFormat.CSV
    filters: Optional[AcademyStudentFilterParams] = None
    include_progress: bool = False
    include_academy_details: bool = False
    include_course_details: bool = False
    date_range_start: Optional[datetime] = None
    date_range_end: Optional[datetime] = None
    academy_ids: Optional[List[UUID]] = None