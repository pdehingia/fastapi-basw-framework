"""Email Campaigns Service Layer."""
from datetime import datetime
from typing import Optional
from uuid import UUID
from sqlalchemy import select, func, and_, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.shared.models.email_campaign import EmailCampaign
from app.domains.admin.features.v1.email_campaigns.schemas import (
    EmailCampaignCreate,
    EmailCampaignUpdate,
    EmailCampaignFilters,
    EmailCampaignStatistics
)


class EmailCampaignsService:
    """Service for managing email campaigns."""

    def __init__(self, db: AsyncSession):
        """Initialize service."""
        self.db = db

    async def create_campaign(
        self,
        data: EmailCampaignCreate,
        created_by: UUID
    ) -> EmailCampaign:
        """Create new email campaign."""
        campaign = EmailCampaign(
            **data.model_dump(),
            created_by=created_by,
            campaign_status="draft"
        )
        self.db.add(campaign)
        await self.db.commit()
        await self.db.refresh(campaign)
        return campaign

    async def get_campaigns(
        self,
        filters: Optional[EmailCampaignFilters] = None,
        skip: int = 0,
        limit: int = 100
    ) -> tuple[list[EmailCampaign], int]:
        """Get paginated list of email campaigns."""
        query = select(EmailCampaign)
        
        # Apply filters
        if filters:
            conditions = []
            if filters.campaign_type:
                conditions.append(EmailCampaign.campaign_type == filters.campaign_type)
            if filters.campaign_status:
                conditions.append(EmailCampaign.campaign_status == filters.campaign_status)
            if filters.target_audience:
                conditions.append(EmailCampaign.target_audience == filters.target_audience)
            if filters.created_by:
                conditions.append(EmailCampaign.created_by == filters.created_by)
            if filters.scheduled_from:
                conditions.append(EmailCampaign.scheduled_at >= filters.scheduled_from)
            if filters.scheduled_to:
                conditions.append(EmailCampaign.scheduled_at <= filters.scheduled_to)
            
            if conditions:
                query = query.where(and_(*conditions))
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = await self.db.scalar(count_query)
        
        # Apply pagination and ordering
        query = query.order_by(EmailCampaign.created_at.desc()).offset(skip).limit(limit)
        result = await self.db.execute(query)
        campaigns = result.scalars().all()
        
        return list(campaigns), total or 0

    async def get_campaign_by_id(self, campaign_id: UUID) -> Optional[EmailCampaign]:
        """Get email campaign by ID."""
        query = select(EmailCampaign).where(EmailCampaign.id == campaign_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def update_campaign(
        self,
        campaign_id: UUID,
        data: EmailCampaignUpdate
    ) -> Optional[EmailCampaign]:
        """Update email campaign."""
        campaign = await self.get_campaign_by_id(campaign_id)
        if not campaign:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(campaign, field, value)
        
        campaign.updated_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(campaign)
        return campaign

    async def delete_campaign(self, campaign_id: UUID) -> bool:
        """Delete email campaign."""
        campaign = await self.get_campaign_by_id(campaign_id)
        if not campaign:
            return False
        
        # Only allow deletion of draft campaigns
        if campaign.campaign_status != "draft":
            return False
        
        await self.db.delete(campaign)
        await self.db.commit()
        return True

    async def send_campaign(self, campaign_id: UUID) -> Optional[EmailCampaign]:
        """Send email campaign immediately."""
        campaign = await self.get_campaign_by_id(campaign_id)
        if not campaign:
            return None
        
        # Update campaign status to sending
        campaign.campaign_status = "sending"
        campaign.sent_at = datetime.utcnow()
        
        # TODO: Integrate with actual email service
        # For now, just mark as sent
        campaign.campaign_status = "sent"
        
        await self.db.commit()
        await self.db.refresh(campaign)
        return campaign

    async def schedule_campaign(
        self,
        campaign_id: UUID,
        scheduled_at: datetime
    ) -> Optional[EmailCampaign]:
        """Schedule email campaign."""
        campaign = await self.get_campaign_by_id(campaign_id)
        if not campaign:
            return None
        
        campaign.campaign_status = "scheduled"
        campaign.scheduled_at = scheduled_at
        
        await self.db.commit()
        await self.db.refresh(campaign)
        return campaign

    async def get_statistics(self) -> EmailCampaignStatistics:
        """Get email campaign statistics."""
        # Count campaigns by status
        status_query = select(
            func.count(EmailCampaign.id).label("total"),
            func.count(case((EmailCampaign.campaign_status == "draft", 1))).label("draft"),
            func.count(case((EmailCampaign.campaign_status == "scheduled", 1))).label("scheduled"),
            func.count(case((EmailCampaign.campaign_status == "sent", 1))).label("sent"),
            func.sum(EmailCampaign.total_recipients).label("total_recipients"),
            func.sum(EmailCampaign.total_sent).label("total_sent"),
            func.sum(EmailCampaign.total_delivered).label("total_delivered"),
            func.sum(EmailCampaign.total_opened).label("total_opened"),
            func.sum(EmailCampaign.total_clicked).label("total_clicked"),
            func.sum(EmailCampaign.total_unsubscribed).label("total_unsubscribed")
        )
        
        result = await self.db.execute(status_query)
        stats = result.one()
        
        # Calculate rates
        total_delivered = stats.total_delivered or 0
        average_open_rate = (stats.total_opened / total_delivered * 100) if total_delivered > 0 else 0
        average_click_rate = (stats.total_clicked / total_delivered * 100) if total_delivered > 0 else 0
        
        return EmailCampaignStatistics(
            total_campaigns=stats.total or 0,
            draft_campaigns=stats.draft or 0,
            scheduled_campaigns=stats.scheduled or 0,
            sent_campaigns=stats.sent or 0,
            total_recipients=stats.total_recipients or 0,
            total_sent=stats.total_sent or 0,
            total_delivered=stats.total_delivered or 0,
            total_opened=stats.total_opened or 0,
            total_clicked=stats.total_clicked or 0,
            total_unsubscribed=stats.total_unsubscribed or 0,
            average_open_rate=round(average_open_rate, 2),
            average_click_rate=round(average_click_rate, 2)
        )
