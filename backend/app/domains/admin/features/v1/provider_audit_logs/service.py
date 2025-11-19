"""Provider audit logs service."""

from datetime import datetime, timedelta
from typing import List, Optional
from uuid import UUID
from sqlalchemy import func, and_, desc
from sqlalchemy.orm import Session

from app.shared.models.user import ProviderAuditLog, ProviderUser
from app.core.exceptions import NotFoundException
from .schemas import (
    ProviderAuditLogResponse, ProviderAuditLogListResponse,
    ProviderAuditLogFilters, AuditLogStatistics
)


class ProviderAuditLogsService:
    """Service for managing provider audit logs."""
    
    def __init__(self, db: Session):
        self.db = db

    def get_audit_logs(
        self,
        filters: ProviderAuditLogFilters,
        page: int = 1,
        size: int = 20
    ) -> ProviderAuditLogListResponse:
        """Get provider audit logs with filtering and pagination."""
        query = self.db.query(ProviderAuditLog)
        
        # Apply filters
        if filters.provider_user_id:
            query = query.filter(ProviderAuditLog.provider_user_id == filters.provider_user_id)
        
        if filters.action:
            query = query.filter(ProviderAuditLog.action.ilike(f"%{filters.action}%"))
        
        if filters.entity:
            query = query.filter(ProviderAuditLog.entity == filters.entity)
        
        if filters.entity_id:
            query = query.filter(ProviderAuditLog.entity_id == filters.entity_id)
        
        if filters.created_from:
            query = query.filter(ProviderAuditLog.created_at >= filters.created_from)
        
        if filters.created_to:
            query = query.filter(ProviderAuditLog.created_at <= filters.created_to)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * size
        items = query.order_by(desc(ProviderAuditLog.created_at))\
                     .offset(offset)\
                     .limit(size)\
                     .all()
        
        pages = (total + size - 1) // size
        
        return ProviderAuditLogListResponse(
            items=[ProviderAuditLogResponse.model_validate(item) for item in items],
            total=total,
            page=page,
            size=size,
            pages=pages
        )

    def get_audit_log_by_id(self, log_id: int) -> ProviderAuditLogResponse:
        """Get provider audit log by ID."""
        log = self.db.query(ProviderAuditLog).filter(
            ProviderAuditLog.id == log_id
        ).first()
        
        if not log:
            raise NotFoundException(f"Audit log with ID {log_id} not found")
        
        return ProviderAuditLogResponse.model_validate(log)

    def get_statistics(self) -> AuditLogStatistics:
        """Get provider audit log statistics."""
        # Total logs
        total_logs = self.db.query(func.count(ProviderAuditLog.id)).scalar()
        
        # By action
        by_action_data = self.db.query(
            ProviderAuditLog.action,
            func.count(ProviderAuditLog.id)
        ).group_by(ProviderAuditLog.action)\
         .order_by(desc(func.count(ProviderAuditLog.id)))\
         .limit(10).all()
        by_action = {action: count for action, count in by_action_data}
        
        # By entity
        by_entity_data = self.db.query(
            ProviderAuditLog.entity,
            func.count(ProviderAuditLog.id)
        ).filter(ProviderAuditLog.entity.isnot(None))\
         .group_by(ProviderAuditLog.entity)\
         .order_by(desc(func.count(ProviderAuditLog.id)))\
         .limit(10).all()
        by_entity = {entity: count for entity, count in by_entity_data}
        
        # By user (top 10 most active)
        by_user_data = self.db.query(
            ProviderAuditLog.provider_user_id,
            ProviderUser.email,
            func.count(ProviderAuditLog.id)
        ).join(
            ProviderUser, ProviderAuditLog.provider_user_id == ProviderUser.id
        ).group_by(
            ProviderAuditLog.provider_user_id,
            ProviderUser.email
        ).order_by(
            desc(func.count(ProviderAuditLog.id))
        ).limit(10).all()
        by_user = {
            str(user_id): {"email": email, "count": count}
            for user_id, email, count in by_user_data
        }
        
        # Logs per day (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        logs_per_day_data = self.db.query(
            func.date(ProviderAuditLog.created_at).label('date'),
            func.count(ProviderAuditLog.id).label('count')
        ).filter(
            ProviderAuditLog.created_at >= thirty_days_ago
        ).group_by(
            func.date(ProviderAuditLog.created_at)
        ).order_by('date').all()
        
        logs_per_day = [
            {"date": str(date), "count": count}
            for date, count in logs_per_day_data
        ]
        
        return AuditLogStatistics(
            total_logs=total_logs or 0,
            by_action=by_action,
            by_entity=by_entity,
            by_user=by_user,
            logs_per_day=logs_per_day
        )
