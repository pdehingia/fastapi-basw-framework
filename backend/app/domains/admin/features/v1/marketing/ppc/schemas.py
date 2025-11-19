"""PPC campaigns schemas."""

from datetime import datetime, date
from typing import Optional, List
from uuid import UUID
from decimal import Decimal
from pydantic import BaseModel, Field


# ===== PPC CAMPAIGN SCHEMAS =====

class PPCCampaignBase(BaseModel):
    """Base schema for PPC campaign."""
    academy_id: UUID
    course_id: Optional[UUID] = None
    campaign_name: str = Field(..., max_length=255)
    platform: str = Field(..., max_length=50, description="google, facebook, instagram, etc.")
    campaign_type: str = Field(..., max_length=50, description="search, display, video, etc.")
    budget_type: str = Field(..., max_length=20, description="daily or monthly")
    budget_amount: Decimal = Field(..., gt=0)
    target_keywords: Optional[dict] = None
    target_demographics: Optional[dict] = None
    target_locations: Optional[dict] = None
    campaign_status: str = Field(default="draft", max_length=30)
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class PPCCampaignCreate(PPCCampaignBase):
    """Schema for creating a PPC campaign."""
    pass


class PPCCampaignUpdate(BaseModel):
    """Schema for updating a PPC campaign."""
    campaign_name: Optional[str] = Field(None, max_length=255)
    platform: Optional[str] = Field(None, max_length=50)
    campaign_type: Optional[str] = Field(None, max_length=50)
    budget_type: Optional[str] = Field(None, max_length=20)
    budget_amount: Optional[Decimal] = Field(None, gt=0)
    target_keywords: Optional[dict] = None
    target_demographics: Optional[dict] = None
    target_locations: Optional[dict] = None
    campaign_status: Optional[str] = Field(None, max_length=30)
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class PPCCampaignMetricsUpdate(BaseModel):
    """Schema for updating PPC campaign metrics."""
    impressions: Optional[int] = Field(None, ge=0)
    clicks: Optional[int] = Field(None, ge=0)
    conversions: Optional[int] = Field(None, ge=0)
    cost: Optional[Decimal] = Field(None, ge=0)


class PPCCampaignResponse(PPCCampaignBase):
    """PPC campaign response schema."""
    id: UUID
    impressions: int
    clicks: int
    conversions: int
    cost: Decimal
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PPCCampaignListResponse(BaseModel):
    """Paginated PPC campaign list response."""
    items: List[PPCCampaignResponse]
    total: int
    page: int
    size: int
    pages: int


class PPCCampaignFilters(BaseModel):
    """Filter parameters for PPC campaigns."""
    academy_id: Optional[UUID] = None
    course_id: Optional[UUID] = None
    platform: Optional[str] = None
    campaign_type: Optional[str] = None
    campaign_status: Optional[str] = None
    start_date_from: Optional[date] = None
    start_date_to: Optional[date] = None


class PPCCampaignStatistics(BaseModel):
    """PPC campaign statistics."""
    total_campaigns: int
    active_campaigns: int
    total_budget: Decimal
    total_spent: Decimal
    total_impressions: int
    total_clicks: int
    total_conversions: int
    avg_ctr: float  # Click-through rate
    avg_cpc: float  # Cost per click
    avg_cpa: float  # Cost per acquisition
    by_platform: dict
    by_status: dict
    roi_summary: dict
