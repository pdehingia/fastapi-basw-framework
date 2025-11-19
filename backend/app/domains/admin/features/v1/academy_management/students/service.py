"""
Academy student management service for admin domain.
Handles CRUD operations and business logic for academy students.
"""

from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta, date
from uuid import UUID
import csv
import io
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, func, desc, or_, text

from app.shared.models.business import AcademyStudent, Academy, Course  # These models need to be created
from app.shared.models.user import ProviderUser
from .schemas import (
    AcademyStudentFilterParams,
    AcademyStudentCreate,
    AcademyStudentUpdate,
    AcademyStudentResponse,
    AcademyStudentDetailResponse,
    AcademyStudentStatistics,
    StudentStatusUpdate,
    StudentInvitation,
    BulkStudentOperation,
    BulkStudentOperationResponse,
    StudentExportRequest,
    StudentProgress,
    StudentCertification,
    RegistrationStatus
)
from app.shared.pagination import PaginationParams, PaginatedResponse, PageMetadata
from app.shared.exceptions import ValidationException, NotFoundError, ConflictError


class AcademyStudentManagementService:
    """Service for managing academy students in Maya platform."""

    def __init__(self, db: Session):
        """Initialize service with database session."""
        self.db = db

    async def get_academy_students_list(
        self, 
        filters: AcademyStudentFilterParams,
        pagination: PaginationParams
    ) -> PaginatedResponse[AcademyStudentResponse]:
        """
        Get paginated list of academy students with filtering and search.
        """
        try:
            # Build base query with joins for related data
            query = (
                self.db.query(AcademyStudent)
                .join(Academy, AcademyStudent.academy_id == Academy.id)
                .join(ProviderUser, AcademyStudent.artist_user_id == ProviderUser.id)
                .outerjoin(Course, AcademyStudent.course_id == Course.id)
            )
            
            # Apply filters
            if filters.search:
                search_term = f"%{filters.search.lower()}%"
                query = query.filter(
                    or_(
                        func.lower(AcademyStudent.course_name).like(search_term),
                        func.lower(ProviderUser.full_name).like(search_term),
                        func.lower(Academy.name).like(search_term)
                    )
                )
            
            if filters.academy_id:
                query = query.filter(AcademyStudent.academy_id == filters.academy_id)
                
            if filters.course_id:
                query = query.filter(AcademyStudent.course_id == filters.course_id)
                
            if filters.registration_status:
                query = query.filter(AcademyStudent.maya_registration_status == filters.registration_status.value)
                
            if filters.invitation_sent is not None:
                query = query.filter(AcademyStudent.invitation_sent == filters.invitation_sent)
                
            if filters.has_graduated is not None:
                if filters.has_graduated:
                    query = query.filter(AcademyStudent.graduation_date.isnot(None))
                else:
                    query = query.filter(AcademyStudent.graduation_date.is_(None))
                    
            if filters.enrolled_after:
                query = query.filter(AcademyStudent.enrollment_date >= filters.enrolled_after)
                
            if filters.enrolled_before:
                query = query.filter(AcademyStudent.enrollment_date <= filters.enrolled_before)
                
            if filters.graduation_after:
                query = query.filter(AcademyStudent.graduation_date >= filters.graduation_after)
                
            if filters.graduation_before:
                query = query.filter(AcademyStudent.graduation_date <= filters.graduation_before)
            
            # Apply sorting
            sort_field = getattr(AcademyStudent, filters.sort_by, AcademyStudent.enrollment_date)
            if filters.sort_order == "desc":
                query = query.order_by(desc(sort_field))
            else:
                query = query.order_by(sort_field)
            
            # Get total count
            total_count = query.count()
            
            # Apply pagination
            offset = (pagination.page - 1) * pagination.page_size
            students = query.offset(offset).limit(pagination.page_size).all()
            
            # Convert to response models
            student_responses = []
            for student in students:
                response_data = {
                    "id": student.id,
                    "academy_id": student.academy_id,
                    "artist_user_id": student.artist_user_id,
                    "course_id": student.course_id,
                    "course_name": student.course_name,
                    "enrollment_date": student.enrollment_date,
                    "graduation_date": student.graduation_date,
                    "maya_registration_status": student.maya_registration_status,
                    "invitation_sent": student.invitation_sent,
                    "invitation_sent_at": student.invitation_sent_at,
                    "student_photo_url": student.student_photo_url,
                    "certificate_url": student.certificate_url,
                    "created_at": student.created_at,
                    "updated_at": student.updated_at,
                    "academy_name": getattr(student.academy, 'name', None),
                    "student_name": getattr(student.artist, 'full_name', None),
                    "student_email": getattr(student.artist, 'email', None),
                    "student_phone": getattr(student.artist, 'phone', None)
                }
                student_responses.append(AcademyStudentResponse(**response_data))
            
            # Create pagination metadata
            metadata = PageMetadata(
                page=pagination.page,
                page_size=pagination.page_size,
                total_items=total_count,
                total_pages=(total_count + pagination.page_size - 1) // pagination.page_size
            )
            
            return PaginatedResponse(
                items=student_responses,
                metadata=metadata
            )
            
        except Exception as e:
            raise ValidationException(f"Error retrieving academy students: {str(e)}")

    async def get_academy_student_by_id(self, student_id: UUID) -> Optional[AcademyStudentDetailResponse]:
        """Get academy student by ID with detailed information."""
        try:
            student = (
                self.db.query(AcademyStudent)
                .options(
                    joinedload(AcademyStudent.academy),
                    joinedload(AcademyStudent.artist),
                    joinedload(AcademyStudent.course)
                )
                .filter(AcademyStudent.id == student_id)
                .first()
            )
            
            if not student:
                return None
            
            # Build detailed response
            response_data = {
                "id": student.id,
                "academy_id": student.academy_id,
                "artist_user_id": student.artist_user_id,
                "course_id": student.course_id,
                "course_name": student.course_name,
                "enrollment_date": student.enrollment_date,
                "graduation_date": student.graduation_date,
                "maya_registration_status": student.maya_registration_status,
                "invitation_sent": student.invitation_sent,
                "invitation_sent_at": student.invitation_sent_at,
                "student_photo_url": student.student_photo_url,
                "certificate_url": student.certificate_url,
                "created_at": student.created_at,
                "updated_at": student.updated_at,
                "academy_name": getattr(student.academy, 'name', None),
                "student_name": getattr(student.artist, 'full_name', None),
                "student_email": getattr(student.artist, 'email', None),
                "student_phone": getattr(student.artist, 'phone', None),
                
                # Additional detailed information
                "academy": {
                    "id": student.academy.id,
                    "name": student.academy.name,
                    "location": getattr(student.academy, 'city', None),
                    "contact_email": getattr(student.academy, 'email', None)
                } if student.academy else None,
                
                "student_profile": {
                    "id": student.artist.id,
                    "full_name": student.artist.full_name,
                    "email": student.artist.email,
                    "phone": student.artist.phone,
                    "profile_image_url": getattr(student.artist, 'profile_image_url', None)
                } if student.artist else None,
                
                "course_details": {
                    "id": student.course.id,
                    "name": student.course.name,
                    "description": getattr(student.course, 'description', None),
                    "duration": getattr(student.course, 'duration', None)
                } if student.course else None,
                
                # Mock progress data (would be calculated from actual progress tracking)
                "progress_percentage": 75.5,  # Example
                "attendance_percentage": 85.0,  # Example
                "assignments_completed": 8,  # Example
                "total_assignments": 10,  # Example
                "average_grade": 87.5,  # Example
                "skills_acquired": ["Hair Cutting", "Color Theory", "Client Consultation"],
                "certifications": [],
                "notes": None,
                "last_activity": student.updated_at
            }
            
            return AcademyStudentDetailResponse(**response_data)
            
        except Exception as e:
            raise ValidationException(f"Error retrieving academy student: {str(e)}")

    async def create_academy_student(self, student_data: AcademyStudentCreate) -> AcademyStudentResponse:
        """Create a new academy student enrollment."""
        try:
            # Validate academy exists
            academy = self.db.query(Academy).filter(Academy.id == student_data.academy_id).first()
            if not academy:
                raise NotFoundError(f"Academy with ID {student_data.academy_id} not found")
            
            # Validate artist exists
            artist = self.db.query(ProviderUser).filter(ProviderUser.id == student_data.artist_user_id).first()
            if not artist:
                raise NotFoundError(f"Artist with ID {student_data.artist_user_id} not found")
            
            # Check for duplicate enrollment
            existing = (
                self.db.query(AcademyStudent)
                .filter(
                    and_(
                        AcademyStudent.academy_id == student_data.academy_id,
                        AcademyStudent.artist_user_id == student_data.artist_user_id,
                        AcademyStudent.maya_registration_status != RegistrationStatus.DROPPED_OUT
                    )
                )
                .first()
            )
            
            if existing:
                raise ConflictError("Student is already enrolled in this academy")
            
            # Create new academy student
            new_student = AcademyStudent(
                academy_id=student_data.academy_id,
                artist_user_id=student_data.artist_user_id,
                course_id=student_data.course_id,
                course_name=student_data.course_name,
                enrollment_date=student_data.enrollment_date,
                graduation_date=student_data.graduation_date,
                maya_registration_status=student_data.maya_registration_status.value,
                invitation_sent=student_data.send_invitation,
                invitation_sent_at=datetime.utcnow() if student_data.send_invitation else None,
                student_photo_url=student_data.student_photo_url
            )
            
            self.db.add(new_student)
            self.db.commit()
            self.db.refresh(new_student)
            
            # TODO: Send invitation email/SMS if send_invitation is True
            if student_data.send_invitation:
                await self._send_student_invitation(new_student)
            
            # Convert to response
            response_data = {
                "id": new_student.id,
                "academy_id": new_student.academy_id,
                "artist_user_id": new_student.artist_user_id,
                "course_id": new_student.course_id,
                "course_name": new_student.course_name,
                "enrollment_date": new_student.enrollment_date,
                "graduation_date": new_student.graduation_date,
                "maya_registration_status": new_student.maya_registration_status,
                "invitation_sent": new_student.invitation_sent,
                "invitation_sent_at": new_student.invitation_sent_at,
                "student_photo_url": new_student.student_photo_url,
                "certificate_url": new_student.certificate_url,
                "created_at": new_student.created_at,
                "updated_at": new_student.updated_at,
                "academy_name": academy.name,
                "student_name": artist.full_name,
                "student_email": artist.email,
                "student_phone": artist.phone
            }
            
            return AcademyStudentResponse(**response_data)
            
        except (NotFoundError, ConflictError):
            raise
        except Exception as e:
            self.db.rollback()
            raise ValidationException(f"Error creating academy student: {str(e)}")

    async def update_academy_student(
        self, 
        student_id: UUID, 
        update_data: AcademyStudentUpdate
    ) -> Optional[AcademyStudentResponse]:
        """Update academy student information."""
        try:
            student = self.db.query(AcademyStudent).filter(AcademyStudent.id == student_id).first()
            
            if not student:
                return None
            
            # Update fields
            update_dict = update_data.model_dump(exclude_unset=True)
            for field, value in update_dict.items():
                if hasattr(student, field):
                    if field in ['maya_registration_status'] and isinstance(value, Enum):
                        setattr(student, field, value.value)
                    else:
                        setattr(student, field, value)
            
            student.updated_at = datetime.utcnow()
            
            self.db.commit()
            self.db.refresh(student)
            
            # Get related data for response
            academy = self.db.query(Academy).filter(Academy.id == student.academy_id).first()
            artist = self.db.query(ProviderUser).filter(ProviderUser.id == student.artist_user_id).first()
            
            response_data = {
                "id": student.id,
                "academy_id": student.academy_id,
                "artist_user_id": student.artist_user_id,
                "course_id": student.course_id,
                "course_name": student.course_name,
                "enrollment_date": student.enrollment_date,
                "graduation_date": student.graduation_date,
                "maya_registration_status": student.maya_registration_status,
                "invitation_sent": student.invitation_sent,
                "invitation_sent_at": student.invitation_sent_at,
                "student_photo_url": student.student_photo_url,
                "certificate_url": student.certificate_url,
                "created_at": student.created_at,
                "updated_at": student.updated_at,
                "academy_name": academy.name if academy else None,
                "student_name": artist.full_name if artist else None,
                "student_email": artist.email if artist else None,
                "student_phone": artist.phone if artist else None
            }
            
            return AcademyStudentResponse(**response_data)
            
        except Exception as e:
            self.db.rollback()
            raise ValidationException(f"Error updating academy student: {str(e)}")

    async def delete_academy_student(self, student_id: UUID) -> bool:
        """Delete academy student enrollment."""
        try:
            student = self.db.query(AcademyStudent).filter(AcademyStudent.id == student_id).first()
            
            if not student:
                return False
            
            self.db.delete(student)
            self.db.commit()
            
            return True
            
        except Exception as e:
            self.db.rollback()
            raise ValidationException(f"Error deleting academy student: {str(e)}")

    async def update_student_status(
        self, 
        student_id: UUID, 
        status_update: StudentStatusUpdate
    ) -> Optional[AcademyStudentResponse]:
        """Update student registration status."""
        try:
            student = self.db.query(AcademyStudent).filter(AcademyStudent.id == student_id).first()
            
            if not student:
                return None
            
            student.maya_registration_status = status_update.status.value
            student.updated_at = datetime.utcnow()
            
            # Update graduation date if graduating
            if status_update.update_graduation_date and status_update.graduation_date:
                student.graduation_date = status_update.graduation_date
            elif status_update.status == RegistrationStatus.GRADUATED and not student.graduation_date:
                student.graduation_date = datetime.utcnow().date()
            
            self.db.commit()
            self.db.refresh(student)
            
            # TODO: Send notification if requested
            if status_update.send_notification:
                await self._send_status_update_notification(student, status_update)
            
            return await self._build_student_response(student)
            
        except Exception as e:
            self.db.rollback()
            raise ValidationException(f"Error updating student status: {str(e)}")

    async def get_academy_student_statistics(self) -> AcademyStudentStatistics:
        """Get comprehensive academy student statistics."""
        try:
            # Basic counts
            total_students = self.db.query(AcademyStudent).count()
            active_students = (
                self.db.query(AcademyStudent)
                .filter(AcademyStudent.maya_registration_status.in_(['active', 'registered']))
                .count()
            )
            graduated_students = (
                self.db.query(AcademyStudent)
                .filter(AcademyStudent.maya_registration_status == 'graduated')
                .count()
            )
            pending_registration = (
                self.db.query(AcademyStudent)
                .filter(AcademyStudent.maya_registration_status == 'pending')
                .count()
            )
            invited_students = (
                self.db.query(AcademyStudent)
                .filter(AcademyStudent.maya_registration_status == 'invited')
                .count()
            )
            dropout_students = (
                self.db.query(AcademyStudent)
                .filter(AcademyStudent.maya_registration_status == 'dropped_out')
                .count()
            )
            
            # Time-based counts
            today = datetime.utcnow().date()
            week_ago = today - timedelta(days=7)
            month_ago = today - timedelta(days=30)
            
            new_enrollments_today = (
                self.db.query(AcademyStudent)
                .filter(AcademyStudent.enrollment_date == today)
                .count()
            )
            
            new_enrollments_this_week = (
                self.db.query(AcademyStudent)
                .filter(AcademyStudent.enrollment_date >= week_ago)
                .count()
            )
            
            new_enrollments_this_month = (
                self.db.query(AcademyStudent)
                .filter(AcademyStudent.enrollment_date >= month_ago)
                .count()
            )
            
            # Calculate growth percentage
            previous_month_start = month_ago - timedelta(days=30)
            enrollments_previous_month = (
                self.db.query(AcademyStudent)
                .filter(
                    and_(
                        AcademyStudent.enrollment_date >= previous_month_start,
                        AcademyStudent.enrollment_date < month_ago
                    )
                )
                .count()
            )
            
            enrollment_growth_percentage = 0.0
            if enrollments_previous_month > 0:
                enrollment_growth_percentage = (
                    (new_enrollments_this_month - enrollments_previous_month) 
                    / enrollments_previous_month * 100
                )
            
            # Performance metrics
            completion_rate = 0.0
            if total_students > 0:
                completion_rate = (graduated_students / total_students) * 100
            
            # TODO: Calculate average time to graduate from actual data
            average_time_to_graduate = 365.0  # Example: 365 days
            
            return AcademyStudentStatistics(
                total_students=total_students,
                active_students=active_students,
                graduated_students=graduated_students,
                pending_registration=pending_registration,
                invited_students=invited_students,
                dropout_students=dropout_students,
                new_enrollments_today=new_enrollments_today,
                new_enrollments_this_week=new_enrollments_this_week,
                new_enrollments_this_month=new_enrollments_this_month,
                enrollment_growth_percentage=enrollment_growth_percentage,
                average_completion_rate=completion_rate,
                average_time_to_graduate=average_time_to_graduate,
                top_performing_academies=[],  # TODO: Implement
                most_popular_courses=[],      # TODO: Implement
                students_by_academy=[],       # TODO: Implement
                students_by_course=[],        # TODO: Implement
                enrollments_by_month=[],      # TODO: Implement
                graduation_trend=[]           # TODO: Implement
            )
            
        except Exception as e:
            raise ValidationException(f"Error retrieving student statistics: {str(e)}")

    async def _send_student_invitation(self, student: AcademyStudent):
        """Send invitation to student (placeholder for email/SMS service)."""
        # TODO: Implement actual invitation sending logic
        pass

    async def _send_status_update_notification(self, student: AcademyStudent, status_update: StudentStatusUpdate):
        """Send status update notification to student (placeholder)."""
        # TODO: Implement actual notification sending logic
        pass

    async def _build_student_response(self, student: AcademyStudent) -> AcademyStudentResponse:
        """Helper method to build student response with related data."""
        academy = self.db.query(Academy).filter(Academy.id == student.academy_id).first()
        artist = self.db.query(ProviderUser).filter(ProviderUser.id == student.artist_user_id).first()
        
        response_data = {
            "id": student.id,
            "academy_id": student.academy_id,
            "artist_user_id": student.artist_user_id,
            "course_id": student.course_id,
            "course_name": student.course_name,
            "enrollment_date": student.enrollment_date,
            "graduation_date": student.graduation_date,
            "maya_registration_status": student.maya_registration_status,
            "invitation_sent": student.invitation_sent,
            "invitation_sent_at": student.invitation_sent_at,
            "student_photo_url": student.student_photo_url,
            "certificate_url": student.certificate_url,
            "created_at": student.created_at,
            "updated_at": student.updated_at,
            "academy_name": academy.name if academy else None,
            "student_name": artist.full_name if artist else None,
            "student_email": artist.email if artist else None,
            "student_phone": artist.phone if artist else None
        }
        
        return AcademyStudentResponse(**response_data)