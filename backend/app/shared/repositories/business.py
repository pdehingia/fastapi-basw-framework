"""Business repositories for salon and academy management."""

from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func

from app.shared.repositories.base import BaseRepository
from app.shared.models.business import Salon, Academy, SalonProvider, Service, Course, AcademyCourse
from app.core.exceptions import ConflictException


class SalonRepository(BaseRepository[Salon, dict, dict]):
    """Repository for salon operations."""
    
    def __init__(self, db: Session):
        super().__init__(Salon, db)
    
    def get_by_slug(self, slug: str) -> Optional[Salon]:
        """Get salon by slug."""
        return self.get_by_field("salon_slug", slug)
    
    def get_by_name(self, name: str) -> Optional[Salon]:
        """Get salon by exact name."""
        return self.get_by_field("salon_name", name)
    
    def search_by_name(self, name: str) -> List[Salon]:
        """Search salons by name pattern."""
        return self.db.query(Salon).filter(
            Salon.salon_name.ilike(f"%{name}%")
        ).all()
    
    def get_verified_salons(self) -> List[Salon]:
        """Get all verified salons."""
        return self.filter_by(is_verified=True, is_active=True)
    
    def get_by_address(self, address_id: UUID) -> List[Salon]:
        """Get salons at a specific address."""
        return self.filter_by(address_id=address_id)


class AcademyRepository(BaseRepository[Academy, dict, dict]):
    """Repository for academy operations."""
    
    def __init__(self, db: Session):
        super().__init__(Academy, db)
    
    def get_by_provider(self, provider_user_id: UUID) -> Optional[Academy]:
        """Get academy by provider user ID."""
        return self.get_by_field("provider_user_id", provider_user_id)
    
    def get_by_name(self, name: str) -> Optional[Academy]:
        """Get academy by exact name."""
        return self.get_by_field("academy_name", name)
    
    def get_by_registration_number(self, registration_number: str) -> Optional[Academy]:
        """Get academy by registration number."""
        return self.get_by_field("registration_number", registration_number)
    
    def get_by_gst_number(self, gst_number: str) -> Optional[Academy]:
        """Get academy by GST number."""
        return self.get_by_field("gst_number", gst_number)
    
    def search_by_name(self, name: str) -> List[Academy]:
        """Search academies by name pattern."""
        return self.db.query(Academy).filter(
            Academy.academy_name.ilike(f"%{name}%")
        ).all()
    
    def get_verified_academies(self) -> List[Academy]:
        """Get all verified academies."""
        return self.filter_by(is_verified=True, is_active=True)


class SalonProviderRepository(BaseRepository[SalonProvider, dict, dict]):
    """Repository for salon-provider relationships."""
    
    def __init__(self, db: Session):
        super().__init__(SalonProvider, db)
    
    def get_salon_providers(self, salon_id: UUID, active_only: bool = True) -> List[SalonProvider]:
        """Get all providers for a salon."""
        filters = {"salon_id": salon_id}
        if active_only:
            filters["is_active"] = True
        return self.filter_by(**filters)
    
    def get_provider_salons(self, provider_user_id: UUID, active_only: bool = True) -> List[SalonProvider]:
        """Get all salons for a provider."""
        filters = {"provider_user_id": provider_user_id}
        if active_only:
            filters["is_active"] = True
        return self.filter_by(**filters)
    
    def get_relationship(self, salon_id: UUID, provider_user_id: UUID) -> Optional[SalonProvider]:
        """Get specific salon-provider relationship."""
        return self.db.query(SalonProvider).filter(
            and_(
                SalonProvider.salon_id == salon_id,
                SalonProvider.provider_user_id == provider_user_id
            )
        ).first()
    
    def is_provider_at_salon(self, salon_id: UUID, provider_user_id: UUID) -> bool:
        """Check if provider works at salon."""
        relationship = self.get_relationship(salon_id, provider_user_id)
        return relationship is not None and relationship.is_active


class ServiceRepository(BaseRepository[Service, dict, dict]):
    """Repository for service operations."""
    
    def __init__(self, db: Session):
        super().__init__(Service, db)
    
    def get_by_slug(self, slug: str) -> Optional[Service]:
        """Get service by slug."""
        return self.get_by_field("service_slug", slug)
    
    def get_by_name(self, name: str) -> Optional[Service]:
        """Get service by exact name."""
        return self.get_by_field("service_name", name)
    
    def get_by_category(self, category: str, active_only: bool = True) -> List[Service]:
        """Get services by category."""
        filters = {"category": category}
        if active_only:
            filters["is_active"] = True
        return self.filter_by(**filters)
    
    def get_featured_services(self) -> List[Service]:
        """Get featured services."""
        return self.filter_by(is_featured=True, is_active=True)
    
    def search_services(self, search_term: str) -> List[Service]:
        """Search services by name or description."""
        return self.db.query(Service).filter(
            and_(
                Service.is_active == True,
                or_(
                    Service.service_name.ilike(f"%{search_term}%"),
                    Service.description.ilike(f"%{search_term}%")
                )
            )
        ).all()


class CourseRepository(BaseRepository[Course, dict, dict]):
    """Repository for course operations."""
    
    def __init__(self, db: Session):
        super().__init__(Course, db)
    
    def get_by_slug(self, slug: str) -> Optional[Course]:
        """Get course by slug."""
        return self.get_by_field("course_slug", slug)
    
    def get_by_code(self, course_code: str) -> Optional[Course]:
        """Get course by course code."""
        return self.get_by_field("course_code", course_code)
    
    def get_by_category(self, category: str, active_only: bool = True) -> List[Course]:
        """Get courses by category."""
        filters = {"category": category}
        if active_only:
            filters["is_active"] = True
        return self.filter_by(**filters)
    
    def get_by_level(self, level: str, active_only: bool = True) -> List[Course]:
        """Get courses by level."""
        filters = {"level": level}
        if active_only:
            filters["is_active"] = True
        return self.filter_by(**filters)
    
    def get_featured_courses(self) -> List[Course]:
        """Get featured courses."""
        return self.filter_by(is_featured=True, is_active=True)


class AcademyCourseRepository(BaseRepository[AcademyCourse, dict, dict]):
    """Repository for academy-course relationships."""
    
    def __init__(self, db: Session):
        super().__init__(AcademyCourse, db)
    
    def get_academy_courses(self, academy_id: UUID, available_only: bool = True) -> List[AcademyCourse]:
        """Get all courses for an academy."""
        filters = {"academy_id": academy_id}
        if available_only:
            filters["is_available"] = True
        return self.filter_by(**filters)
    
    def get_course_academies(self, course_id: UUID, available_only: bool = True) -> List[AcademyCourse]:
        """Get all academies offering a course."""
        filters = {"course_id": course_id}
        if available_only:
            filters["is_available"] = True
        return self.filter_by(**filters)
    
    def get_relationship(self, academy_id: UUID, course_id: UUID) -> Optional[AcademyCourse]:
        """Get specific academy-course relationship."""
        return self.db.query(AcademyCourse).filter(
            and_(
                AcademyCourse.academy_id == academy_id,
                AcademyCourse.course_id == course_id
            )
        ).first()
    
    def is_course_offered(self, academy_id: UUID, course_id: UUID) -> bool:
        """Check if academy offers course."""
        relationship = self.get_relationship(academy_id, course_id)
        return relationship is not None and relationship.is_available