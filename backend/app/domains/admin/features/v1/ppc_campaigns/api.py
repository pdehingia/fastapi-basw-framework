"""PPC Campaigns API endpoints."""

from typing import Optional
from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from .dependencies import get_ppc_campaigns_service
from .schemas import (
    PPCCampaignCreate, PPCCampaignUpdate, PPCCampaignMetricsUpdate,
    PPCCampaignResponse, PPCCampaignListResponse, PPCCampaignFilters,
    PPCCampaignStatistics
)
from .service import PPCCampaignsService


router = APIRouter(prefix="/ppc-campaigns", tags=["PPC Campaigns"])


@router.post(
    "",
    response_model=PPCCampaignResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create PPC campaign",
    description="Create a new PPC (Pay-Per-Click) campaign for academy course marketing"
)
def create_ppc_campaign(
    data: PPCCampaignCreate,
    service: PPCCampaignsService = Depends(get_ppc_campaigns_service)
):
    """Create a new PPC campaign."""
    return service.create_campaign(data)


@router.get(
    "",
    response_model=PPCCampaignListResponse,
    summary="List PPC campaigns",
    description="Get paginated list of PPC campaigns with filtering options"
)
def list_ppc_campaigns(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    academy_id: Optional[UUID] = Query(None, description="Filter by academy ID"),
    course_id: Optional[UUID] = Query(None, description="Filter by course ID"),
    platform: Optional[str] = Query(None, description="Filter by platform"),
    campaign_type: Optional[str] = Query(None, description="Filter by campaign type"),
    campaign_status: Optional[str] = Query(None, description="Filter by status"),
    start_date_from: Optional[date] = Query(None, description="Filter campaigns starting from date"),
    start_date_to: Optional[date] = Query(None, description="Filter campaigns starting to date"),
    service: PPCCampaignsService = Depends(get_ppc_campaigns_service)
):
    """List PPC campaigns with filters."""
    filters = PPCCampaignFilters(
        academy_id=academy_id,
        course_id=course_id,
        platform=platform,
        campaign_type=campaign_type,
        campaign_status=campaign_status,
        start_date_from=start_date_from,
        start_date_to=start_date_to
    )
    return service.get_campaigns(filters, page, size)


@router.get(
    "/stats",
    response_model=PPCCampaignStatistics,
    summary="Get PPC campaign statistics",
    description="Get comprehensive PPC campaign performance statistics and ROI metrics"
)
def get_ppc_campaign_statistics(
    service: PPCCampaignsService = Depends(get_ppc_campaigns_service)
):
    """Get PPC campaign statistics."""
    return service.get_statistics()


@router.get(
    "/{campaign_id}",
    response_model=PPCCampaignResponse,
    summary="Get PPC campaign",
    description="Get specific PPC campaign by ID"
)
def get_ppc_campaign(
    campaign_id: UUID,
    service: PPCCampaignsService = Depends(get_ppc_campaigns_service)
):
    """Get PPC campaign by ID."""
    return service.get_campaign_by_id(campaign_id)


@router.put(
    "/{campaign_id}",
    response_model=PPCCampaignResponse,
    summary="Update PPC campaign",
    description="Update PPC campaign details (name, budget, targeting, etc.)"
)
def update_ppc_campaign(
    campaign_id: UUID,
    data: PPCCampaignUpdate,
    service: PPCCampaignsService = Depends(get_ppc_campaigns_service)
):
    """Update PPC campaign."""
    return service.update_campaign(campaign_id, data)


@router.patch(
    "/{campaign_id}/metrics",
    response_model=PPCCampaignResponse,
    summary="Update campaign metrics",
    description="Update PPC campaign performance metrics (impressions, clicks, conversions, cost)"
)
def update_campaign_metrics(
    campaign_id: UUID,
    data: PPCCampaignMetricsUpdate,
    service: PPCCampaignsService = Depends(get_ppc_campaigns_service)
):
    """Update campaign performance metrics."""
    return service.update_campaign_metrics(campaign_id, data)


@router.delete(
    "/{campaign_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete PPC campaign",
    description="Delete a PPC campaign (only non-active campaigns can be deleted)"
)
def delete_ppc_campaign(
    campaign_id: UUID,
    service: PPCCampaignsService = Depends(get_ppc_campaigns_service)
):
    """Delete PPC campaign."""
    service.delete_campaign(campaign_id)
