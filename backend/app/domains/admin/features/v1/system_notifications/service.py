"""System Notifications Service Layer."""
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.shared.models.system_notification import (
    SystemNotification,
    NotificationType,
    NotificationPriority,
    TargetAudience
)
from app.domains.admin.features.v1.system_notifications.schemas import (
    SystemNotificationCreate,
    SystemNotificationUpdate,
    SystemNotificationFilters,
    SystemNotificationPublishRequest
)


class SystemNotificationsService:
    """Service for managing system notifications."""

    def __init__(self, db: AsyncSession):
        """Initialize service."""
        self.db = db

    async def create_notification(
        self,
        data: SystemNotificationCreate,
        created_by: UUID
    ) -> SystemNotification:
        """Create new system notification."""
        notification = SystemNotification(
            **data.model_dump(),
            created_by=created_by
        )
        self.db.add(notification)
        await self.db.commit()
        await self.db.refresh(notification)
        return notification

    async def get_notifications(
        self,
        filters: Optional[SystemNotificationFilters] = None,
        skip: int = 0,
        limit: int = 100
    ) -> tuple[List[SystemNotification], int]:
        """Get paginated list of system notifications."""
        query = select(SystemNotification)
        
        # Apply filters
        if filters:
            conditions = []
            if filters.notification_type:
                conditions.append(SystemNotification.notification_type == filters.notification_type)
            if filters.priority:
                conditions.append(SystemNotification.priority == filters.priority)
            if filters.target_audience:
                conditions.append(SystemNotification.target_audience == filters.target_audience)
            if filters.is_published is not None:
                conditions.append(SystemNotification.is_published == filters.is_published)
            if filters.search:
                search_pattern = f"%{filters.search}%"
                conditions.append(
                    or_(
                        SystemNotification.title.ilike(search_pattern),
                        SystemNotification.message.ilike(search_pattern)
                    )
                )
            
            if conditions:
                query = query.where(and_(*conditions))
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = await self.db.scalar(count_query)
        
        # Apply pagination and ordering
        query = query.order_by(
            SystemNotification.priority.desc(),
            SystemNotification.created_at.desc()
        ).offset(skip).limit(limit)
        result = await self.db.execute(query)
        notifications = result.scalars().all()
        
        return list(notifications), total or 0

    async def get_notification_by_id(self, notification_id: UUID) -> Optional[SystemNotification]:
        """Get system notification by ID."""
        query = select(SystemNotification).where(SystemNotification.id == notification_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def update_notification(
        self,
        notification_id: UUID,
        data: SystemNotificationUpdate,
        updated_by: UUID
    ) -> Optional[SystemNotification]:
        """Update system notification."""
        notification = await self.get_notification_by_id(notification_id)
        if not notification:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(notification, field, value)
        
        notification.updated_by = updated_by
        notification.updated_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(notification)
        return notification

    async def delete_notification(self, notification_id: UUID) -> bool:
        """Delete system notification."""
        notification = await self.get_notification_by_id(notification_id)
        if not notification:
            return False
        
        await self.db.delete(notification)
        await self.db.commit()
        return True

    async def publish_notification(
        self,
        notification_id: UUID,
        publish_data: SystemNotificationPublishRequest,
        updated_by: UUID
    ) -> Optional[SystemNotification]:
        """Publish or unpublish system notification."""
        notification = await self.get_notification_by_id(notification_id)
        if not notification:
            return None
        
        notification.is_published = publish_data.is_published
        notification.updated_by = updated_by
        notification.updated_at = datetime.utcnow()
        
        await self.db.commit()
        await self.db.refresh(notification)
        return notification

    async def get_active_notifications(
        self,
        target_audience: TargetAudience = TargetAudience.ALL
    ) -> List[SystemNotification]:
        """Get currently active notifications for a target audience."""
        now = datetime.utcnow()
        
        query = select(SystemNotification).where(
            and_(
                SystemNotification.is_published == True,
                or_(
                    SystemNotification.target_audience == target_audience,
                    SystemNotification.target_audience == TargetAudience.ALL
                ),
                or_(
                    SystemNotification.starts_at == None,
                    SystemNotification.starts_at <= now
                ),
                or_(
                    SystemNotification.ends_at == None,
                    SystemNotification.ends_at >= now
                )
            )
        ).order_by(
            SystemNotification.priority.desc(),
            SystemNotification.created_at.desc()
        )
        
        result = await self.db.execute(query)
        return list(result.scalars().all())
