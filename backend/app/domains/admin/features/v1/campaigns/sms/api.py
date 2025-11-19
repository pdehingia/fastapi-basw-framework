"""SMS Campaigns API endpoints."""
from typing import Annotated, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from math import ceil

from app.domains.admin.features.v1.sms_campaigns.dependencies import (
    get_sms_campaigns_service,
    RequireAuth
)
from app.domains.admin.features.v1.sms_campaigns.service import SMSCampaignsService
from app.domains.admin.features.v1.sms_campaigns.schemas import (
    SMSCampaignCreate,
    SMSCampaignUpdate,
    SMSCampaignResponse,
    SMSCampaignListResponse,
    SMSCampaignFilters,
    SMSCampaignStatistics,
    SendSMSCampaignRequest
)

router = APIRouter(prefix="/sms-campaigns", tags=["SMS Campaigns"])


@router.post(
    "",
    response_model=SMSCampaignResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create SMS campaign"
)
async def create_sms_campaign(
    data: SMSCampaignCreate,
    current_admin: RequireAuth,
    service: Annotated[SMSCampaignsService, Depends(get_sms_campaigns_service)]
) -> SMSCampaignResponse:
    """Create a new SMS marketing campaign."""
    campaign = await service.create_campaign(data, current_admin["user_id"])
    return SMSCampaignResponse.model_validate(campaign)


@router.get(
    "",
    response_model=SMSCampaignListResponse,
    summary="List SMS campaigns"
)
async def list_sms_campaigns(
    current_admin: RequireAuth,
    service: Annotated[SMSCampaignsService, Depends(get_sms_campaigns_service)],
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(50, ge=1, le=100, description="Page size"),
    campaign_type: Optional[str] = Query(None, description="Filter by campaign type"),
    campaign_status: Optional[str] = Query(None, description="Filter by status"),
    target_audience: Optional[str] = Query(None, description="Filter by target audience"),
    created_by: Optional[UUID] = Query(None, description="Filter by creator")
) -> SMSCampaignListResponse:
    """Get paginated list of SMS campaigns with filters."""
    filters = SMSCampaignFilters(
        campaign_type=campaign_type,
        campaign_status=campaign_status,
        target_audience=target_audience,
        created_by=created_by
    )
    
    skip = (page - 1) * size
    campaigns, total = await service.get_campaigns(filters, skip, size)
    
    return SMSCampaignListResponse(
        items=[SMSCampaignResponse.model_validate(c) for c in campaigns],
        total=total,
        page=page,
        size=size,
        pages=ceil(total / size) if total > 0 else 0
    )


@router.get(
    "/statistics",
    response_model=SMSCampaignStatistics,
    summary="Get SMS campaign statistics"
)
async def get_sms_campaign_statistics(
    current_admin: RequireAuth,
    service: Annotated[SMSCampaignsService, Depends(get_sms_campaigns_service)]
) -> SMSCampaignStatistics:
    """Get comprehensive SMS campaign statistics and metrics."""
    return await service.get_statistics()


@router.get(
    "/{campaign_id}",
    response_model=SMSCampaignResponse,
    summary="Get SMS campaign"
)
async def get_sms_campaign(
    campaign_id: UUID,
    current_admin: RequireAuth,
    service: Annotated[SMSCampaignsService, Depends(get_sms_campaigns_service)]
) -> SMSCampaignResponse:
    """Get SMS campaign by ID."""
    campaign = await service.get_campaign_by_id(campaign_id)
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SMS campaign not found"
        )
    return SMSCampaignResponse.model_validate(campaign)


@router.put(
    "/{campaign_id}",
    response_model=SMSCampaignResponse,
    summary="Update SMS campaign"
)
async def update_sms_campaign(
    campaign_id: UUID,
    data: SMSCampaignUpdate,
    current_admin: RequireAuth,
    service: Annotated[SMSCampaignsService, Depends(get_sms_campaigns_service)]
) -> SMSCampaignResponse:
    """Update SMS campaign details."""
    campaign = await service.update_campaign(campaign_id, data)
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SMS campaign not found"
        )
    return SMSCampaignResponse.model_validate(campaign)


@router.delete(
    "/{campaign_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete SMS campaign"
)
async def delete_sms_campaign(
    campaign_id: UUID,
    current_admin: RequireAuth,
    service: Annotated[SMSCampaignsService, Depends(get_sms_campaigns_service)]
) -> None:
    """Delete SMS campaign (only draft campaigns)."""
    success = await service.delete_campaign(campaign_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete campaign - either not found or not in draft status"
        )


@router.post(
    "/{campaign_id}/send",
    response_model=SMSCampaignResponse,
    summary="Send SMS campaign"
)
async def send_sms_campaign(
    campaign_id: UUID,
    data: SendSMSCampaignRequest,
    current_admin: RequireAuth,
    service: Annotated[SMSCampaignsService, Depends(get_sms_campaigns_service)]
) -> SMSCampaignResponse:
    """Send SMS campaign immediately or as test."""
    campaign = await service.send_campaign(campaign_id)
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SMS campaign not found"
        )
    return SMSCampaignResponse.model_validate(campaign)
