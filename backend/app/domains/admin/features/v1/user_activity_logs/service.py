"""User activity logs service."""

from datetime import datetime, timedelta
from typing import List, Optional
from uuid import UUID
from sqlalchemy import func, and_, desc
from sqlalchemy.orm import Session

from app.shared.models.activity_log import UserActivityLog
from app.core.exceptions import NotFoundException
from .schemas import (
    UserActivityLogResponse, UserActivityLogListResponse,
    UserActivityLogFilters, ActivityLogStatistics
)


class UserActivityLogsService:
    """Service for managing user activity logs."""
    
    def __init__(self, db: Session):
        self.db = db

    def get_activity_logs(
        self,
        filters: UserActivityLogFilters,
        page: int = 1,
        size: int = 20
    ) -> UserActivityLogListResponse:
        """Get user activity logs with filtering and pagination."""
        query = self.db.query(UserActivityLog)
        
        # Apply filters
        if filters.user_id:
            query = query.filter(UserActivityLog.user_id == filters.user_id)
        
        if filters.user_type:
            query = query.filter(UserActivityLog.user_type == filters.user_type)
        
        if filters.activity_type:
            query = query.filter(UserActivityLog.activity_type.ilike(f"%{filters.activity_type}%"))
        
        if filters.activity_category:
            query = query.filter(UserActivityLog.activity_category == filters.activity_category)
        
        if filters.created_from:
            query = query.filter(UserActivityLog.created_at >= filters.created_from)
        
        if filters.created_to:
            query = query.filter(UserActivityLog.created_at <= filters.created_to)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * size
        items = query.order_by(desc(UserActivityLog.created_at))\
                     .offset(offset)\
                     .limit(size)\
                     .all()
        
        pages = (total + size - 1) // size
        
        return UserActivityLogListResponse(
            items=[UserActivityLogResponse.model_validate(item) for item in items],
            total=total,
            page=page,
            size=size,
            pages=pages
        )

    def get_activity_log_by_id(self, log_id: int) -> UserActivityLogResponse:
        """Get user activity log by ID."""
        log = self.db.query(UserActivityLog).filter(
            UserActivityLog.id == log_id
        ).first()
        
        if not log:
            raise NotFoundException(f"Activity log with ID {log_id} not found")
        
        return UserActivityLogResponse.model_validate(log)

    def delete_old_logs(self, days: int = 90) -> dict:
        """Delete activity logs older than specified days."""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        deleted_count = self.db.query(UserActivityLog).filter(
            UserActivityLog.created_at < cutoff_date
        ).delete(synchronize_session=False)
        
        self.db.commit()
        
        return {
            "message": f"Deleted activity logs older than {days} days",
            "deleted_count": deleted_count,
            "cutoff_date": cutoff_date.isoformat()
        }

    def get_statistics(self) -> ActivityLogStatistics:
        """Get user activity log statistics."""
        # Total logs
        total_logs = self.db.query(func.count(UserActivityLog.id)).scalar()
        
        # By user type
        by_user_type_data = self.db.query(
            UserActivityLog.user_type,
            func.count(UserActivityLog.id)
        ).group_by(UserActivityLog.user_type)\
         .order_by(desc(func.count(UserActivityLog.id))).all()
        by_user_type = {user_type: count for user_type, count in by_user_type_data}
        
        # By activity type
        by_activity_type_data = self.db.query(
            UserActivityLog.activity_type,
            func.count(UserActivityLog.id)
        ).group_by(UserActivityLog.activity_type)\
         .order_by(desc(func.count(UserActivityLog.id)))\
         .limit(15).all()
        by_activity_type = {activity: count for activity, count in by_activity_type_data}
        
        # By activity category
        by_category_data = self.db.query(
            UserActivityLog.activity_category,
            func.count(UserActivityLog.id)
        ).filter(UserActivityLog.activity_category.isnot(None))\
         .group_by(UserActivityLog.activity_category)\
         .order_by(desc(func.count(UserActivityLog.id)))\
         .limit(10).all()
        by_activity_category = {category: count for category, count in by_category_data}
        
        # By user (top 10 most active)
        by_user_data = self.db.query(
            UserActivityLog.user_id,
            UserActivityLog.user_type,
            func.count(UserActivityLog.id)
        ).group_by(
            UserActivityLog.user_id,
            UserActivityLog.user_type
        ).order_by(
            desc(func.count(UserActivityLog.id))
        ).limit(10).all()
        by_user = {
            str(user_id): {"user_type": user_type, "count": count}
            for user_id, user_type, count in by_user_data
        }
        
        # Logs per day (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        logs_per_day_data = self.db.query(
            func.date(UserActivityLog.created_at).label('date'),
            func.count(UserActivityLog.id).label('count')
        ).filter(
            UserActivityLog.created_at >= thirty_days_ago
        ).group_by(
            func.date(UserActivityLog.created_at)
        ).order_by('date').all()
        
        logs_per_day = [
            {"date": str(date), "count": count}
            for date, count in logs_per_day_data
        ]
        
        # Unique users
        unique_users = self.db.query(
            func.count(func.distinct(UserActivityLog.user_id))
        ).scalar()
        
        # Unique sessions
        unique_sessions = self.db.query(
            func.count(func.distinct(UserActivityLog.session_id))
        ).filter(UserActivityLog.session_id.isnot(None)).scalar()
        
        return ActivityLogStatistics(
            total_logs=total_logs or 0,
            by_user_type=by_user_type,
            by_activity_type=by_activity_type,
            by_activity_category=by_activity_category,
            by_user=by_user,
            logs_per_day=logs_per_day,
            unique_users=unique_users or 0,
            unique_sessions=unique_sessions or 0
        )
