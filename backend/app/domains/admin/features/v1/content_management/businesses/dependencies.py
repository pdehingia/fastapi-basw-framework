"""Business Management Dependencies for Admin Panel."""

from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.shared.repositories.business import (
    SalonRepository,
    AcademyRepository,
    ServiceRepository,
    SalonProviderRepository,
    CourseRepository,
    AcademyCourseRepository
)
from .service import BusinessManagementService


def get_salon_repository(db: Session = Depends(get_db)) -> SalonRepository:
    """Get salon repository."""
    return SalonRepository(db)


def get_academy_repository(db: Session = Depends(get_db)) -> AcademyRepository:
    """Get academy repository."""
    return AcademyRepository(db)


def get_service_repository(db: Session = Depends(get_db)) -> ServiceRepository:
    """Get service repository."""
    return ServiceRepository(db)


def get_salon_provider_repository(db: Session = Depends(get_db)) -> SalonProviderRepository:
    """Get salon provider repository."""
    return SalonProviderRepository(db)


def get_course_repository(db: Session = Depends(get_db)) -> CourseRepository:
    """Get course repository."""
    return CourseRepository(db)


def get_academy_course_repository(db: Session = Depends(get_db)) -> AcademyCourseRepository:
    """Get academy course repository."""
    return AcademyCourseRepository(db)


def get_business_management_service(
    salon_repo: SalonRepository = Depends(get_salon_repository),
    academy_repo: AcademyRepository = Depends(get_academy_repository),
    service_repo: ServiceRepository = Depends(get_service_repository),
    salon_provider_repo: SalonProviderRepository = Depends(get_salon_provider_repository),
    course_repo: CourseRepository = Depends(get_course_repository),
    academy_course_repo: AcademyCourseRepository = Depends(get_academy_course_repository)
) -> BusinessManagementService:
    """Get business management service."""
    return BusinessManagementService(
        salon_repo=salon_repo,
        academy_repo=academy_repo,
        service_repo=service_repo,
        salon_provider_repo=salon_provider_repo,
        course_repo=course_repo,
        academy_course_repo=academy_course_repo
    )