"""PPC campaigns service."""

from datetime import datetime
from typing import Optional
from uuid import UUID
from decimal import Decimal
from sqlalchemy import func, and_, desc
from sqlalchemy.orm import Session

from app.shared.models.ppc_campaign import PPCCampaign
from app.core.exceptions import NotFoundException, ValidationException
from .schemas import (
    PPCCampaignCreate, PPCCampaignUpdate, PPCCampaignMetricsUpdate,
    PPCCampaignResponse, PPCCampaignListResponse, PPCCampaignFilters,
    PPCCampaignStatistics
)


class PPCCampaignsService:
    """Service for managing PPC campaigns."""
    
    def __init__(self, db: Session):
        self.db = db

    def create_campaign(self, data: PPCCampaignCreate) -> PPCCampaignResponse:
        """Create a new PPC campaign."""
        campaign = PPCCampaign(**data.model_dump())
        self.db.add(campaign)
        self.db.commit()
        self.db.refresh(campaign)
        return PPCCampaignResponse.model_validate(campaign)

    def get_campaigns(
        self,
        filters: PPCCampaignFilters,
        page: int = 1,
        size: int = 20
    ) -> PPCCampaignListResponse:
        """Get PPC campaigns with filtering and pagination."""
        query = self.db.query(PPCCampaign)
        
        # Apply filters
        if filters.academy_id:
            query = query.filter(PPCCampaign.academy_id == filters.academy_id)
        
        if filters.course_id:
            query = query.filter(PPCCampaign.course_id == filters.course_id)
        
        if filters.platform:
            query = query.filter(PPCCampaign.platform == filters.platform)
        
        if filters.campaign_type:
            query = query.filter(PPCCampaign.campaign_type == filters.campaign_type)
        
        if filters.campaign_status:
            query = query.filter(PPCCampaign.campaign_status == filters.campaign_status)
        
        if filters.start_date_from:
            query = query.filter(PPCCampaign.start_date >= filters.start_date_from)
        
        if filters.start_date_to:
            query = query.filter(PPCCampaign.start_date <= filters.start_date_to)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * size
        items = query.order_by(desc(PPCCampaign.created_at))\
                     .offset(offset)\
                     .limit(size)\
                     .all()
        
        pages = (total + size - 1) // size
        
        return PPCCampaignListResponse(
            items=[PPCCampaignResponse.model_validate(item) for item in items],
            total=total,
            page=page,
            size=size,
            pages=pages
        )

    def get_campaign_by_id(self, campaign_id: UUID) -> PPCCampaignResponse:
        """Get PPC campaign by ID."""
        campaign = self.db.query(PPCCampaign).filter(
            PPCCampaign.id == campaign_id
        ).first()
        
        if not campaign:
            raise NotFoundException(f"PPC campaign with ID {campaign_id} not found")
        
        return PPCCampaignResponse.model_validate(campaign)

    def update_campaign(
        self,
        campaign_id: UUID,
        data: PPCCampaignUpdate
    ) -> PPCCampaignResponse:
        """Update a PPC campaign."""
        campaign = self.db.query(PPCCampaign).filter(
            PPCCampaign.id == campaign_id
        ).first()
        
        if not campaign:
            raise NotFoundException(f"PPC campaign with ID {campaign_id} not found")
        
        # Update fields
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(campaign, field, value)
        
        campaign.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(campaign)
        
        return PPCCampaignResponse.model_validate(campaign)

    def update_campaign_metrics(
        self,
        campaign_id: UUID,
        data: PPCCampaignMetricsUpdate
    ) -> PPCCampaignResponse:
        """Update PPC campaign performance metrics."""
        campaign = self.db.query(PPCCampaign).filter(
            PPCCampaign.id == campaign_id
        ).first()
        
        if not campaign:
            raise NotFoundException(f"PPC campaign with ID {campaign_id} not found")
        
        # Update metrics
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(campaign, field, value)
        
        campaign.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(campaign)
        
        return PPCCampaignResponse.model_validate(campaign)

    def delete_campaign(self, campaign_id: UUID) -> None:
        """Delete a PPC campaign."""
        campaign = self.db.query(PPCCampaign).filter(
            PPCCampaign.id == campaign_id
        ).first()
        
        if not campaign:
            raise NotFoundException(f"PPC campaign with ID {campaign_id} not found")
        
        # Check if campaign is active
        if campaign.campaign_status == 'active':
            raise ValidationException(
                "Cannot delete an active campaign. Please pause it first."
            )
        
        self.db.delete(campaign)
        self.db.commit()

    def get_statistics(self) -> PPCCampaignStatistics:
        """Get PPC campaign statistics."""
        # Total campaigns
        total_campaigns = self.db.query(func.count(PPCCampaign.id)).scalar()
        
        # Active campaigns
        active_campaigns = self.db.query(func.count(PPCCampaign.id)).filter(
            PPCCampaign.campaign_status == 'active'
        ).scalar()
        
        # Total budget (sum of budget_amount for active campaigns)
        total_budget = self.db.query(func.sum(PPCCampaign.budget_amount)).filter(
            PPCCampaign.campaign_status == 'active'
        ).scalar() or Decimal('0.00')
        
        # Total spent
        total_spent = self.db.query(func.sum(PPCCampaign.cost)).scalar() or Decimal('0.00')
        
        # Total metrics
        metrics = self.db.query(
            func.sum(PPCCampaign.impressions).label('impressions'),
            func.sum(PPCCampaign.clicks).label('clicks'),
            func.sum(PPCCampaign.conversions).label('conversions')
        ).first()
        
        total_impressions = metrics.impressions or 0
        total_clicks = metrics.clicks or 0
        total_conversions = metrics.conversions or 0
        
        # Calculate averages
        avg_ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0.0
        avg_cpc = (float(total_spent) / total_clicks) if total_clicks > 0 else 0.0
        avg_cpa = (float(total_spent) / total_conversions) if total_conversions > 0 else 0.0
        
        # By platform
        by_platform_data = self.db.query(
            PPCCampaign.platform,
            func.count(PPCCampaign.id),
            func.sum(PPCCampaign.cost)
        ).group_by(PPCCampaign.platform).all()
        by_platform = {
            platform: {"count": count, "spent": float(spent or 0)}
            for platform, count, spent in by_platform_data
        }
        
        # By status
        by_status_data = self.db.query(
            PPCCampaign.campaign_status,
            func.count(PPCCampaign.id)
        ).group_by(PPCCampaign.campaign_status).all()
        by_status = {status: count for status, count in by_status_data}
        
        # ROI summary
        roi_summary = {
            "total_budget": float(total_budget),
            "total_spent": float(total_spent),
            "remaining_budget": float(total_budget - total_spent),
            "budget_utilization": (float(total_spent) / float(total_budget) * 100) if total_budget > 0 else 0.0
        }
        
        return PPCCampaignStatistics(
            total_campaigns=total_campaigns or 0,
            active_campaigns=active_campaigns or 0,
            total_budget=total_budget,
            total_spent=total_spent,
            total_impressions=total_impressions,
            total_clicks=total_clicks,
            total_conversions=total_conversions,
            avg_ctr=round(avg_ctr, 2),
            avg_cpc=round(avg_cpc, 2),
            avg_cpa=round(avg_cpa, 2),
            by_platform=by_platform,
            by_status=by_status,
            roi_summary=roi_summary
        )
