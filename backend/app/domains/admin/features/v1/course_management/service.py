"""
Service layer for Course Management
"""

from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from decimal import Decimal

from sqlalchemy import func, case, and_, or_, desc, cast, String
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.shared.models.business import Course, AcademyCourse
from app.core.exceptions import NotFoundException, ConflictException, ValidationException

from .schemas import (
    CourseCreate,
    CourseUpdate,
    CourseFilters,
    CourseStatistics,
    CourseCategoryStats,
    CourseLevelStats,
    AcademyCourseCreate,
    AcademyCourseUpdate,
    AcademyCourseFilters,
    BulkAcademyCourseCreate,
)


class CourseService:
    """Service for course management operations"""

    @staticmethod
    def create_course(db: Session, course_data: CourseCreate) -> Course:
        """
        Create a new course
        
        Args:
            db: Database session
            course_data: Course creation data
            
        Returns:
            Created course
            
        Raises:
            ConflictException: If course with same slug or code exists
        """
        # Check for existing slug
        existing = db.query(Course).filter(
            Course.course_slug == course_data.course_slug
        ).first()
        if existing:
            raise ConflictException(f"Course with slug '{course_data.course_slug}' already exists")
        
        # Check for existing code if provided
        if course_data.course_code:
            existing = db.query(Course).filter(
                Course.course_code == course_data.course_code
            ).first()
            if existing:
                raise ConflictException(f"Course with code '{course_data.course_code}' already exists")
        
        course = Course(**course_data.model_dump())
        db.add(course)
        db.commit()
        db.refresh(course)
        return course

    @staticmethod
    def get_course(db: Session, course_id: UUID) -> Course:
        """
        Get course by ID
        
        Args:
            db: Database session
            course_id: Course ID
            
        Returns:
            Course object
            
        Raises:
            NotFoundException: If course not found
        """
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise NotFoundException(f"Course with ID {course_id} not found")
        return course

    @staticmethod
    def get_courses(
        db: Session,
        filters: Optional[CourseFilters] = None,
        page: int = 1,
        page_size: int = 20,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> tuple[List[Course], int]:
        """
        Get paginated list of courses with filters
        
        Args:
            db: Database session
            filters: Course filters
            page: Page number
            page_size: Items per page
            sort_by: Sort field
            sort_order: Sort order (asc/desc)
            
        Returns:
            Tuple of (courses list, total count)
        """
        query = db.query(Course)
        
        # Apply filters
        if filters:
            if filters.category:
                query = query.filter(Course.category == filters.category)
            
            if filters.level:
                query = query.filter(Course.level == filters.level)
            
            if filters.is_active is not None:
                query = query.filter(Course.is_active == filters.is_active)
            
            if filters.is_featured is not None:
                query = query.filter(Course.is_featured == filters.is_featured)
            
            if filters.search:
                search_term = f"%{filters.search}%"
                query = query.filter(
                    or_(
                        Course.course_name.ilike(search_term),
                        Course.course_code.ilike(search_term),
                        Course.short_description.ilike(search_term),
                        Course.full_description.ilike(search_term)
                    )
                )
            
            if filters.min_duration_months:
                query = query.filter(Course.duration_months >= filters.min_duration_months)
            
            if filters.max_duration_months:
                query = query.filter(Course.duration_months <= filters.max_duration_months)
            
            if filters.min_fees:
                query = query.filter(
                    or_(
                        Course.suggested_fees_min >= filters.min_fees,
                        Course.suggested_fees_max >= filters.min_fees
                    )
                )
            
            if filters.max_fees:
                query = query.filter(
                    or_(
                        Course.suggested_fees_min <= filters.max_fees,
                        Course.suggested_fees_max <= filters.max_fees
                    )
                )
        
        # Get total count
        total = query.count()
        
        # Apply sorting
        sort_column = getattr(Course, sort_by, Course.created_at)
        if sort_order.lower() == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(sort_column)
        
        # Apply pagination
        offset = (page - 1) * page_size
        courses = query.offset(offset).limit(page_size).all()
        
        return courses, total

    @staticmethod
    def update_course(
        db: Session,
        course_id: UUID,
        course_data: CourseUpdate
    ) -> Course:
        """
        Update course
        
        Args:
            db: Database session
            course_id: Course ID
            course_data: Update data
            
        Returns:
            Updated course
            
        Raises:
            NotFoundException: If course not found
            ConflictException: If slug or code conflicts
        """
        course = CourseService.get_course(db, course_id)
        
        update_data = course_data.model_dump(exclude_unset=True)
        
        # Check for slug conflict
        if "course_slug" in update_data:
            existing = db.query(Course).filter(
                Course.course_slug == update_data["course_slug"],
                Course.id != course_id
            ).first()
            if existing:
                raise ConflictException(f"Course with slug '{update_data['course_slug']}' already exists")
        
        # Check for code conflict
        if "course_code" in update_data and update_data["course_code"]:
            existing = db.query(Course).filter(
                Course.course_code == update_data["course_code"],
                Course.id != course_id
            ).first()
            if existing:
                raise ConflictException(f"Course with code '{update_data['course_code']}' already exists")
        
        for field, value in update_data.items():
            setattr(course, field, value)
        
        db.commit()
        db.refresh(course)
        return course

    @staticmethod
    def delete_course(db: Session, course_id: UUID) -> None:
        """
        Delete course (soft delete by setting is_active=False)
        
        Args:
            db: Database session
            course_id: Course ID
            
        Raises:
            NotFoundException: If course not found
        """
        course = CourseService.get_course(db, course_id)
        
        # Check if course is being used by academies
        academy_courses_count = db.query(AcademyCourse).filter(
            AcademyCourse.course_id == course_id
        ).count()
        
        if academy_courses_count > 0:
            # Soft delete - just deactivate
            course.is_active = False
            db.commit()
        else:
            # Hard delete if not used
            db.delete(course)
            db.commit()

    @staticmethod
    def get_course_categories(db: Session) -> List[str]:
        """
        Get unique course categories
        
        Args:
            db: Database session
            
        Returns:
            List of unique categories
        """
        categories = db.query(Course.category).distinct().order_by(Course.category).all()
        return [cat[0] for cat in categories if cat[0]]

    @staticmethod
    def get_course_levels(db: Session) -> List[str]:
        """
        Get unique course levels
        
        Args:
            db: Database session
            
        Returns:
            List of unique levels
        """
        levels = db.query(Course.level).distinct().order_by(Course.level).all()
        return [level[0] for level in levels if level[0]]

    @staticmethod
    def get_course_statistics(db: Session) -> CourseStatistics:
        """
        Get comprehensive course statistics
        
        Args:
            db: Database session
            
        Returns:
            Course statistics
        """
        # Overall counts
        total_courses = db.query(Course).count()
        active_courses = db.query(Course).filter(Course.is_active == True).count()
        inactive_courses = total_courses - active_courses
        featured_courses = db.query(Course).filter(
            Course.is_featured == True,
            Course.is_active == True
        ).count()
        
        # By category
        category_stats = db.query(
            Course.category,
            func.count(Course.id).label("total"),
            func.sum(case((Course.is_active == True, 1), else_=0)).label("active"),
            func.sum(case((and_(Course.is_active == True, Course.is_featured == True), 1), else_=0)).label("featured")
        ).group_by(Course.category).all()
        
        by_category = [
            CourseCategoryStats(
                category=cat,
                total_courses=total,
                active_courses=active,
                featured_courses=featured
            )
            for cat, total, active, featured in category_stats
        ]
        
        # By level
        level_stats = db.query(
            Course.level,
            func.count(Course.id).label("total"),
            func.sum(case((Course.is_active == True, 1), else_=0)).label("active")
        ).group_by(Course.level).all()
        
        by_level = [
            CourseLevelStats(
                level=level,
                total_courses=total,
                active_courses=active
            )
            for level, total, active in level_stats
        ]
        
        return CourseStatistics(
            total_courses=total_courses,
            active_courses=active_courses,
            inactive_courses=inactive_courses,
            featured_courses=featured_courses,
            by_category=by_category,
            by_level=by_level
        )


class AcademyCourseService:
    """Service for academy course management operations"""

    @staticmethod
    def add_course_to_academy(
        db: Session,
        academy_course_data: AcademyCourseCreate
    ) -> AcademyCourse:
        """
        Add a course to an academy
        
        Args:
            db: Database session
            academy_course_data: Academy course data
            
        Returns:
            Created academy course
            
        Raises:
            ConflictException: If course already added to academy
            NotFoundException: If academy or course not found
        """
        # Check if already exists
        existing = db.query(AcademyCourse).filter(
            AcademyCourse.academy_id == academy_course_data.academy_id,
            AcademyCourse.course_id == academy_course_data.course_id
        ).first()
        
        if existing:
            raise ConflictException("Course is already added to this academy")
        
        academy_course = AcademyCourse(**academy_course_data.model_dump())
        db.add(academy_course)
        db.commit()
        db.refresh(academy_course)
        return academy_course

    @staticmethod
    def get_academy_course(db: Session, academy_course_id: UUID) -> AcademyCourse:
        """
        Get academy course by ID
        
        Args:
            db: Database session
            academy_course_id: Academy course ID
            
        Returns:
            Academy course object
            
        Raises:
            NotFoundException: If not found
        """
        academy_course = db.query(AcademyCourse).filter(
            AcademyCourse.id == academy_course_id
        ).first()
        if not academy_course:
            raise NotFoundException(f"Academy course with ID {academy_course_id} not found")
        return academy_course

    @staticmethod
    def get_academy_courses(
        db: Session,
        filters: Optional[AcademyCourseFilters] = None,
        page: int = 1,
        page_size: int = 20
    ) -> tuple[List[Dict[str, Any]], int]:
        """
        Get paginated list of academy courses with filters
        
        Args:
            db: Database session
            filters: Academy course filters
            page: Page number
            page_size: Items per page
            
        Returns:
            Tuple of (academy courses list with course details, total count)
        """
        query = db.query(
            AcademyCourse,
            Course.course_name,
            Course.course_slug,
            Course.category,
            Course.level,
            Course.duration_months
        ).join(Course, AcademyCourse.course_id == Course.id)
        
        # Apply filters
        if filters:
            if filters.academy_id:
                query = query.filter(AcademyCourse.academy_id == filters.academy_id)
            
            if filters.course_id:
                query = query.filter(AcademyCourse.course_id == filters.course_id)
            
            if filters.is_available is not None:
                query = query.filter(AcademyCourse.is_available == filters.is_available)
            
            if filters.category:
                query = query.filter(Course.category == filters.category)
            
            if filters.level:
                query = query.filter(Course.level == filters.level)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * page_size
        results = query.offset(offset).limit(page_size).all()
        
        # Format response with course details
        academy_courses_with_details = []
        for ac, course_name, course_slug, category, level, duration in results:
            ac_dict = {
                "id": ac.id,
                "academy_id": ac.academy_id,
                "course_id": ac.course_id,
                "actual_fees": ac.actual_fees,
                "actual_duration_months": ac.actual_duration_months,
                "batch_size_limit": ac.batch_size_limit,
                "is_available": ac.is_available,
                "schedule_info": ac.schedule_info,
                "created_at": ac.created_at,
                "updated_at": ac.updated_at,
                "course_name": course_name,
                "course_slug": course_slug,
                "course_category": category,
                "course_level": level,
                "course_duration_months": duration
            }
            academy_courses_with_details.append(ac_dict)
        
        return academy_courses_with_details, total

    @staticmethod
    def update_academy_course(
        db: Session,
        academy_course_id: UUID,
        update_data: AcademyCourseUpdate
    ) -> AcademyCourse:
        """
        Update academy course details
        
        Args:
            db: Database session
            academy_course_id: Academy course ID
            update_data: Update data
            
        Returns:
            Updated academy course
            
        Raises:
            NotFoundException: If not found
        """
        academy_course = AcademyCourseService.get_academy_course(db, academy_course_id)
        
        for field, value in update_data.model_dump(exclude_unset=True).items():
            setattr(academy_course, field, value)
        
        db.commit()
        db.refresh(academy_course)
        return academy_course

    @staticmethod
    def remove_course_from_academy(
        db: Session,
        academy_course_id: UUID
    ) -> None:
        """
        Remove a course from an academy
        
        Args:
            db: Database session
            academy_course_id: Academy course ID
            
        Raises:
            NotFoundException: If not found
        """
        academy_course = AcademyCourseService.get_academy_course(db, academy_course_id)
        
        # Check if there are enrolled students
        from app.shared.models.business import AcademyStudent
        enrolled_students = db.query(AcademyStudent).filter(
            AcademyStudent.academy_id == academy_course.academy_id,
            AcademyStudent.course_id == academy_course.course_id
        ).count()
        
        if enrolled_students > 0:
            raise ValidationException(
                f"Cannot remove course. {enrolled_students} students are currently enrolled."
            )
        
        db.delete(academy_course)
        db.commit()

    @staticmethod
    def toggle_course_availability(
        db: Session,
        academy_course_id: UUID,
        is_available: bool
    ) -> AcademyCourse:
        """
        Toggle course availability for enrollment
        
        Args:
            db: Database session
            academy_course_id: Academy course ID
            is_available: Availability status
            
        Returns:
            Updated academy course
            
        Raises:
            NotFoundException: If not found
        """
        academy_course = AcademyCourseService.get_academy_course(db, academy_course_id)
        academy_course.is_available = is_available
        db.commit()
        db.refresh(academy_course)
        return academy_course

    @staticmethod
    def bulk_add_courses_to_academy(
        db: Session,
        bulk_data: BulkAcademyCourseCreate
    ) -> Dict[str, Any]:
        """
        Add multiple courses to an academy at once
        
        Args:
            db: Database session
            bulk_data: Bulk creation data
            
        Returns:
            Dictionary with created and skipped courses
        """
        created_academy_courses = []
        skipped_course_ids = []
        
        for course_id in bulk_data.course_ids:
            # Check if already exists
            existing = db.query(AcademyCourse).filter(
                AcademyCourse.academy_id == bulk_data.academy_id,
                AcademyCourse.course_id == course_id
            ).first()
            
            if existing:
                skipped_course_ids.append(course_id)
                continue
            
            # Check if course exists
            course_exists = db.query(Course).filter(Course.id == course_id).first()
            if not course_exists:
                skipped_course_ids.append(course_id)
                continue
            
            academy_course = AcademyCourse(
                academy_id=bulk_data.academy_id,
                course_id=course_id,
                is_available=bulk_data.default_is_available
            )
            db.add(academy_course)
            created_academy_courses.append(academy_course)
        
        db.commit()
        
        return {
            "created_count": len(created_academy_courses),
            "skipped_count": len(skipped_course_ids),
            "created_academy_courses": created_academy_courses,
            "skipped_course_ids": skipped_course_ids
        }
