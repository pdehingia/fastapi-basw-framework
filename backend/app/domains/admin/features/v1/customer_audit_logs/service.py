"""Customer audit logs service."""

from datetime import datetime, timedelta
from typing import List, Optional
from uuid import UUID
from sqlalchemy import func, and_, desc
from sqlalchemy.orm import Session

from app.shared.models.user import CustomerAuditLog, CustomerUser
from app.core.exceptions import NotFoundException
from .schemas import (
    CustomerAuditLogResponse, CustomerAuditLogListResponse,
    CustomerAuditLogFilters, AuditLogStatistics
)


class CustomerAuditLogsService:
    """Service for managing customer audit logs."""
    
    def __init__(self, db: Session):
        self.db = db

    def get_audit_logs(
        self,
        filters: CustomerAuditLogFilters,
        page: int = 1,
        size: int = 20
    ) -> CustomerAuditLogListResponse:
        """Get customer audit logs with filtering and pagination."""
        query = self.db.query(CustomerAuditLog)
        
        # Apply filters
        if filters.customer_user_id:
            query = query.filter(CustomerAuditLog.customer_user_id == filters.customer_user_id)
        
        if filters.action:
            query = query.filter(CustomerAuditLog.action.ilike(f"%{filters.action}%"))
        
        if filters.entity:
            query = query.filter(CustomerAuditLog.entity == filters.entity)
        
        if filters.entity_id:
            query = query.filter(CustomerAuditLog.entity_id == filters.entity_id)
        
        if filters.created_from:
            query = query.filter(CustomerAuditLog.created_at >= filters.created_from)
        
        if filters.created_to:
            query = query.filter(CustomerAuditLog.created_at <= filters.created_to)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * size
        items = query.order_by(desc(CustomerAuditLog.created_at))\
                     .offset(offset)\
                     .limit(size)\
                     .all()
        
        pages = (total + size - 1) // size
        
        return CustomerAuditLogListResponse(
            items=[CustomerAuditLogResponse.model_validate(item) for item in items],
            total=total,
            page=page,
            size=size,
            pages=pages
        )

    def get_audit_log_by_id(self, log_id: int) -> CustomerAuditLogResponse:
        """Get customer audit log by ID."""
        log = self.db.query(CustomerAuditLog).filter(
            CustomerAuditLog.id == log_id
        ).first()
        
        if not log:
            raise NotFoundException(f"Audit log with ID {log_id} not found")
        
        return CustomerAuditLogResponse.model_validate(log)

    def get_statistics(self) -> AuditLogStatistics:
        """Get customer audit log statistics."""
        # Total logs
        total_logs = self.db.query(func.count(CustomerAuditLog.id)).scalar()
        
        # By action
        by_action_data = self.db.query(
            CustomerAuditLog.action,
            func.count(CustomerAuditLog.id)
        ).group_by(CustomerAuditLog.action)\
         .order_by(desc(func.count(CustomerAuditLog.id)))\
         .limit(10).all()
        by_action = {action: count for action, count in by_action_data}
        
        # By entity
        by_entity_data = self.db.query(
            CustomerAuditLog.entity,
            func.count(CustomerAuditLog.id)
        ).filter(CustomerAuditLog.entity.isnot(None))\
         .group_by(CustomerAuditLog.entity)\
         .order_by(desc(func.count(CustomerAuditLog.id)))\
         .limit(10).all()
        by_entity = {entity: count for entity, count in by_entity_data}
        
        # By user (top 10 most active)
        by_user_data = self.db.query(
            CustomerAuditLog.customer_user_id,
            CustomerUser.phone,
            func.count(CustomerAuditLog.id)
        ).join(
            CustomerUser, CustomerAuditLog.customer_user_id == CustomerUser.id
        ).group_by(
            CustomerAuditLog.customer_user_id,
            CustomerUser.phone
        ).order_by(
            desc(func.count(CustomerAuditLog.id))
        ).limit(10).all()
        by_user = {
            str(user_id): {"phone": phone, "count": count}
            for user_id, phone, count in by_user_data
        }
        
        # Logs per day (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        logs_per_day_data = self.db.query(
            func.date(CustomerAuditLog.created_at).label('date'),
            func.count(CustomerAuditLog.id).label('count')
        ).filter(
            CustomerAuditLog.created_at >= thirty_days_ago
        ).group_by(
            func.date(CustomerAuditLog.created_at)
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
