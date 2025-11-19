"""Admission inquiries service."""

from datetime import datetime, timedelta, date
from typing import Optional
from uuid import UUID
from sqlalchemy import func, and_, desc
from sqlalchemy.orm import Session

from app.shared.models.admission_inquiry import AdmissionInquiry
from app.core.exceptions import NotFoundException
from .schemas import (
    AdmissionInquiryCreate, AdmissionInquiryUpdate,
    AdmissionInquiryResponse, AdmissionInquiryListResponse,
    AdmissionInquiryFilters, AdmissionInquiryStatistics,
    AssignInquiryRequest
)


class AdmissionInquiriesService:
    """Service for managing admission inquiries."""
    
    def __init__(self, db: Session):
        self.db = db

    def create_inquiry(self, data: AdmissionInquiryCreate) -> AdmissionInquiryResponse:
        """Create a new admission inquiry."""
        inquiry = AdmissionInquiry(**data.model_dump())
        self.db.add(inquiry)
        self.db.commit()
        self.db.refresh(inquiry)
        return AdmissionInquiryResponse.model_validate(inquiry)

    def get_inquiries(
        self,
        filters: AdmissionInquiryFilters,
        page: int = 1,
        size: int = 20
    ) -> AdmissionInquiryListResponse:
        """Get admission inquiries with filtering and pagination."""
        query = self.db.query(AdmissionInquiry)
        
        # Apply filters
        if filters.academy_id:
            query = query.filter(AdmissionInquiry.academy_id == filters.academy_id)
        
        if filters.course_id:
            query = query.filter(AdmissionInquiry.course_id == filters.course_id)
        
        if filters.inquiry_status:
            query = query.filter(AdmissionInquiry.inquiry_status == filters.inquiry_status)
        
        if filters.inquiry_source:
            query = query.filter(AdmissionInquiry.inquiry_source == filters.inquiry_source)
        
        if filters.assigned_to:
            query = query.filter(AdmissionInquiry.assigned_to == filters.assigned_to)
        
        if filters.follow_up_from:
            query = query.filter(AdmissionInquiry.follow_up_date >= filters.follow_up_from)
        
        if filters.follow_up_to:
            query = query.filter(AdmissionInquiry.follow_up_date <= filters.follow_up_to)
        
        if filters.min_conversion_probability:
            query = query.filter(AdmissionInquiry.conversion_probability >= filters.min_conversion_probability)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * size
        items = query.order_by(desc(AdmissionInquiry.created_at))\
                     .offset(offset)\
                     .limit(size)\
                     .all()
        
        pages = (total + size - 1) // size
        
        return AdmissionInquiryListResponse(
            items=[AdmissionInquiryResponse.model_validate(item) for item in items],
            total=total,
            page=page,
            size=size,
            pages=pages
        )

    def get_inquiry_by_id(self, inquiry_id: UUID) -> AdmissionInquiryResponse:
        """Get admission inquiry by ID."""
        inquiry = self.db.query(AdmissionInquiry).filter(
            AdmissionInquiry.id == inquiry_id
        ).first()
        
        if not inquiry:
            raise NotFoundException(f"Admission inquiry with ID {inquiry_id} not found")
        
        return AdmissionInquiryResponse.model_validate(inquiry)

    def update_inquiry(
        self,
        inquiry_id: UUID,
        data: AdmissionInquiryUpdate
    ) -> AdmissionInquiryResponse:
        """Update an admission inquiry."""
        inquiry = self.db.query(AdmissionInquiry).filter(
            AdmissionInquiry.id == inquiry_id
        ).first()
        
        if not inquiry:
            raise NotFoundException(f"Admission inquiry with ID {inquiry_id} not found")
        
        # Update fields
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(inquiry, field, value)
        
        inquiry.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(inquiry)
        
        return AdmissionInquiryResponse.model_validate(inquiry)

    def delete_inquiry(self, inquiry_id: UUID) -> None:
        """Delete an admission inquiry."""
        inquiry = self.db.query(AdmissionInquiry).filter(
            AdmissionInquiry.id == inquiry_id
        ).first()
        
        if not inquiry:
            raise NotFoundException(f"Admission inquiry with ID {inquiry_id} not found")
        
        self.db.delete(inquiry)
        self.db.commit()

    def assign_inquiry(
        self,
        inquiry_id: UUID,
        data: AssignInquiryRequest
    ) -> AdmissionInquiryResponse:
        """Assign inquiry to admin user."""
        inquiry = self.db.query(AdmissionInquiry).filter(
            AdmissionInquiry.id == inquiry_id
        ).first()
        
        if not inquiry:
            raise NotFoundException(f"Admission inquiry with ID {inquiry_id} not found")
        
        inquiry.assigned_to = data.assigned_to
        if data.notes:
            inquiry.notes = f"{inquiry.notes}\n{data.notes}" if inquiry.notes else data.notes
        inquiry.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(inquiry)
        
        return AdmissionInquiryResponse.model_validate(inquiry)

    def get_pending_follow_ups(self) -> List[AdmissionInquiryResponse]:
        """Get inquiries with pending follow-ups (today or past due)."""
        today = date.today()
        inquiries = self.db.query(AdmissionInquiry).filter(
            and_(
                AdmissionInquiry.follow_up_date.isnot(None),
                AdmissionInquiry.follow_up_date <= today,
                AdmissionInquiry.inquiry_status.notin_(['enrolled', 'lost'])
            )
        ).order_by(AdmissionInquiry.follow_up_date).all()
        
        return [AdmissionInquiryResponse.model_validate(i) for i in inquiries]

    def bulk_update_status(
        self,
        inquiry_ids: List[UUID],
        new_status: str
    ) -> dict:
        """Bulk update status for multiple inquiries."""
        updated_count = self.db.query(AdmissionInquiry).filter(
            AdmissionInquiry.id.in_(inquiry_ids)
        ).update(
            {
                AdmissionInquiry.inquiry_status: new_status,
                AdmissionInquiry.updated_at: datetime.utcnow()
            },
            synchronize_session=False
        )
        
        self.db.commit()
        
        return {
            "message": f"Updated {updated_count} inquiries to status '{new_status}'",
            "updated_count": updated_count
        }

    def get_statistics(self) -> AdmissionInquiryStatistics:
        """Get admission inquiry statistics."""
        # Total inquiries
        total_inquiries = self.db.query(func.count(AdmissionInquiry.id)).scalar()
        
        # By status
        by_status_data = self.db.query(
            AdmissionInquiry.inquiry_status,
            func.count(AdmissionInquiry.id)
        ).group_by(AdmissionInquiry.inquiry_status).all()
        by_status = {status: count for status, count in by_status_data}
        
        # By source
        by_source_data = self.db.query(
            AdmissionInquiry.inquiry_source,
            func.count(AdmissionInquiry.id)
        ).filter(AdmissionInquiry.inquiry_source.isnot(None))\
         .group_by(AdmissionInquiry.inquiry_source).all()
        by_source = {source: count for source, count in by_source_data}
        
        # By academy (top 10)
        by_academy_data = self.db.query(
            AdmissionInquiry.academy_id,
            func.count(AdmissionInquiry.id)
        ).filter(AdmissionInquiry.academy_id.isnot(None))\
         .group_by(AdmissionInquiry.academy_id)\
         .order_by(desc(func.count(AdmissionInquiry.id)))\
         .limit(10).all()
        by_academy = {str(academy_id): count for academy_id, count in by_academy_data}
        
        # Conversion rate
        enrolled_count = self.db.query(func.count(AdmissionInquiry.id)).filter(
            AdmissionInquiry.inquiry_status == 'enrolled'
        ).scalar() or 0
        conversion_rate = (enrolled_count / total_inquiries * 100) if total_inquiries > 0 else 0.0
        
        # Average conversion probability
        avg_probability = self.db.query(
            func.avg(AdmissionInquiry.conversion_probability)
        ).filter(AdmissionInquiry.conversion_probability.isnot(None)).scalar() or 0.0
        
        # Follow-ups pending
        today = date.today()
        follow_ups_pending = self.db.query(func.count(AdmissionInquiry.id)).filter(
            and_(
                AdmissionInquiry.follow_up_date.isnot(None),
                AdmissionInquiry.follow_up_date <= today,
                AdmissionInquiry.inquiry_status.notin_(['enrolled', 'lost'])
            )
        ).scalar() or 0
        
        # Inquiries per day (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        inquiries_per_day_data = self.db.query(
            func.date(AdmissionInquiry.created_at).label('date'),
            func.count(AdmissionInquiry.id).label('count')
        ).filter(
            AdmissionInquiry.created_at >= thirty_days_ago
        ).group_by(
            func.date(AdmissionInquiry.created_at)
        ).order_by('date').all()
        
        inquiries_per_day = [
            {"date": str(date), "count": count}
            for date, count in inquiries_per_day_data
        ]
        
        return AdmissionInquiryStatistics(
            total_inquiries=total_inquiries or 0,
            by_status=by_status,
            by_source=by_source,
            by_academy=by_academy,
            conversion_rate=round(conversion_rate, 2),
            avg_conversion_probability=round(float(avg_probability), 2),
            follow_ups_pending=follow_ups_pending,
            inquiries_per_day=inquiries_per_day
        )
