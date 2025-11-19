"""User segments service."""

from datetime import datetime
from typing import Optional
from uuid import UUID
from sqlalchemy import func, and_, desc
from sqlalchemy.orm import Session

from app.shared.models.user_segment import UserSegment
from app.core.exceptions import NotFoundException
from .schemas import (
    UserSegmentCreate, UserSegmentUpdate,
    UserSegmentResponse, UserSegmentListResponse,
    UserSegmentFilters, UserSegmentStatistics,
    SegmentSizeResponse
)


class UserSegmentsService:
    """Service for managing user segments."""
    
    def __init__(self, db: Session):
        self.db = db

    def create_segment(
        self,
        data: UserSegmentCreate,
        admin_user_id: UUID
    ) -> UserSegmentResponse:
        """Create a new user segment."""
        segment = UserSegment(
            **data.model_dump(),
            created_by=admin_user_id
        )
        self.db.add(segment)
        self.db.commit()
        self.db.refresh(segment)
        return UserSegmentResponse.model_validate(segment)

    def get_segments(
        self,
        filters: UserSegmentFilters,
        page: int = 1,
        size: int = 20
    ) -> UserSegmentListResponse:
        """Get user segments with filtering and pagination."""
        query = self.db.query(UserSegment)
        
        # Apply filters
        if filters.segment_type:
            query = query.filter(UserSegment.segment_type == filters.segment_type)
        
        if filters.user_type:
            query = query.filter(UserSegment.user_type == filters.user_type)
        
        if filters.is_active is not None:
            query = query.filter(UserSegment.is_active == filters.is_active)
        
        if filters.created_by:
            query = query.filter(UserSegment.created_by == filters.created_by)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * size
        items = query.order_by(desc(UserSegment.created_at))\
                     .offset(offset)\
                     .limit(size)\
                     .all()
        
        pages = (total + size - 1) // size
        
        return UserSegmentListResponse(
            items=[UserSegmentResponse.model_validate(item) for item in items],
            total=total,
            page=page,
            size=size,
            pages=pages
        )

    def get_segment_by_id(self, segment_id: UUID) -> UserSegmentResponse:
        """Get user segment by ID."""
        segment = self.db.query(UserSegment).filter(
            UserSegment.id == segment_id
        ).first()
        
        if not segment:
            raise NotFoundException(f"User segment with ID {segment_id} not found")
        
        return UserSegmentResponse.model_validate(segment)

    def update_segment(
        self,
        segment_id: UUID,
        data: UserSegmentUpdate
    ) -> UserSegmentResponse:
        """Update a user segment."""
        segment = self.db.query(UserSegment).filter(
            UserSegment.id == segment_id
        ).first()
        
        if not segment:
            raise NotFoundException(f"User segment with ID {segment_id} not found")
        
        # Update fields
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(segment, field, value)
        
        segment.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(segment)
        
        return UserSegmentResponse.model_validate(segment)

    def delete_segment(self, segment_id: UUID) -> None:
        """Delete a user segment."""
        segment = self.db.query(UserSegment).filter(
            UserSegment.id == segment_id
        ).first()
        
        if not segment:
            raise NotFoundException(f"User segment with ID {segment_id} not found")
        
        self.db.delete(segment)
        self.db.commit()

    def calculate_segment_size(self, segment_id: UUID) -> SegmentSizeResponse:
        """Calculate the size of a user segment based on its criteria.
        
        Note: This is a simplified implementation. In production, you would
        query the actual user tables based on the criteria in the segment.
        """
        segment = self.db.query(UserSegment).filter(
            UserSegment.id == segment_id
        ).first()
        
        if not segment:
            raise NotFoundException(f"User segment with ID {segment_id} not found")
        
        # TODO: Implement actual user counting logic based on criteria
        # This would involve querying admin_users, provider_users, or customer_users
        # based on the segment's user_type and criteria fields
        
        # For now, using a placeholder calculation
        # In production, parse segment.criteria and build dynamic query
        estimated_size = 0  # Replace with actual query count
        
        # Update segment with calculated size
        segment.estimated_size = estimated_size
        segment.last_calculated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(segment)
        
        return SegmentSizeResponse(
            segment_id=segment.id,
            estimated_size=estimated_size,
            last_calculated_at=segment.last_calculated_at
        )

    def duplicate_segment(self, segment_id: UUID, admin_user_id: UUID) -> UserSegmentResponse:
        """Duplicate an existing user segment."""
        original = self.db.query(UserSegment).filter(
            UserSegment.id == segment_id
        ).first()
        
        if not original:
            raise NotFoundException(f"User segment with ID {segment_id} not found")
        
        # Create duplicate
        duplicate = UserSegment(
            segment_name=f"{original.segment_name} (Copy)",
            segment_description=original.segment_description,
            segment_type=original.segment_type,
            user_type=original.user_type,
            criteria=original.criteria,
            is_active=False,  # Start as inactive
            created_by=admin_user_id
        )
        
        self.db.add(duplicate)
        self.db.commit()
        self.db.refresh(duplicate)
        
        return UserSegmentResponse.model_validate(duplicate)

    def get_statistics(self) -> UserSegmentStatistics:
        """Get user segment statistics."""
        # Total segments
        total_segments = self.db.query(func.count(UserSegment.id)).scalar()
        
        # Active segments
        active_segments = self.db.query(func.count(UserSegment.id)).filter(
            UserSegment.is_active == True
        ).scalar()
        
        # By segment type
        by_segment_type_data = self.db.query(
            UserSegment.segment_type,
            func.count(UserSegment.id)
        ).group_by(UserSegment.segment_type).all()
        by_segment_type = {seg_type: count for seg_type, count in by_segment_type_data}
        
        # By user type
        by_user_type_data = self.db.query(
            UserSegment.user_type,
            func.count(UserSegment.id)
        ).group_by(UserSegment.user_type).all()
        by_user_type = {user_type: count for user_type, count in by_user_type_data}
        
        # Total users in segments
        total_users = self.db.query(
            func.sum(UserSegment.estimated_size)
        ).scalar() or 0
        
        # Average segment size
        avg_size = self.db.query(
            func.avg(UserSegment.estimated_size)
        ).filter(UserSegment.estimated_size > 0).scalar() or 0.0
        
        # Largest segments (top 5)
        largest = self.db.query(UserSegment).filter(
            UserSegment.estimated_size > 0
        ).order_by(desc(UserSegment.estimated_size)).limit(5).all()
        
        largest_segments = [
            {
                "id": str(seg.id),
                "name": seg.segment_name,
                "size": seg.estimated_size,
                "user_type": seg.user_type
            }
            for seg in largest
        ]
        
        return UserSegmentStatistics(
            total_segments=total_segments or 0,
            active_segments=active_segments or 0,
            by_segment_type=by_segment_type,
            by_user_type=by_user_type,
            total_users_in_segments=total_users,
            avg_segment_size=round(float(avg_size), 2),
            largest_segments=largest_segments
        )
