"""Email Campaigns API endpoints."""
from typing import Annotated, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from math import ceil

from app.domains.admin.features.v1.email_campaigns.dependencies import (
    get_email_campaigns_service,
    RequireAuth
)
from app.domains.admin.features.v1.email_campaigns.service import EmailCampaignsService
from app.domains.admin.features.v1.email_campaigns.schemas import (
    EmailCampaignCreate,
    EmailCampaignUpdate,
    EmailCampaignResponse,
    EmailCampaignListResponse,
    EmailCampaignFilters,
    EmailCampaignStatistics,
    SendCampaignRequest
)

router = APIRouter(prefix="/email-campaigns", tags=["Email Campaigns"])


@router.post(
    "",
    response_model=EmailCampaignResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create email campaign"
)
async def create_email_campaign(
    data: EmailCampaignCreate,
    current_admin: RequireAuth,
    service: Annotated[EmailCampaignsService, Depends(get_email_campaigns_service)]
) -> EmailCampaignResponse:
    """Create a new email marketing campaign."""
    campaign = await service.create_campaign(data, current_admin["user_id"])
    return EmailCampaignResponse.model_validate(campaign)


@router.get(
    "",
    response_model=EmailCampaignListResponse,
    summary="List email campaigns"
)
async def list_email_campaigns(
    current_admin: RequireAuth,
    service: Annotated[EmailCampaignsService, Depends(get_email_campaigns_service)],
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(50, ge=1, le=100, description="Page size"),
    campaign_type: Optional[str] = Query(None, description="Filter by campaign type"),
    campaign_status: Optional[str] = Query(None, description="Filter by status"),
    target_audience: Optional[str] = Query(None, description="Filter by target audience"),
    created_by: Optional[UUID] = Query(None, description="Filter by creator")
) -> EmailCampaignListResponse:
    """Get paginated list of email campaigns with filters."""
    filters = EmailCampaignFilters(
        campaign_type=campaign_type,
        campaign_status=campaign_status,
        target_audience=target_audience,
        created_by=created_by
    )
    
    skip = (page - 1) * size
    campaigns, total = await service.get_campaigns(filters, skip, size)
    
    return EmailCampaignListResponse(
        items=[EmailCampaignResponse.model_validate(c) for c in campaigns],
        total=total,
        page=page,
        size=size,
        pages=ceil(total / size) if total > 0 else 0
    )


@router.get(
    "/statistics",
    response_model=EmailCampaignStatistics,
    summary="Get email campaign statistics"
)
async def get_email_campaign_statistics(
    current_admin: RequireAuth,
    service: Annotated[EmailCampaignsService, Depends(get_email_campaigns_service)]
) -> EmailCampaignStatistics:
    """Get comprehensive email campaign statistics and metrics."""
    return await service.get_statistics()


@router.get(
    "/{campaign_id}",
    response_model=EmailCampaignResponse,
    summary="Get email campaign"
)
async def get_email_campaign(
    campaign_id: UUID,
    current_admin: RequireAuth,
    service: Annotated[EmailCampaignsService, Depends(get_email_campaigns_service)]
) -> EmailCampaignResponse:
    """Get email campaign by ID."""
    campaign = await service.get_campaign_by_id(campaign_id)
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email campaign not found"
        )
    return EmailCampaignResponse.model_validate(campaign)


@router.put(
    "/{campaign_id}",
    response_model=EmailCampaignResponse,
    summary="Update email campaign"
)
async def update_email_campaign(
    campaign_id: UUID,
    data: EmailCampaignUpdate,
    current_admin: RequireAuth,
    service: Annotated[EmailCampaignsService, Depends(get_email_campaigns_service)]
) -> EmailCampaignResponse:
    """Update email campaign details."""
    campaign = await service.update_campaign(campaign_id, data)
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email campaign not found"
        )
    return EmailCampaignResponse.model_validate(campaign)


@router.delete(
    "/{campaign_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete email campaign"
)
async def delete_email_campaign(
    campaign_id: UUID,
    current_admin: RequireAuth,
    service: Annotated[EmailCampaignsService, Depends(get_email_campaigns_service)]
) -> None:
    """Delete email campaign (only draft campaigns)."""
    success = await service.delete_campaign(campaign_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete campaign - either not found or not in draft status"
        )


@router.post(
    "/{campaign_id}/send",
    response_model=EmailCampaignResponse,
    summary="Send email campaign"
)
async def send_email_campaign(
    campaign_id: UUID,
    data: SendCampaignRequest,
    current_admin: RequireAuth,
    service: Annotated[EmailCampaignsService, Depends(get_email_campaigns_service)]
) -> EmailCampaignResponse:
    """Send email campaign immediately or as test."""
    campaign = await service.send_campaign(campaign_id)
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email campaign not found"
        )
    return EmailCampaignResponse.model_validate(campaign)
