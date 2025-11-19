"""Provider Management Service for Admin Panel."""

import json
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any, Tuple
from uuid import UUID
from sqlalchemy import func, and_, or_
from sqlalchemy.orm import Session

from app.shared.repositories.user import ProviderUserRepository
from app.shared.models.user import ProviderUser
from app.shared.schemas.user import ProviderUserCreate, ProviderUserUpdate
from app.core.exceptions import NotFoundException, ConflictException
from .schemas import (
    ProviderUserFilters, 
    ProviderStatisticsResponse,
    ProviderUserCreateRequest,
    ProviderUserUpdateRequest,
    ProviderUserResponse,
    ProviderUserListResponse
)


class ProviderManagementService:
    """Service for managing provider users in admin panel."""
    
    def __init__(self, provider_repository: ProviderUserRepository):
        self.provider_repo = provider_repository

    def get_providers_with_filters(
        self,
        filters: ProviderUserFilters,
        page: int = 1,
        size: int = 20,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> ProviderUserListResponse:
        """Get providers with filtering and pagination."""
        
        # Build query
        query = self.provider_repo.db.query(ProviderUser)
        
        # Apply filters
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.filter(
                or_(
                    ProviderUser.email.ilike(search_term),
                    ProviderUser.username.ilike(search_term),
                    ProviderUser.full_name.ilike(search_term),
                    ProviderUser.business_name.ilike(search_term)
                )
            )
        
        if filters.email:
            query = query.filter(ProviderUser.email.ilike(f"%{filters.email}%"))
        
        if filters.verification_status:
            query = query.filter(ProviderUser.verification_status == filters.verification_status)
        
        if filters.business_type:
            query = query.filter(ProviderUser.business_type == filters.business_type)
        
        if filters.is_active is not None:
            query = query.filter(ProviderUser.is_active == filters.is_active)
        
        if filters.is_verified is not None:
            query = query.filter(ProviderUser.is_verified == filters.is_verified)
        
        if filters.is_accepting_bookings is not None:
            query = query.filter(ProviderUser.is_accepting_bookings == filters.is_accepting_bookings)
        
        if filters.has_business_registration is not None:
            if filters.has_business_registration:
                query = query.filter(ProviderUser.business_registration_number.isnot(None))
            else:
                query = query.filter(ProviderUser.business_registration_number.is_(None))
        
        if filters.created_from:
            query = query.filter(ProviderUser.created_at >= filters.created_from)
        
        if filters.created_to:
            query = query.filter(ProviderUser.created_at <= filters.created_to)
        
        # Get total count
        total = query.count()
        
        # Apply sorting
        if sort_order.lower() == "desc":
            query = query.order_by(getattr(ProviderUser, sort_by).desc())
        else:
            query = query.order_by(getattr(ProviderUser, sort_by))
        
        # Apply pagination
        offset = (page - 1) * size
        providers = query.offset(offset).limit(size).all()
        
        total_pages = (total + size - 1) // size
        
        return ProviderUserListResponse(
            providers=providers,
            total=total,
            page=page,
            size=size,
            total_pages=total_pages
        )

    def get_provider_by_id(self, provider_id: UUID) -> ProviderUserResponse:
        """Get provider by ID."""
        provider = self.provider_repo.get(provider_id)
        if not provider:
            raise NotFoundException("Provider user not found")
        return ProviderUserResponse.model_validate(provider)

    def create_provider(self, provider_data: ProviderUserCreateRequest) -> ProviderUserResponse:
        """Create new provider user."""
        
        # Convert to ProviderUserCreate schema
        create_data = ProviderUserCreate(
            email=provider_data.email,
            username=provider_data.username,
            password=provider_data.password,
            full_name=provider_data.full_name,
            phone=provider_data.phone,
            business_name=provider_data.business_name,
            business_type=provider_data.business_type,
            business_registration_number=provider_data.business_registration_number,
            tax_id=provider_data.tax_id,
            is_accepting_bookings=provider_data.is_accepting_bookings,
            business_hours=json.dumps(provider_data.business_hours) if provider_data.business_hours else None,
            service_area=provider_data.service_area,
            is_active=provider_data.is_active,
            verification_status=provider_data.verification_status
        )
        
        try:
            provider = self.provider_repo.create_provider_user(create_data)
            return ProviderUserResponse.model_validate(provider)
        except ConflictException:
            raise ConflictException("Provider with this email or username already exists")

    def update_provider(self, provider_id: UUID, provider_data: ProviderUserUpdateRequest) -> ProviderUserResponse:
        """Update provider user."""
        provider = self.provider_repo.get(provider_id)
        if not provider:
            raise NotFoundException("Provider user not found")
        
        # Convert to ProviderUserUpdate schema
        update_data = ProviderUserUpdate(
            full_name=provider_data.full_name,
            phone=provider_data.phone,
            business_name=provider_data.business_name,
            business_type=provider_data.business_type,
            business_registration_number=provider_data.business_registration_number,
            tax_id=provider_data.tax_id,
            is_accepting_bookings=provider_data.is_accepting_bookings,
            business_hours=json.dumps(provider_data.business_hours) if provider_data.business_hours else None,
            service_area=provider_data.service_area,
            is_active=provider_data.is_active,
            is_verified=provider_data.is_verified,
            verification_status=provider_data.verification_status
        )
        
        updated_provider = self.provider_repo.update(provider_id, update_data)
        return ProviderUserResponse.model_validate(updated_provider)

    def delete_provider(self, provider_id: UUID) -> bool:
        """Delete provider user."""
        provider = self.provider_repo.get(provider_id)
        if not provider:
            raise NotFoundException("Provider user not found")
        
        return self.provider_repo.delete(provider_id)

    def update_provider_verification_status(
        self, 
        provider_id: UUID, 
        verification_status: str,
        verification_notes: Optional[str] = None
    ) -> ProviderUserResponse:
        """Update provider verification status."""
        provider = self.provider_repo.get(provider_id)
        if not provider:
            raise NotFoundException("Provider user not found")
        
        update_data = ProviderUserUpdate(
            verification_status=verification_status,
            is_verified=(verification_status == "verified"),
            verified_at=datetime.utcnow() if verification_status == "verified" else None
        )
        
        updated_provider = self.provider_repo.update(provider_id, update_data)
        return ProviderUserResponse.model_validate(updated_provider)

    def update_provider_status(
        self, 
        provider_id: UUID, 
        is_active: Optional[bool] = None,
        is_accepting_bookings: Optional[bool] = None
    ) -> ProviderUserResponse:
        """Update provider status flags."""
        provider = self.provider_repo.get(provider_id)
        if not provider:
            raise NotFoundException("Provider user not found")
        
        update_data = ProviderUserUpdate()
        if is_active is not None:
            update_data.is_active = is_active
        if is_accepting_bookings is not None:
            update_data.is_accepting_bookings = is_accepting_bookings
        
        updated_provider = self.provider_repo.update(provider_id, update_data)
        return ProviderUserResponse.model_validate(updated_provider)

    def update_provider_business_hours(
        self, 
        provider_id: UUID, 
        business_hours: Dict[str, Any]
    ) -> ProviderUserResponse:
        """Update provider business hours."""
        provider = self.provider_repo.get(provider_id)
        if not provider:
            raise NotFoundException("Provider user not found")
        
        update_data = ProviderUserUpdate(
            business_hours=json.dumps(business_hours)
        )
        
        updated_provider = self.provider_repo.update(provider_id, update_data)
        return ProviderUserResponse.model_validate(updated_provider)

    def get_provider_statistics(self) -> ProviderStatisticsResponse:
        """Get provider user statistics."""
        
        # Basic counts
        total_providers = self.provider_repo.db.query(func.count(ProviderUser.id)).scalar()
        active_providers = self.provider_repo.db.query(func.count(ProviderUser.id)).filter(
            ProviderUser.is_active == True
        ).scalar()
        verified_providers = self.provider_repo.db.query(func.count(ProviderUser.id)).filter(
            ProviderUser.is_verified == True
        ).scalar()
        pending_verification = self.provider_repo.db.query(func.count(ProviderUser.id)).filter(
            ProviderUser.verification_status == "pending"
        ).scalar()
        accepting_bookings = self.provider_repo.db.query(func.count(ProviderUser.id)).filter(
            ProviderUser.is_accepting_bookings == True
        ).scalar()
        
        # Recent registrations (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_registrations = self.provider_repo.db.query(func.count(ProviderUser.id)).filter(
            ProviderUser.created_at >= thirty_days_ago
        ).scalar()
        
        # Verification status breakdown
        verification_stats = {}
        verification_results = self.provider_repo.db.query(
            ProviderUser.verification_status,
            func.count(ProviderUser.id)
        ).group_by(ProviderUser.verification_status).all()
        
        for status, count in verification_results:
            verification_stats[status or "unknown"] = count
        
        # Business type breakdown
        business_type_stats = {}
        business_type_results = self.provider_repo.db.query(
            ProviderUser.business_type,
            func.count(ProviderUser.id)
        ).group_by(ProviderUser.business_type).all()
        
        for business_type, count in business_type_results:
            business_type_stats[business_type or "unknown"] = count
        
        return ProviderStatisticsResponse(
            total_providers=total_providers,
            active_providers=active_providers,
            verified_providers=verified_providers,
            pending_verification=pending_verification,
            accepting_bookings=accepting_bookings,
            recent_registrations=recent_registrations,
            verification_stats=verification_stats,
            business_type_stats=business_type_stats
        )

    def search_providers(self, search_term: str, limit: int = 10) -> List[ProviderUserResponse]:
        """Quick search for providers."""
        search_pattern = f"%{search_term}%"
        providers = self.provider_repo.db.query(ProviderUser).filter(
            or_(
                ProviderUser.email.ilike(search_pattern),
                ProviderUser.username.ilike(search_pattern),
                ProviderUser.full_name.ilike(search_pattern),
                ProviderUser.business_name.ilike(search_pattern)
            )
        ).limit(limit).all()
        
        return [ProviderUserResponse.model_validate(provider) for provider in providers]
