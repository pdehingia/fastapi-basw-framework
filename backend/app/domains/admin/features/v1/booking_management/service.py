"""Booking management service for admin operations."""

import csv
import io
from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Tuple, Dict, Any
from uuid import UUID

from sqlalchemy import func, and_, or_, desc, asc
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError

from app.shared.models.booking import Booking, Review
from app.shared.models.user import CustomerUser, ProviderUser
from .schemas import (
    BookingFilterParams,
    BookingResponse,
    BookingDetailResponse,
    BookingStatusUpdate,
    DisputeResolution,
    BookingStatistics,
    BookingTimeline,
    BookingTimelineEntry,
)
from app.shared.exceptions import ValidationException, NotFoundError
from app.shared.pagination import PaginationParams, PaginatedResponse


class BookingManagementService:
    """Service for admin booking management operations."""

    def __init__(self, db: Session):
        self.db = db

    async def get_bookings_list(
        self, 
        filters: BookingFilterParams,
        pagination: PaginationParams
    ) -> PaginatedResponse[BookingResponse]:
        """Get paginated list of bookings with filters."""
        try:
            # Base query
            query = self.db.query(Booking)

            # Apply filters
            query = self._apply_filters(query, filters)

            # Get total count before pagination
            total_count = query.count()

            # Apply pagination
            offset = (pagination.page - 1) * pagination.size
            bookings = query.order_by(desc(Booking.created_at)).offset(offset).limit(pagination.size).all()

            # Convert to response models
            booking_responses = []
            for booking in bookings:
                booking_responses.append(BookingResponse(
                    id=booking.id,
                    booking_number=booking.booking_number,
                    customer_user_id=booking.customer_user_id,
                    provider_user_id=booking.provider_user_id,
                    service_type=booking.service_type,
                    occasion_type=booking.occasion_type,
                    booking_date=booking.booking_date,
                    event_date=booking.event_date,
                    event_duration_hours=booking.event_duration_hours,
                    venue_name=booking.venue_name,
                    venue_address=booking.venue_address,
                    city=booking.city,
                    state=booking.state,
                    status=booking.status,
                    cancellation_reason=booking.cancellation_reason,
                    cancelled_by=booking.cancelled_by,
                    cancelled_at=booking.cancelled_at,
                    base_price=booking.base_price,
                    platform_fee=booking.platform_fee,
                    taxes=booking.taxes,
                    discount_amount=booking.discount_amount,
                    promo_code=booking.promo_code,
                    total_amount=booking.total_amount,
                    academy_commission=booking.academy_commission,
                    academy_commission_rate=booking.academy_commission_rate,
                    payment_status=booking.payment_status,
                    payment_method=booking.payment_method,
                    transaction_id=booking.transaction_id,
                    refund_amount=booking.refund_amount,
                    refund_reason=booking.refund_reason,
                    special_requests=booking.special_requests,
                    guest_count=booking.guest_count,
                    contact_phone=booking.contact_phone,
                    contact_email=booking.contact_email,
                    metadata=booking.metadata,
                    created_at=booking.created_at,
                    updated_at=booking.updated_at
                ))

            # Calculate pagination info
            total_pages = (total_count + pagination.size - 1) // pagination.size

            return PaginatedResponse(
                items=booking_responses,
                total=total_count,
                page=pagination.page,
                size=pagination.size,
                pages=total_pages
            )

        except SQLAlchemyError as e:
            raise ValidationException(f"Database error: {str(e)}")

    async def get_booking_detail(self, booking_id: int) -> BookingDetailResponse:
        """Get detailed booking information including related data."""
        try:
            booking = self.db.query(Booking).filter(Booking.id == booking_id).first()

            if not booking:
                raise NotFoundError(f"Booking with ID {booking_id} not found")

            # Get customer and provider details separately
            customer = self.db.query(CustomerUser).filter(CustomerUser.id == booking.customer_user_id).first()
            provider = self.db.query(ProviderUser).filter(ProviderUser.id == booking.provider_user_id).first()

            # Get customer and provider names
            customer_name = None
            customer_email = None
            if customer:
                customer_name = f"{customer.first_name} {customer.last_name}" if customer.first_name and customer.last_name else None
                customer_email = customer.email

            provider_name = None
            provider_business_name = None
            if provider:
                provider_name = f"{provider.first_name} {provider.last_name}" if provider.first_name and provider.last_name else None
                provider_business_name = getattr(provider, 'business_name', None)

            # Get review information
            review = self.db.query(Review).filter(Review.booking_id == booking_id).first()
            review_rating = review.rating if review else None
            review_text = review.review_text if review else None

            return BookingDetailResponse(
                id=booking.id,
                booking_number=booking.booking_number,
                customer_user_id=booking.customer_user_id,
                provider_user_id=booking.provider_user_id,
                service_type=booking.service_type,
                occasion_type=booking.occasion_type,
                booking_date=booking.booking_date,
                event_date=booking.event_date,
                event_duration_hours=booking.event_duration_hours,
                venue_name=booking.venue_name,
                venue_address=booking.venue_address,
                city=booking.city,
                state=booking.state,
                status=booking.status,
                cancellation_reason=booking.cancellation_reason,
                cancelled_by=booking.cancelled_by,
                cancelled_at=booking.cancelled_at,
                base_price=booking.base_price,
                platform_fee=booking.platform_fee,
                taxes=booking.taxes,
                discount_amount=booking.discount_amount,
                promo_code=booking.promo_code,
                total_amount=booking.total_amount,
                academy_commission=booking.academy_commission,
                academy_commission_rate=booking.academy_commission_rate,
                payment_status=booking.payment_status,
                payment_method=booking.payment_method,
                transaction_id=booking.transaction_id,
                refund_amount=booking.refund_amount,
                refund_reason=booking.refund_reason,
                special_requests=booking.special_requests,
                guest_count=booking.guest_count,
                contact_phone=booking.contact_phone,
                contact_email=booking.contact_email,
                metadata=booking.metadata,
                created_at=booking.created_at,
                updated_at=booking.updated_at,
                customer_name=customer_name,
                customer_email=customer_email,
                provider_name=provider_name,
                provider_business_name=provider_business_name,
                review_rating=review_rating,
                review_text=review_text
            )

        except SQLAlchemyError as e:
            raise ValidationException(f"Database error: {str(e)}")

    async def update_booking_status(
        self, 
        booking_id: int, 
        status_update: BookingStatusUpdate,
        admin_user_id: int
    ) -> Dict[str, Any]:
        """Update booking status with admin tracking."""
        try:
            booking = self.db.query(Booking).filter(Booking.id == booking_id).first()
            
            if not booking:
                raise NotFoundError(f"Booking with ID {booking_id} not found")

            old_status = booking.status
            
            # Update booking status
            booking.status = status_update.status
            booking.updated_at = datetime.utcnow()
            
            # Handle refund if applicable
            if status_update.refund_amount:
                booking.refund_amount = status_update.refund_amount
                booking.refund_reason = status_update.reason

            # Add admin notes to metadata
            if not booking.metadata:
                booking.metadata = {}
            
            booking.metadata['admin_notes'] = status_update.notes
            booking.metadata['status_changed_by'] = admin_user_id
            booking.metadata['status_change_reason'] = status_update.reason
            booking.metadata['status_changed_at'] = datetime.utcnow().isoformat()

            # Create timeline entry
            await self._add_timeline_entry(
                booking_id=booking_id,
                action="status_changed",
                description=f"Status changed from {old_status.value} to {status_update.status.value}",
                performed_by=f"Admin ID: {admin_user_id}",
                performed_by_type="admin",
                additional_data={
                    "old_status": old_status.value,
                    "new_status": status_update.status.value,
                    "reason": status_update.reason
                }
            )

            self.db.commit()

            return {
                "success": True,
                "message": "Booking status updated successfully",
                "booking_id": booking_id,
                "old_status": old_status.value,
                "new_status": status_update.status.value,
                "updated_at": booking.updated_at
            }

        except SQLAlchemyError as e:
            self.db.rollback()
            raise ValidationException(f"Database error: {str(e)}")

    async def resolve_dispute(
        self, 
        booking_id: int, 
        resolution: DisputeResolution,
        admin_user_id: int
    ) -> Dict[str, Any]:
        """Resolve booking dispute with refund processing."""
        try:
            booking = self.db.query(Booking).filter(Booking.id == booking_id).first()
            
            if not booking:
                raise NotFoundError(f"Booking with ID {booking_id} not found")

            # Calculate refund amount
            refund_amount = Decimal("0.00")
            if resolution.refund_percentage:
                refund_amount = (booking.total_amount * Decimal(str(resolution.refund_percentage))) / Decimal("100")
            elif resolution.refund_amount:
                refund_amount = resolution.refund_amount

            # Update booking
            booking.refund_amount = refund_amount
            booking.refund_reason = "Dispute resolution"
            booking.updated_at = datetime.utcnow()

            # Add dispute resolution to metadata
            if not booking.metadata:
                booking.metadata = {}
            
            booking.metadata['dispute_resolution'] = {
                "resolution": resolution.resolution,
                "refund_amount": str(refund_amount),
                "notes": resolution.notes,
                "resolved_by": admin_user_id,
                "resolved_at": datetime.utcnow().isoformat(),
                "notify_parties": resolution.notify_parties
            }

            # Create timeline entry
            await self._add_timeline_entry(
                booking_id=booking_id,
                action="dispute_resolved",
                description=f"Dispute resolved with {resolution.resolution}",
                performed_by=f"Admin ID: {admin_user_id}",
                performed_by_type="admin",
                additional_data={
                    "resolution": resolution.resolution,
                    "refund_amount": str(refund_amount),
                    "notes": resolution.notes
                }
            )

            self.db.commit()

            return {
                "success": True,
                "message": "Dispute resolved successfully",
                "booking_id": booking_id,
                "resolution": resolution.resolution,
                "refund_amount": refund_amount,
                "resolved_at": booking.updated_at
            }

        except SQLAlchemyError as e:
            self.db.rollback()
            raise ValidationException(f"Database error: {str(e)}")

    async def export_bookings(
        self, 
        filters: BookingFilterParams,
        export_format: str = "csv"
    ) -> io.StringIO:
        """Export bookings to CSV format."""
        try:
            # Get all bookings matching filters (no pagination)
            query = self.db.query(Booking)
            
            query = self._apply_filters(query, filters)
            bookings = query.order_by(desc(Booking.created_at)).all()

            # Create CSV
            output = io.StringIO()
            writer = csv.writer(output)

            # Write header
            header = [
                'Booking ID', 'Booking Number', 'Customer Name', 'Customer Email',
                'Provider Name', 'Provider Business', 'Service Type', 'Occasion Type',
                'Booking Date', 'Event Date', 'Event Duration (Hours)', 'City', 'State',
                'Status', 'Base Price', 'Platform Fee', 'Taxes', 'Discount', 'Total Amount',
                'Payment Status', 'Payment Method', 'Refund Amount', 'Created At'
            ]
            writer.writerow(header)

            # Write data rows
            for booking in bookings:
                # Get customer and provider details separately
                customer = self.db.query(CustomerUser).filter(CustomerUser.id == booking.customer_user_id).first()
                provider = self.db.query(ProviderUser).filter(ProviderUser.id == booking.provider_user_id).first()

                customer_name = ""
                customer_email = ""
                if customer:
                    customer_name = f"{customer.first_name} {customer.last_name}" if customer.first_name and customer.last_name else ""
                    customer_email = customer.email

                provider_name = ""
                provider_business = ""
                if provider:
                    provider_name = f"{provider.first_name} {provider.last_name}" if provider.first_name and provider.last_name else ""
                    provider_business = getattr(provider, 'business_name', '') or ""

                row = [
                    booking.id,
                    booking.booking_number,
                    customer_name,
                    customer_email,
                    provider_name,
                    provider_business,
                    booking.service_type,
                    booking.occasion_type,
                    booking.booking_date.strftime('%Y-%m-%d %H:%M:%S') if booking.booking_date else "",
                    booking.event_date.strftime('%Y-%m-%d %H:%M:%S') if booking.event_date else "",
                    booking.event_duration_hours or "",
                    booking.city,
                    booking.state,
                    booking.status.value if booking.status else "",
                    float(booking.base_price),
                    float(booking.platform_fee),
                    float(booking.taxes),
                    float(booking.discount_amount),
                    float(booking.total_amount),
                    booking.payment_status.value if booking.payment_status else "",
                    booking.payment_method or "",
                    float(booking.refund_amount),
                    booking.created_at.strftime('%Y-%m-%d %H:%M:%S')
                ]
                writer.writerow(row)

            output.seek(0)
            return output

        except SQLAlchemyError as e:
            raise ValidationException(f"Database error: {str(e)}")

    def _apply_filters(self, query, filters: BookingFilterParams):
        """Apply filters to booking query."""
        if filters.search:
            # For search, we need to search in customer and provider names
            # This requires subqueries since we don't have direct relationships
            search_term = f"%{filters.search}%"
            
            # Search in booking number
            query = query.filter(
                or_(
                    Booking.booking_number.ilike(search_term),
                    Booking.customer_user_id.in_(
                        self.db.query(CustomerUser.id).filter(
                            or_(
                                func.concat(CustomerUser.first_name, ' ', CustomerUser.last_name).ilike(search_term),
                                CustomerUser.email.ilike(search_term)
                            )
                        )
                    ),
                    Booking.provider_user_id.in_(
                        self.db.query(ProviderUser.id).filter(
                            or_(
                                func.concat(ProviderUser.first_name, ' ', ProviderUser.last_name).ilike(search_term),
                                ProviderUser.email.ilike(search_term)
                            )
                        )
                    )
                )
            )

        if filters.status:
            query = query.filter(Booking.status == filters.status)

        if filters.payment_status:
            query = query.filter(Booking.payment_status == filters.payment_status)

        if filters.occasion_type:
            query = query.filter(Booking.occasion_type == filters.occasion_type)

        if filters.service_type:
            query = query.filter(Booking.service_type == filters.service_type)

        if filters.city:
            query = query.filter(Booking.city.ilike(f"%{filters.city}%"))

        if filters.date_from:
            query = query.filter(Booking.booking_date >= filters.date_from)

        if filters.date_to:
            query = query.filter(Booking.booking_date <= filters.date_to)

        if filters.amount_min:
            query = query.filter(Booking.total_amount >= filters.amount_min)

        if filters.amount_max:
            query = query.filter(Booking.total_amount <= filters.amount_max)

        if filters.has_promo_code is not None:
            if filters.has_promo_code:
                query = query.filter(Booking.promo_code.isnot(None))
            else:
                query = query.filter(Booking.promo_code.is_(None))

        return query

    async def _add_timeline_entry(
        self,
        booking_id: int,
        action: str,
        description: str,
        performed_by: Optional[str] = None,
        performed_by_type: Optional[str] = None,
        additional_data: Optional[Dict[str, Any]] = None
    ):
        """Add entry to booking timeline (stored in metadata for now)."""
        # For now, we'll store timeline in booking metadata
        # In a production system, you might want a separate timeline table
        
        booking = self.db.query(Booking).filter(Booking.id == booking_id).first()
        if not booking:
            return

        if not booking.metadata:
            booking.metadata = {}

        if 'timeline' not in booking.metadata:
            booking.metadata['timeline'] = []

        timeline_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "action": action,
            "description": description,
            "performed_by": performed_by,
            "performed_by_type": performed_by_type,
            "additional_data": additional_data
        }

        booking.metadata['timeline'].append(timeline_entry)

    async def get_booking_statistics(self) -> BookingStatistics:
        """Get booking statistics for admin dashboard."""
        try:
            # Basic counts
            total_bookings = self.db.query(Booking).count()
            
            status_counts = self.db.query(
                Booking.status,
                func.count(Booking.id).label('count')
            ).group_by(Booking.status).all()

            # Convert to dict for easy access
            status_dict = {status.value: count for status, count in status_counts}

            # Revenue calculations
            revenue_data = self.db.query(
                func.sum(Booking.total_amount).label('total_revenue'),
                func.sum(Booking.platform_fee).label('platform_fees'),
                func.sum(Booking.refund_amount).label('refunds'),
                func.avg(Booking.total_amount).label('avg_booking_value')
            ).first()

            # Top cities
            top_cities = self.db.query(
                Booking.city,
                func.count(Booking.id).label('booking_count')
            ).group_by(Booking.city).order_by(desc('booking_count')).limit(10).all()

            # Top services
            top_services = self.db.query(
                Booking.service_type,
                func.count(Booking.id).label('booking_count')
            ).group_by(Booking.service_type).order_by(desc('booking_count')).limit(10).all()

            return BookingStatistics(
                total_bookings=total_bookings,
                pending_bookings=status_dict.get('pending', 0),
                confirmed_bookings=status_dict.get('confirmed', 0),
                completed_bookings=status_dict.get('completed', 0),
                cancelled_bookings=status_dict.get('cancelled', 0),
                disputed_bookings=status_dict.get('disputed', 0),
                total_revenue=revenue_data.total_revenue or Decimal("0"),
                platform_fees_collected=revenue_data.platform_fees or Decimal("0"),
                refunds_processed=revenue_data.refunds or Decimal("0"),
                average_booking_value=revenue_data.avg_booking_value or Decimal("0"),
                top_cities=[{"city": city, "count": count} for city, count in top_cities],
                top_services=[{"service": service, "count": count} for service, count in top_services],
                monthly_trends=[]  # TODO: Implement monthly trends calculation
            )

        except SQLAlchemyError as e:
            raise ValidationException(f"Database error: {str(e)}")