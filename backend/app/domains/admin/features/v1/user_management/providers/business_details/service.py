"""Provider business details and salon ownership management service."""

from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional, Dict, Any, Tuple
from uuid import UUID
from sqlalchemy import func, and_, or_, desc
from sqlalchemy.orm import Session

from app.shared.models.provider_business import ProviderBusinessDetail, ProviderSalon
from app.shared.models.user import ProviderUser
from app.shared.models.business import Salon
from app.core.exceptions import NotFoundException, ConflictException, ValidationException
from .schemas import (
    ProviderBusinessDetailCreate, ProviderBusinessDetailUpdate, ProviderBusinessDetailResponse,
    ProviderSalonCreate, ProviderSalonUpdate, ProviderSalonResponse,
    ApprovalRequest, FeaturedStatusUpdate, TransferOwnershipRequest,
    BusinessDetailFilterParams, SalonOwnershipFilterParams,
    BusinessStatistics, SalonOwnershipStatistics,
    ProviderBusinessDetailListResponse, ProviderSalonListResponse
)


class BusinessDetailsService:
    """Service for managing provider business details and salon ownership."""
    
    def __init__(self, db: Session, admin_user_id: UUID):
        self.db = db
        self.admin_user_id = admin_user_id

    # ===== PROVIDER BUSINESS DETAIL CRUD =====

    def create_business_detail(self, data: ProviderBusinessDetailCreate) -> ProviderBusinessDetailResponse:
        """Create provider business detail."""
        # Check if provider exists
        provider = self.db.query(ProviderUser).filter(
            ProviderUser.id == data.provider_user_id
        ).first()
        if not provider:
            raise NotFoundException(f"Provider with ID {data.provider_user_id} not found")
        
        # Check if business detail already exists
        existing = self.db.query(ProviderBusinessDetail).filter(
            ProviderBusinessDetail.provider_user_id == data.provider_user_id
        ).first()
        if existing:
            raise ConflictException(f"Business detail already exists for provider {data.provider_user_id}")
        
        # Create business detail
        detail = ProviderBusinessDetail(
            provider_user_id=data.provider_user_id,
            tax_id=data.tax_id,
            business_license=data.business_license,
            insurance_policy=data.insurance_policy,
            years_experience=data.years_experience,
            specializations=data.specializations,
            certifications=data.certifications,
            languages_spoken=data.languages_spoken,
            service_radius_km=data.service_radius_km,
            mobile_service_available=data.mobile_service_available,
            accepts_walk_ins=data.accepts_walk_ins,
            payment_methods=data.payment_methods,
            approval_status='pending',
            is_featured=False,
            total_reviews=0,
            total_bookings=0
        )
        
        self.db.add(detail)
        self.db.commit()
        self.db.refresh(detail)
        
        return ProviderBusinessDetailResponse.model_validate(detail)

    def get_business_details(
        self,
        filters: BusinessDetailFilterParams,
        page: int = 1,
        size: int = 20
    ) -> ProviderBusinessDetailListResponse:
        """Get business details with filtering and pagination."""
        query = self.db.query(ProviderBusinessDetail)
        
        # Apply filters
        if filters.approval_status:
            query = query.filter(ProviderBusinessDetail.approval_status == filters.approval_status)
        
        if filters.is_featured is not None:
            query = query.filter(ProviderBusinessDetail.is_featured == filters.is_featured)
        
        if filters.min_rating:
            query = query.filter(ProviderBusinessDetail.rating >= filters.min_rating)
        
        if filters.mobile_service_available is not None:
            query = query.filter(
                ProviderBusinessDetail.mobile_service_available == filters.mobile_service_available
            )
        
        if filters.min_years_experience:
            query = query.filter(
                ProviderBusinessDetail.years_experience >= filters.min_years_experience
            )
        
        if filters.specialization:
            query = query.filter(
                ProviderBusinessDetail.specializations.contains([filters.specialization])
            )
        
        if filters.certification:
            query = query.filter(
                ProviderBusinessDetail.certifications.contains([filters.certification])
            )
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * size
        items = query.order_by(desc(ProviderBusinessDetail.created_at))\
                     .offset(offset)\
                     .limit(size)\
                     .all()
        
        pages = (total + size - 1) // size
        
        return ProviderBusinessDetailListResponse(
            items=[ProviderBusinessDetailResponse.model_validate(item) for item in items],
            total=total,
            page=page,
            size=size,
            pages=pages
        )

    def get_business_detail(self, detail_id: UUID) -> ProviderBusinessDetailResponse:
        """Get business detail by ID."""
        detail = self.db.query(ProviderBusinessDetail).filter(
            ProviderBusinessDetail.id == detail_id
        ).first()
        
        if not detail:
            raise NotFoundException(f"Business detail with ID {detail_id} not found")
        
        return ProviderBusinessDetailResponse.model_validate(detail)

    def update_business_detail(
        self,
        detail_id: UUID,
        data: ProviderBusinessDetailUpdate
    ) -> ProviderBusinessDetailResponse:
        """Update business detail."""
        detail = self.db.query(ProviderBusinessDetail).filter(
            ProviderBusinessDetail.id == detail_id
        ).first()
        
        if not detail:
            raise NotFoundException(f"Business detail with ID {detail_id} not found")
        
        # Update fields
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(detail, field, value)
        
        detail.updated_at = datetime.utcnow().date()
        
        self.db.commit()
        self.db.refresh(detail)
        
        return ProviderBusinessDetailResponse.model_validate(detail)

    def delete_business_detail(self, detail_id: UUID) -> None:
        """Delete business detail."""
        detail = self.db.query(ProviderBusinessDetail).filter(
            ProviderBusinessDetail.id == detail_id
        ).first()
        
        if not detail:
            raise NotFoundException(f"Business detail with ID {detail_id} not found")
        
        self.db.delete(detail)
        self.db.commit()

    # ===== APPROVAL WORKFLOW =====

    def approve_or_reject_business_detail(
        self,
        detail_id: UUID,
        request: ApprovalRequest
    ) -> ProviderBusinessDetailResponse:
        """Approve or reject provider business detail."""
        detail = self.db.query(ProviderBusinessDetail).filter(
            ProviderBusinessDetail.id == detail_id
        ).first()
        
        if not detail:
            raise NotFoundException(f"Business detail with ID {detail_id} not found")
        
        if request.approved:
            detail.approval_status = 'approved'
            detail.approval_date = date.today()
            detail.approved_by = self.admin_user_id
            detail.rejection_reason = None
        else:
            detail.approval_status = 'rejected'
            detail.approval_date = date.today()
            detail.approved_by = self.admin_user_id
            detail.rejection_reason = request.rejection_reason
        
        detail.updated_at = datetime.utcnow().date()
        
        self.db.commit()
        self.db.refresh(detail)
        
        return ProviderBusinessDetailResponse.model_validate(detail)

    def update_featured_status(
        self,
        detail_id: UUID,
        status_update: FeaturedStatusUpdate
    ) -> ProviderBusinessDetailResponse:
        """Update featured status of provider."""
        detail = self.db.query(ProviderBusinessDetail).filter(
            ProviderBusinessDetail.id == detail_id
        ).first()
        
        if not detail:
            raise NotFoundException(f"Business detail with ID {detail_id} not found")
        
        detail.is_featured = status_update.is_featured
        detail.featured_until = status_update.featured_until if status_update.is_featured else None
        detail.updated_at = datetime.utcnow().date()
        
        self.db.commit()
        self.db.refresh(detail)
        
        return ProviderBusinessDetailResponse.model_validate(detail)

    # ===== SALON OWNERSHIP CRUD =====

    def create_salon_ownership(self, data: ProviderSalonCreate) -> ProviderSalonResponse:
        """Create provider-salon ownership relationship."""
        # Check if provider exists
        provider = self.db.query(ProviderUser).filter(
            ProviderUser.id == data.provider_user_id
        ).first()
        if not provider:
            raise NotFoundException(f"Provider with ID {data.provider_user_id} not found")
        
        # Check if salon exists
        salon = self.db.query(Salon).filter(Salon.id == data.salon_id).first()
        if not salon:
            raise NotFoundException(f"Salon with ID {data.salon_id} not found")
        
        # Check if relationship already exists
        existing = self.db.query(ProviderSalon).filter(
            and_(
                ProviderSalon.provider_user_id == data.provider_user_id,
                ProviderSalon.salon_id == data.salon_id
            )
        ).first()
        if existing:
            raise ConflictException(
                f"Ownership relationship already exists between provider {data.provider_user_id} "
                f"and salon {data.salon_id}"
            )
        
        # Create ownership
        ownership = ProviderSalon(
            provider_user_id=data.provider_user_id,
            salon_id=data.salon_id,
            ownership_type=data.ownership_type,
            ownership_percentage=data.ownership_percentage,
            joined_date=data.joined_date,
            is_active=data.is_active,
            permissions=data.permissions
        )
        
        self.db.add(ownership)
        self.db.commit()
        self.db.refresh(ownership)
        
        return ProviderSalonResponse.model_validate(ownership)

    def get_salon_ownerships(
        self,
        filters: SalonOwnershipFilterParams,
        page: int = 1,
        size: int = 20
    ) -> ProviderSalonListResponse:
        """Get salon ownership relationships with filtering and pagination."""
        query = self.db.query(ProviderSalon)
        
        # Apply filters
        if filters.provider_user_id:
            query = query.filter(ProviderSalon.provider_user_id == filters.provider_user_id)
        
        if filters.salon_id:
            query = query.filter(ProviderSalon.salon_id == filters.salon_id)
        
        if filters.ownership_type:
            query = query.filter(ProviderSalon.ownership_type == filters.ownership_type)
        
        if filters.is_active is not None:
            query = query.filter(ProviderSalon.is_active == filters.is_active)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * size
        items = query.order_by(desc(ProviderSalon.joined_date))\
                     .offset(offset)\
                     .limit(size)\
                     .all()
        
        pages = (total + size - 1) // size
        
        return ProviderSalonListResponse(
            items=[ProviderSalonResponse.model_validate(item) for item in items],
            total=total,
            page=page,
            size=size,
            pages=pages
        )

    def get_salon_ownership(
        self,
        provider_user_id: UUID,
        salon_id: UUID
    ) -> ProviderSalonResponse:
        """Get specific salon ownership relationship."""
        ownership = self.db.query(ProviderSalon).filter(
            and_(
                ProviderSalon.provider_user_id == provider_user_id,
                ProviderSalon.salon_id == salon_id
            )
        ).first()
        
        if not ownership:
            raise NotFoundException(
                f"Ownership relationship not found between provider {provider_user_id} "
                f"and salon {salon_id}"
            )
        
        return ProviderSalonResponse.model_validate(ownership)

    def update_salon_ownership(
        self,
        provider_user_id: UUID,
        salon_id: UUID,
        data: ProviderSalonUpdate
    ) -> ProviderSalonResponse:
        """Update salon ownership relationship."""
        ownership = self.db.query(ProviderSalon).filter(
            and_(
                ProviderSalon.provider_user_id == provider_user_id,
                ProviderSalon.salon_id == salon_id
            )
        ).first()
        
        if not ownership:
            raise NotFoundException(
                f"Ownership relationship not found between provider {provider_user_id} "
                f"and salon {salon_id}"
            )
        
        # Update fields
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(ownership, field, value)
        
        self.db.commit()
        self.db.refresh(ownership)
        
        return ProviderSalonResponse.model_validate(ownership)

    def delete_salon_ownership(
        self,
        provider_user_id: UUID,
        salon_id: UUID
    ) -> None:
        """Delete salon ownership relationship."""
        ownership = self.db.query(ProviderSalon).filter(
            and_(
                ProviderSalon.provider_user_id == provider_user_id,
                ProviderSalon.salon_id == salon_id
            )
        ).first()
        
        if not ownership:
            raise NotFoundException(
                f"Ownership relationship not found between provider {provider_user_id} "
                f"and salon {salon_id}"
            )
        
        self.db.delete(ownership)
        self.db.commit()

    def transfer_salon_ownership(
        self,
        provider_user_id: UUID,
        salon_id: UUID,
        transfer_request: TransferOwnershipRequest
    ) -> Tuple[ProviderSalonResponse, ProviderSalonResponse]:
        """Transfer salon ownership from one provider to another."""
        # Get existing ownership
        existing_ownership = self.db.query(ProviderSalon).filter(
            and_(
                ProviderSalon.provider_user_id == provider_user_id,
                ProviderSalon.salon_id == salon_id
            )
        ).first()
        
        if not existing_ownership:
            raise NotFoundException(
                f"Ownership relationship not found between provider {provider_user_id} "
                f"and salon {salon_id}"
            )
        
        # Check if new owner exists
        new_owner = self.db.query(ProviderUser).filter(
            ProviderUser.id == transfer_request.new_owner_id
        ).first()
        if not new_owner:
            raise NotFoundException(f"New owner with ID {transfer_request.new_owner_id} not found")
        
        # Validate transfer percentage
        if transfer_request.ownership_percentage > existing_ownership.ownership_percentage:
            raise ValidationException(
                f"Cannot transfer {transfer_request.ownership_percentage}% when only "
                f"{existing_ownership.ownership_percentage}% is owned"
            )
        
        # Update existing ownership
        existing_ownership.ownership_percentage -= transfer_request.ownership_percentage
        if existing_ownership.ownership_percentage == 0:
            existing_ownership.is_active = False
            existing_ownership.left_date = transfer_request.transfer_date
        
        # Create or update new ownership
        new_ownership = self.db.query(ProviderSalon).filter(
            and_(
                ProviderSalon.provider_user_id == transfer_request.new_owner_id,
                ProviderSalon.salon_id == salon_id
            )
        ).first()
        
        if new_ownership:
            new_ownership.ownership_percentage += transfer_request.ownership_percentage
        else:
            new_ownership = ProviderSalon(
                provider_user_id=transfer_request.new_owner_id,
                salon_id=salon_id,
                ownership_type='owner',
                ownership_percentage=transfer_request.ownership_percentage,
                joined_date=transfer_request.transfer_date,
                is_active=True,
                permissions={}
            )
            self.db.add(new_ownership)
        
        self.db.commit()
        self.db.refresh(existing_ownership)
        self.db.refresh(new_ownership)
        
        return (
            ProviderSalonResponse.model_validate(existing_ownership),
            ProviderSalonResponse.model_validate(new_ownership)
        )

    # ===== STATISTICS =====

    def get_business_statistics(self) -> BusinessStatistics:
        """Get business details statistics."""
        # Total details
        total_details = self.db.query(func.count(ProviderBusinessDetail.id)).scalar()
        
        # By approval status
        status_counts = self.db.query(
            ProviderBusinessDetail.approval_status,
            func.count(ProviderBusinessDetail.id)
        ).group_by(ProviderBusinessDetail.approval_status).all()
        
        by_status = {status: count for status, count in status_counts}
        
        # Featured providers
        featured = self.db.query(func.count(ProviderBusinessDetail.id)).filter(
            ProviderBusinessDetail.is_featured == True
        ).scalar()
        
        # Average rating
        avg_rating = self.db.query(func.avg(ProviderBusinessDetail.rating)).scalar()
        
        # Average experience
        avg_experience = self.db.query(func.avg(ProviderBusinessDetail.years_experience)).scalar()
        
        # Total revenue
        total_revenue = self.db.query(func.sum(ProviderBusinessDetail.revenue_generated)).scalar()
        
        # Top specializations (simplified - just count occurrences)
        # This would need more complex querying for JSONB array elements
        top_specializations = []
        
        return BusinessStatistics(
            total_details=total_details or 0,
            pending_approval=by_status.get('pending', 0),
            approved=by_status.get('approved', 0),
            rejected=by_status.get('rejected', 0),
            featured_providers=featured or 0,
            avg_rating=Decimal(str(avg_rating)) if avg_rating else None,
            avg_years_experience=Decimal(str(avg_experience)) if avg_experience else None,
            total_revenue=Decimal(str(total_revenue)) if total_revenue else None,
            by_approval_status=by_status,
            top_specializations=top_specializations
        )

    def get_salon_ownership_statistics(self) -> SalonOwnershipStatistics:
        """Get salon ownership statistics."""
        # Total relationships
        total = self.db.query(func.count()).select_from(ProviderSalon).scalar()
        
        # Active relationships
        active = self.db.query(func.count()).select_from(ProviderSalon).filter(
            ProviderSalon.is_active == True
        ).scalar()
        
        # By ownership type
        type_counts = self.db.query(
            ProviderSalon.ownership_type,
            func.count()
        ).group_by(ProviderSalon.ownership_type).all()
        
        by_type = {ownership_type: count for ownership_type, count in type_counts}
        
        # Providers with multiple salons
        providers_multi = self.db.query(func.count(func.distinct(ProviderSalon.provider_user_id)))\
            .group_by(ProviderSalon.provider_user_id)\
            .having(func.count(ProviderSalon.salon_id) > 1)\
            .count()
        
        # Salons with multiple owners
        salons_multi = self.db.query(func.count(func.distinct(ProviderSalon.salon_id)))\
            .group_by(ProviderSalon.salon_id)\
            .having(func.count(ProviderSalon.provider_user_id) > 1)\
            .count()
        
        return SalonOwnershipStatistics(
            total_relationships=total or 0,
            active_relationships=active or 0,
            by_ownership_type=by_type,
            providers_with_multiple_salons=providers_multi or 0,
            salons_with_multiple_owners=salons_multi or 0
        )
