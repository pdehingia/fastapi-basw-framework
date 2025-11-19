"""
Service layer for Salon Provider Management
"""

from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import func, desc, and_, or_, case
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.shared.models.business import SalonProvider
from app.shared.models.user import ProviderUser
from app.shared.models.business import Salon
from app.core.exceptions import NotFoundException, ConflictException, ValidationException

from .schemas import (
    SalonProviderCreate,
    SalonProviderUpdate,
    SalonProviderFilters,
    SalonProviderStatistics,
    SalonProviderMetrics,
    SalonProviderStatusUpdate,
)


class SalonProviderService:
    """Service for salon provider relationship management"""

    @staticmethod
    def add_provider_to_salon(
        db: Session,
        salon_provider_data: SalonProviderCreate
    ) -> SalonProvider:
        """
        Add a provider to a salon
        
        Args:
            db: Database session
            salon_provider_data: Salon provider relationship data
            
        Returns:
            Created salon provider relationship
            
        Raises:
            ConflictException: If relationship already exists
            NotFoundException: If salon or provider not found
        """
        # Check if salon exists
        salon = db.query(Salon).filter(Salon.id == salon_provider_data.salon_id).first()
        if not salon:
            raise NotFoundException(f"Salon with ID {salon_provider_data.salon_id} not found")
        
        # Check if provider exists
        provider = db.query(ProviderUser).filter(
            ProviderUser.id == salon_provider_data.provider_user_id
        ).first()
        if not provider:
            raise NotFoundException(f"Provider with ID {salon_provider_data.provider_user_id} not found")
        
        # Check for existing active relationship
        existing = db.query(SalonProvider).filter(
            SalonProvider.salon_id == salon_provider_data.salon_id,
            SalonProvider.provider_user_id == salon_provider_data.provider_user_id,
            SalonProvider.is_active == True
        ).first()
        
        if existing:
            raise ConflictException(
                f"Provider is already actively associated with this salon"
            )
        
        salon_provider = SalonProvider(**salon_provider_data.model_dump())
        db.add(salon_provider)
        db.commit()
        db.refresh(salon_provider)
        return salon_provider

    @staticmethod
    def get_salon_provider(db: Session, salon_provider_id: UUID) -> SalonProvider:
        """
        Get salon provider relationship by ID
        
        Args:
            db: Database session
            salon_provider_id: Salon provider ID
            
        Returns:
            SalonProvider object
            
        Raises:
            NotFoundException: If not found
        """
        salon_provider = db.query(SalonProvider).filter(
            SalonProvider.id == salon_provider_id
        ).first()
        if not salon_provider:
            raise NotFoundException(f"Salon provider relationship with ID {salon_provider_id} not found")
        return salon_provider

    @staticmethod
    def get_salon_providers(
        db: Session,
        filters: Optional[SalonProviderFilters] = None,
        page: int = 1,
        page_size: int = 20,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> tuple[List[Dict[str, Any]], int]:
        """
        Get paginated list of salon providers with filters
        
        Args:
            db: Database session
            filters: Salon provider filters
            page: Page number
            page_size: Items per page
            sort_by: Sort field
            sort_order: Sort order (asc/desc)
            
        Returns:
            Tuple of (salon providers list with details, total count)
        """
        query = db.query(
            SalonProvider,
            Salon.salon_name,
            ProviderUser.full_name,
            ProviderUser.email,
            ProviderUser.phone
        ).join(
            Salon, SalonProvider.salon_id == Salon.id
        ).join(
            ProviderUser, SalonProvider.provider_user_id == ProviderUser.id
        )
        
        # Apply filters
        if filters:
            if filters.salon_id:
                query = query.filter(SalonProvider.salon_id == filters.salon_id)
            
            if filters.provider_user_id:
                query = query.filter(SalonProvider.provider_user_id == filters.provider_user_id)
            
            if filters.employment_type:
                query = query.filter(SalonProvider.employment_type == filters.employment_type)
            
            if filters.is_active is not None:
                query = query.filter(SalonProvider.is_active == filters.is_active)
            
            if filters.joined_after:
                query = query.filter(SalonProvider.joined_date >= filters.joined_after)
            
            if filters.joined_before:
                query = query.filter(SalonProvider.joined_date <= filters.joined_before)
            
            if filters.search:
                search_term = f"%{filters.search}%"
                query = query.filter(
                    or_(
                        ProviderUser.full_name.ilike(search_term),
                        ProviderUser.email.ilike(search_term)
                    )
                )
        
        # Get total count
        total = query.count()
        
        # Apply sorting
        if hasattr(SalonProvider, sort_by):
            sort_column = getattr(SalonProvider, sort_by)
        else:
            sort_column = SalonProvider.created_at
        
        if sort_order.lower() == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(sort_column)
        
        # Apply pagination
        offset = (page - 1) * page_size
        results = query.offset(offset).limit(page_size).all()
        
        # Format response with additional details
        salon_providers_with_details = []
        for sp, salon_name, provider_name, provider_email, provider_phone in results:
            sp_dict = {
                "id": sp.id,
                "salon_id": sp.salon_id,
                "provider_user_id": sp.provider_user_id,
                "employment_type": sp.employment_type,
                "joined_date": sp.joined_date,
                "left_date": sp.left_date,
                "is_active": sp.is_active,
                "total_bookings": sp.total_bookings,
                "total_revenue": sp.total_revenue,
                "created_at": sp.created_at,
                "updated_at": sp.updated_at,
                "salon_name": salon_name,
                "provider_name": provider_name,
                "provider_email": provider_email,
                "provider_phone": provider_phone
            }
            salon_providers_with_details.append(sp_dict)
        
        return salon_providers_with_details, total

    @staticmethod
    def update_salon_provider(
        db: Session,
        salon_provider_id: UUID,
        update_data: SalonProviderUpdate
    ) -> SalonProvider:
        """
        Update salon provider relationship details
        
        Args:
            db: Database session
            salon_provider_id: Salon provider ID
            update_data: Update data
            
        Returns:
            Updated salon provider
            
        Raises:
            NotFoundException: If not found
        """
        salon_provider = SalonProviderService.get_salon_provider(db, salon_provider_id)
        
        for field, value in update_data.model_dump(exclude_unset=True).items():
            setattr(salon_provider, field, value)
        
        db.commit()
        db.refresh(salon_provider)
        return salon_provider

    @staticmethod
    def remove_provider_from_salon(
        db: Session,
        salon_provider_id: UUID
    ) -> None:
        """
        Remove a provider from a salon (hard delete)
        
        Args:
            db: Database session
            salon_provider_id: Salon provider ID
            
        Raises:
            NotFoundException: If not found
            ValidationException: If provider has bookings
        """
        salon_provider = SalonProviderService.get_salon_provider(db, salon_provider_id)
        
        # Check if provider has bookings
        if salon_provider.total_bookings > 0:
            raise ValidationException(
                f"Cannot remove provider with {salon_provider.total_bookings} bookings. "
                "Set to inactive instead."
            )
        
        db.delete(salon_provider)
        db.commit()

    @staticmethod
    def update_provider_status(
        db: Session,
        salon_provider_id: UUID,
        status_data: SalonProviderStatusUpdate
    ) -> SalonProvider:
        """
        Update provider active status
        
        Args:
            db: Database session
            salon_provider_id: Salon provider ID
            status_data: Status update data
            
        Returns:
            Updated salon provider
            
        Raises:
            NotFoundException: If not found
        """
        salon_provider = SalonProviderService.get_salon_provider(db, salon_provider_id)
        
        salon_provider.is_active = status_data.is_active
        
        # Set left date if deactivating
        if not status_data.is_active and status_data.left_date:
            salon_provider.left_date = status_data.left_date
        elif status_data.is_active:
            # Clear left date if reactivating
            salon_provider.left_date = None
        
        db.commit()
        db.refresh(salon_provider)
        return salon_provider

    @staticmethod
    def get_provider_metrics(
        db: Session,
        salon_provider_id: UUID
    ) -> SalonProviderMetrics:
        """
        Get performance metrics for a salon-provider relationship
        
        Args:
            db: Database session
            salon_provider_id: Salon provider ID
            
        Returns:
            Provider performance metrics
            
        Raises:
            NotFoundException: If not found
        """
        salon_provider = SalonProviderService.get_salon_provider(db, salon_provider_id)
        
        # Calculate average booking value
        average_booking_value = Decimal("0.00")
        if salon_provider.total_bookings > 0:
            average_booking_value = salon_provider.total_revenue / salon_provider.total_bookings
        
        # Calculate days employed
        end_date = salon_provider.left_date if salon_provider.left_date else date.today()
        days_employed = (end_date - salon_provider.joined_date).days
        
        # Calculate revenue rank among salon's providers
        revenue_rank = db.query(func.count(SalonProvider.id)).filter(
            SalonProvider.salon_id == salon_provider.salon_id,
            SalonProvider.total_revenue > salon_provider.total_revenue
        ).scalar() + 1
        
        return SalonProviderMetrics(
            salon_provider_id=salon_provider.id,
            salon_id=salon_provider.salon_id,
            provider_user_id=salon_provider.provider_user_id,
            employment_type=salon_provider.employment_type,
            is_active=salon_provider.is_active,
            total_bookings=salon_provider.total_bookings,
            total_revenue=salon_provider.total_revenue,
            average_booking_value=average_booking_value,
            days_employed=days_employed,
            revenue_rank=revenue_rank
        )

    @staticmethod
    def get_salon_provider_statistics(db: Session) -> SalonProviderStatistics:
        """
        Get comprehensive salon provider statistics
        
        Args:
            db: Database session
            
        Returns:
            Salon provider statistics
        """
        # Overall counts
        total_associations = db.query(SalonProvider).count()
        active_associations = db.query(SalonProvider).filter(
            SalonProvider.is_active == True
        ).count()
        inactive_associations = total_associations - active_associations
        
        # By employment type
        employment_type_stats = db.query(
            SalonProvider.employment_type,
            func.count(SalonProvider.id)
        ).group_by(SalonProvider.employment_type).all()
        
        by_employment_type = {emp_type: count for emp_type, count in employment_type_stats}
        
        # Aggregate metrics
        aggregates = db.query(
            func.sum(SalonProvider.total_bookings).label("total_bookings"),
            func.sum(SalonProvider.total_revenue).label("total_revenue")
        ).first()
        
        total_bookings = aggregates.total_bookings or 0
        total_revenue = Decimal(str(aggregates.total_revenue)) if aggregates.total_revenue else Decimal("0.00")
        
        # Average revenue per provider
        average_revenue_per_provider = Decimal("0.00")
        if total_associations > 0:
            average_revenue_per_provider = total_revenue / total_associations
        
        return SalonProviderStatistics(
            total_associations=total_associations,
            active_associations=active_associations,
            inactive_associations=inactive_associations,
            by_employment_type=by_employment_type,
            total_bookings=total_bookings,
            total_revenue=total_revenue,
            average_revenue_per_provider=average_revenue_per_provider
        )
