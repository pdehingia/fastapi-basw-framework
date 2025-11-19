"""Business Management Service for Admin Panel."""

import json
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any, Tuple
from uuid import UUID
from sqlalchemy import func, and_, or_
from sqlalchemy.orm import Session

from app.shared.repositories.business import (
    SalonRepository,
    AcademyRepository, 
    ServiceRepository,
    SalonProviderRepository,
    CourseRepository,
    AcademyCourseRepository
)
from app.shared.models.business import Salon, Academy, Service
from app.core.exceptions import NotFoundException, ConflictException
from .schemas import (
    SalonFilters,
    AcademyFilters,
    ServiceFilters,
    SalonCreateRequest,
    AcademyCreateRequest,
    ServiceCreateRequest,
    SalonUpdateRequest,
    AcademyUpdateRequest,
    ServiceUpdateRequest,
    SalonResponse,
    AcademyResponse,
    ServiceResponse,
    SalonListResponse,
    AcademyListResponse,
    ServiceListResponse,
    BusinessStatisticsResponse
)


class BusinessManagementService:
    """Service for managing business entities in admin panel."""
    
    def __init__(
        self,
        salon_repo: SalonRepository,
        academy_repo: AcademyRepository,
        service_repo: ServiceRepository,
        salon_provider_repo: SalonProviderRepository,
        course_repo: CourseRepository,
        academy_course_repo: AcademyCourseRepository
    ):
        self.salon_repo = salon_repo
        self.academy_repo = academy_repo
        self.service_repo = service_repo
        self.salon_provider_repo = salon_provider_repo
        self.course_repo = course_repo
        self.academy_course_repo = academy_course_repo

    # Salon Management
    def get_salons_with_filters(
        self,
        filters: SalonFilters,
        page: int = 1,
        size: int = 20,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> SalonListResponse:
        """Get salons with filtering and pagination."""
        
        # Build query
        query = self.salon_repo.db.query(Salon)
        
        # Apply filters
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.filter(Salon.salon_name.ilike(search_term))
        
        if filters.is_active is not None:
            query = query.filter(Salon.is_active == filters.is_active)
        
        if filters.is_verified is not None:
            query = query.filter(Salon.is_verified == filters.is_verified)
        
        if filters.commission_min is not None:
            query = query.filter(Salon.commission_rate >= filters.commission_min)
        
        if filters.commission_max is not None:
            query = query.filter(Salon.commission_rate <= filters.commission_max)
        
        if filters.created_from:
            query = query.filter(Salon.created_at >= filters.created_from)
        
        if filters.created_to:
            query = query.filter(Salon.created_at <= filters.created_to)
        
        # Get total count
        total = query.count()
        
        # Apply sorting
        if sort_order.lower() == "desc":
            query = query.order_by(getattr(Salon, sort_by).desc())
        else:
            query = query.order_by(getattr(Salon, sort_by))
        
        # Apply pagination
        offset = (page - 1) * size
        salons = query.offset(offset).limit(size).all()
        
        total_pages = (total + size - 1) // size
        
        return SalonListResponse(
            salons=salons,
            total=total,
            page=page,
            size=size,
            total_pages=total_pages
        )

    def get_salon_by_id(self, salon_id: UUID) -> SalonResponse:
        """Get salon by ID."""
        salon = self.salon_repo.get(salon_id)
        if not salon:
            raise NotFoundException("Salon not found")
        return SalonResponse.model_validate(salon)

    def create_salon(self, salon_data: SalonCreateRequest) -> SalonResponse:
        """Create new salon."""
        
        # Check for existing salon with same name or slug
        if self.salon_repo.get_by_name(salon_data.salon_name):
            raise ConflictException("Salon with this name already exists")
        
        if self.salon_repo.get_by_slug(salon_data.salon_slug):
            raise ConflictException("Salon with this slug already exists")
        
        # Create salon data dict
        create_data = salon_data.model_dump()
        if create_data.get("business_hours"):
            create_data["business_hours"] = json.dumps(create_data["business_hours"])
        
        salon = self.salon_repo.create(create_data)
        return SalonResponse.model_validate(salon)

    def update_salon(self, salon_id: UUID, salon_data: SalonUpdateRequest) -> SalonResponse:
        """Update salon."""
        salon = self.salon_repo.get(salon_id)
        if not salon:
            raise NotFoundException("Salon not found")
        
        # Check for conflicts on name/slug changes
        if salon_data.salon_name and salon_data.salon_name != salon.salon_name:
            existing = self.salon_repo.get_by_name(salon_data.salon_name)
            if existing and existing.id != salon_id:
                raise ConflictException("Salon with this name already exists")
        
        if salon_data.salon_slug and salon_data.salon_slug != salon.salon_slug:
            existing = self.salon_repo.get_by_slug(salon_data.salon_slug)
            if existing and existing.id != salon_id:
                raise ConflictException("Salon with this slug already exists")
        
        # Prepare update data
        update_data = salon_data.model_dump(exclude_unset=True)
        if "business_hours" in update_data and update_data["business_hours"] is not None:
            update_data["business_hours"] = json.dumps(update_data["business_hours"])
        
        updated_salon = self.salon_repo.update(salon_id, update_data)
        return SalonResponse.model_validate(updated_salon)

    def delete_salon(self, salon_id: UUID) -> bool:
        """Delete salon."""
        salon = self.salon_repo.get(salon_id)
        if not salon:
            raise NotFoundException("Salon not found")
        
        return self.salon_repo.delete(salon_id)

    # Academy Management
    def get_academies_with_filters(
        self,
        filters: AcademyFilters,
        page: int = 1,
        size: int = 20,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> AcademyListResponse:
        """Get academies with filtering and pagination."""
        
        # Build query
        query = self.academy_repo.db.query(Academy)
        
        # Apply filters
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.filter(Academy.academy_name.ilike(search_term))
        
        if filters.provider_user_id:
            query = query.filter(Academy.provider_user_id == filters.provider_user_id)
        
        if filters.is_active is not None:
            query = query.filter(Academy.is_active == filters.is_active)
        
        if filters.is_verified is not None:
            query = query.filter(Academy.is_verified == filters.is_verified)
        
        if filters.has_gst is not None:
            if filters.has_gst:
                query = query.filter(Academy.gst_number.isnot(None))
            else:
                query = query.filter(Academy.gst_number.is_(None))
        
        if filters.has_registration is not None:
            if filters.has_registration:
                query = query.filter(Academy.registration_number.isnot(None))
            else:
                query = query.filter(Academy.registration_number.is_(None))
        
        if filters.created_from:
            query = query.filter(Academy.created_at >= filters.created_from)
        
        if filters.created_to:
            query = query.filter(Academy.created_at <= filters.created_to)
        
        # Get total count
        total = query.count()
        
        # Apply sorting
        if sort_order.lower() == "desc":
            query = query.order_by(getattr(Academy, sort_by).desc())
        else:
            query = query.order_by(getattr(Academy, sort_by))
        
        # Apply pagination
        offset = (page - 1) * size
        academies = query.offset(offset).limit(size).all()
        
        total_pages = (total + size - 1) // size
        
        return AcademyListResponse(
            academies=academies,
            total=total,
            page=page,
            size=size,
            total_pages=total_pages
        )

    def get_academy_by_id(self, academy_id: UUID) -> AcademyResponse:
        """Get academy by ID."""
        academy = self.academy_repo.get(academy_id)
        if not academy:
            raise NotFoundException("Academy not found")
        return AcademyResponse.model_validate(academy)

    def create_academy(self, academy_data: AcademyCreateRequest) -> AcademyResponse:
        """Create new academy."""
        
        # Check for existing academy with same name
        if self.academy_repo.get_by_name(academy_data.academy_name):
            raise ConflictException("Academy with this name already exists")
        
        # Check for unique constraints
        if academy_data.registration_number:
            if self.academy_repo.get_by_registration_number(academy_data.registration_number):
                raise ConflictException("Academy with this registration number already exists")
        
        if academy_data.gst_number:
            if self.academy_repo.get_by_gst_number(academy_data.gst_number):
                raise ConflictException("Academy with this GST number already exists")
        
        if academy_data.provider_user_id:
            if self.academy_repo.get_by_provider(academy_data.provider_user_id):
                raise ConflictException("Provider already has an academy")
        
        # Create academy data dict
        create_data = academy_data.model_dump()
        if create_data.get("branding"):
            create_data["branding"] = json.dumps(create_data["branding"])
        
        academy = self.academy_repo.create(create_data)
        return AcademyResponse.model_validate(academy)

    def update_academy(self, academy_id: UUID, academy_data: AcademyUpdateRequest) -> AcademyResponse:
        """Update academy."""
        academy = self.academy_repo.get(academy_id)
        if not academy:
            raise NotFoundException("Academy not found")
        
        # Check for conflicts on unique field changes
        if academy_data.academy_name and academy_data.academy_name != academy.academy_name:
            existing = self.academy_repo.get_by_name(academy_data.academy_name)
            if existing and existing.id != academy_id:
                raise ConflictException("Academy with this name already exists")
        
        # Prepare update data
        update_data = academy_data.model_dump(exclude_unset=True)
        if "branding" in update_data and update_data["branding"] is not None:
            update_data["branding"] = json.dumps(update_data["branding"])
        
        updated_academy = self.academy_repo.update(academy_id, update_data)
        return AcademyResponse.model_validate(updated_academy)

    def delete_academy(self, academy_id: UUID) -> bool:
        """Delete academy."""
        academy = self.academy_repo.get(academy_id)
        if not academy:
            raise NotFoundException("Academy not found")
        
        return self.academy_repo.delete(academy_id)

    # Service Management
    def get_services_with_filters(
        self,
        filters: ServiceFilters,
        page: int = 1,
        size: int = 20,
        sort_by: str = "display_order",
        sort_order: str = "asc"
    ) -> ServiceListResponse:
        """Get services with filtering and pagination."""
        
        # Build query
        query = self.service_repo.db.query(Service)
        
        # Apply filters
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.filter(
                or_(
                    Service.service_name.ilike(search_term),
                    Service.description.ilike(search_term)
                )
            )
        
        if filters.category:
            query = query.filter(Service.category == filters.category)
        
        if filters.is_active is not None:
            query = query.filter(Service.is_active == filters.is_active)
        
        if filters.is_featured is not None:
            query = query.filter(Service.is_featured == filters.is_featured)
        
        if filters.price_min is not None:
            query = query.filter(Service.suggested_price_min >= filters.price_min)
        
        if filters.price_max is not None:
            query = query.filter(Service.suggested_price_max <= filters.price_max)
        
        if filters.duration_min is not None:
            query = query.filter(Service.default_duration_minutes >= filters.duration_min)
        
        if filters.duration_max is not None:
            query = query.filter(Service.default_duration_minutes <= filters.duration_max)
        
        # Get total count
        total = query.count()
        
        # Apply sorting
        if sort_order.lower() == "desc":
            query = query.order_by(getattr(Service, sort_by).desc())
        else:
            query = query.order_by(getattr(Service, sort_by))
        
        # Apply pagination
        offset = (page - 1) * size
        services = query.offset(offset).limit(size).all()
        
        total_pages = (total + size - 1) // size
        
        return ServiceListResponse(
            services=services,
            total=total,
            page=page,
            size=size,
            total_pages=total_pages
        )

    def get_service_by_id(self, service_id: UUID) -> ServiceResponse:
        """Get service by ID."""
        service = self.service_repo.get(service_id)
        if not service:
            raise NotFoundException("Service not found")
        return ServiceResponse.model_validate(service)

    def create_service(self, service_data: ServiceCreateRequest) -> ServiceResponse:
        """Create new service."""
        
        # Check for existing service with same name or slug
        if self.service_repo.get_by_name(service_data.service_name):
            raise ConflictException("Service with this name already exists")
        
        if self.service_repo.get_by_slug(service_data.service_slug):
            raise ConflictException("Service with this slug already exists")
        
        # Create service data dict
        create_data = service_data.model_dump()
        if create_data.get("service_metadata"):
            create_data["service_metadata"] = json.dumps(create_data["service_metadata"])
        
        service = self.service_repo.create(create_data)
        return ServiceResponse.model_validate(service)

    def update_service(self, service_id: UUID, service_data: ServiceUpdateRequest) -> ServiceResponse:
        """Update service."""
        service = self.service_repo.get(service_id)
        if not service:
            raise NotFoundException("Service not found")
        
        # Check for conflicts on name/slug changes
        if service_data.service_name and service_data.service_name != service.service_name:
            existing = self.service_repo.get_by_name(service_data.service_name)
            if existing and existing.id != service_id:
                raise ConflictException("Service with this name already exists")
        
        if service_data.service_slug and service_data.service_slug != service.service_slug:
            existing = self.service_repo.get_by_slug(service_data.service_slug)
            if existing and existing.id != service_id:
                raise ConflictException("Service with this slug already exists")
        
        # Prepare update data
        update_data = service_data.model_dump(exclude_unset=True)
        if "service_metadata" in update_data and update_data["service_metadata"] is not None:
            update_data["service_metadata"] = json.dumps(update_data["service_metadata"])
        
        updated_service = self.service_repo.update(service_id, update_data)
        return ServiceResponse.model_validate(updated_service)

    def delete_service(self, service_id: UUID) -> bool:
        """Delete service."""
        service = self.service_repo.get(service_id)
        if not service:
            raise NotFoundException("Service not found")
        
        return self.service_repo.delete(service_id)

    # Statistics and utilities
    def get_business_statistics(self) -> BusinessStatisticsResponse:
        """Get business statistics."""
        
        # Salon statistics
        total_salons = self.salon_repo.db.query(func.count(Salon.id)).scalar()
        active_salons = self.salon_repo.db.query(func.count(Salon.id)).filter(
            Salon.is_active == True
        ).scalar()
        verified_salons = self.salon_repo.db.query(func.count(Salon.id)).filter(
            Salon.is_verified == True
        ).scalar()
        
        # Academy statistics
        total_academies = self.academy_repo.db.query(func.count(Academy.id)).scalar()
        active_academies = self.academy_repo.db.query(func.count(Academy.id)).filter(
            Academy.is_active == True
        ).scalar()
        verified_academies = self.academy_repo.db.query(func.count(Academy.id)).filter(
            Academy.is_verified == True
        ).scalar()
        
        # Service statistics
        total_services = self.service_repo.db.query(func.count(Service.id)).scalar()
        active_services = self.service_repo.db.query(func.count(Service.id)).filter(
            Service.is_active == True
        ).scalar()
        featured_services = self.service_repo.db.query(func.count(Service.id)).filter(
            Service.is_featured == True
        ).scalar()
        
        # Services by category
        services_by_category = {}
        category_results = self.service_repo.db.query(
            Service.category,
            func.count(Service.id)
        ).filter(Service.is_active == True).group_by(Service.category).all()
        
        for category, count in category_results:
            services_by_category[category] = count
        
        # Recent additions (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        recent_salons = self.salon_repo.db.query(func.count(Salon.id)).filter(
            Salon.created_at >= thirty_days_ago
        ).scalar()
        
        recent_academies = self.academy_repo.db.query(func.count(Academy.id)).filter(
            Academy.created_at >= thirty_days_ago
        ).scalar()
        
        recent_services = self.service_repo.db.query(func.count(Service.id)).filter(
            Service.created_at >= thirty_days_ago
        ).scalar()
        
        return BusinessStatisticsResponse(
            total_salons=total_salons,
            active_salons=active_salons,
            verified_salons=verified_salons,
            total_academies=total_academies,
            active_academies=active_academies,
            verified_academies=verified_academies,
            total_services=total_services,
            active_services=active_services,
            featured_services=featured_services,
            services_by_category=services_by_category,
            recent_salons=recent_salons,
            recent_academies=recent_academies,
            recent_services=recent_services
        )

    # Status update methods
    def update_salon_status(
        self, 
        salon_id: UUID, 
        is_active: Optional[bool] = None,
        is_verified: Optional[bool] = None
    ) -> SalonResponse:
        """Update salon status flags."""
        salon = self.salon_repo.get(salon_id)
        if not salon:
            raise NotFoundException("Salon not found")
        
        update_data = {}
        if is_active is not None:
            update_data["is_active"] = is_active
        if is_verified is not None:
            update_data["is_verified"] = is_verified
        
        updated_salon = self.salon_repo.update(salon_id, update_data)
        return SalonResponse.model_validate(updated_salon)

    def update_academy_status(
        self, 
        academy_id: UUID, 
        is_active: Optional[bool] = None,
        is_verified: Optional[bool] = None
    ) -> AcademyResponse:
        """Update academy status flags."""
        academy = self.academy_repo.get(academy_id)
        if not academy:
            raise NotFoundException("Academy not found")
        
        update_data = {}
        if is_active is not None:
            update_data["is_active"] = is_active
        if is_verified is not None:
            update_data["is_verified"] = is_verified
        
        updated_academy = self.academy_repo.update(academy_id, update_data)
        return AcademyResponse.model_validate(updated_academy)

    def update_service_status(
        self, 
        service_id: UUID, 
        is_active: Optional[bool] = None,
        is_featured: Optional[bool] = None
    ) -> ServiceResponse:
        """Update service status flags."""
        service = self.service_repo.get(service_id)
        if not service:
            raise NotFoundException("Service not found")
        
        update_data = {}
        if is_active is not None:
            update_data["is_active"] = is_active
        if is_featured is not None:
            update_data["is_featured"] = is_featured
        
        updated_service = self.service_repo.update(service_id, update_data)
        return ServiceResponse.model_validate(updated_service)

    # Search methods
    def search_salons(self, search_term: str, limit: int = 10) -> List[SalonResponse]:
        """Quick search for salons."""
        salons = self.salon_repo.search_by_name(search_term)
        limited_salons = salons[:limit] if len(salons) > limit else salons
        return [SalonResponse.model_validate(salon) for salon in limited_salons]

    def search_academies(self, search_term: str, limit: int = 10) -> List[AcademyResponse]:
        """Quick search for academies."""
        academies = self.academy_repo.search_by_name(search_term)
        limited_academies = academies[:limit] if len(academies) > limit else academies
        return [AcademyResponse.model_validate(academy) for academy in limited_academies]

    def search_services(self, search_term: str, limit: int = 10) -> List[ServiceResponse]:
        """Quick search for services."""
        services = self.service_repo.search_services(search_term)
        limited_services = services[:limit] if len(services) > limit else services
        return [ServiceResponse.model_validate(service) for service in limited_services]
