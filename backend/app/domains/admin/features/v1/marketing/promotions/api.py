"""Promotions & Marketing API endpoints."""

from typing import Annotated, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse

from app.shared.constants import HTTP_STATUS_CODES, ERROR_MESSAGES, API_TAGS
from app.shared.responses import SuccessResponse
from app.shared.pagination import PaginationParams
from .dependencies import get_promotions_service
from .service import PromotionsMarketingService
from .schemas import (
    PromoCodeResponse,
    PromoCodeCreate,
    PromoCodeUpdate,
    PromoCodeAnalytics,
    PromoCodeStatus,
    PromoCodeType,
    EmailCampaignResponse,
    EmailCampaignCreate,
    EmailTemplateResponse,
    EmailTemplateCreate,
    SMSResponse,
    SMSBroadcastRequest,
    SMSStatus
)

router = APIRouter(prefix="/promotions", tags=[API_TAGS.PROMOTION_MANAGEMENT])


# Promo Code Management Endpoints (5 endpoints)
@router.get("/promo-codes", response_model=SuccessResponse[list[PromoCodeResponse]])
async def get_promo_codes(
    service: Annotated[PromotionsMarketingService, Depends(get_promotions_service)],
    pagination: Annotated[PaginationParams, Depends()],
    status: Optional[PromoCodeStatus] = None,
    type: Optional[PromoCodeType] = None,
    search: Optional[str] = None
):
    """Get promo codes list with filtering."""
    promo_codes = service.get_promo_codes(
        skip=pagination.skip,
        limit=pagination.limit,
        status=status,
        type=type,
        search=search
    )
    return SuccessResponse(data=promo_codes)


@router.post("/promo-codes", response_model=SuccessResponse[PromoCodeResponse])
async def create_promo_code(
    promo_data: PromoCodeCreate,
    service: Annotated[PromotionsMarketingService, Depends(get_promotions_service)]
):
    """Create new promo code."""
    promo_code = service.create_promo_code(promo_data)
    return SuccessResponse(data=promo_code)


@router.put("/promo-codes/{promo_id}", response_model=SuccessResponse[PromoCodeResponse])
async def update_promo_code(
    promo_id: str,
    promo_data: PromoCodeUpdate,
    service: Annotated[PromotionsMarketingService, Depends(get_promotions_service)]
):
    """Update promo code."""
    promo_code = service.update_promo_code(promo_id, promo_data)
    if not promo_code:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.NOT_FOUND, 
            detail=ERROR_MESSAGES.PROMO_CODE_NOT_FOUND
        )
    return SuccessResponse(data=promo_code)


@router.post("/promo-codes/{promo_id}/deactivate", response_model=SuccessResponse[dict])
async def deactivate_promo_code(
    promo_id: str,
    service: Annotated[PromotionsMarketingService, Depends(get_promotions_service)]
):
    """Deactivate promo code."""
    success = service.deactivate_promo_code(promo_id)
    if not success:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.NOT_FOUND, 
            detail=ERROR_MESSAGES.PROMO_CODE_NOT_FOUND
        )
    return SuccessResponse(data={"deactivated": True})


@router.get("/promo-codes/{promo_id}/analytics", response_model=SuccessResponse[PromoCodeAnalytics])
async def get_promo_code_analytics(
    promo_id: str,
    service: Annotated[PromotionsMarketingService, Depends(get_promotions_service)]
):
    """Get promo code analytics."""
    analytics = service.get_promo_code_analytics(promo_id)
    if not analytics:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.NOT_FOUND, 
            detail=ERROR_MESSAGES.PROMO_CODE_NOT_FOUND
        )
    return SuccessResponse(data=analytics)


# Email Campaign Management Endpoints (3 endpoints)
@router.get("/email-campaigns", response_model=SuccessResponse[list[EmailCampaignResponse]])
async def get_email_campaigns(
    service: Annotated[PromotionsMarketingService, Depends(get_promotions_service)],
    pagination: Annotated[PaginationParams, Depends()],
    status: Optional[str] = None,
    search: Optional[str] = None
):
    """Get email campaigns."""
    campaigns = service.get_email_campaigns(
        skip=pagination.skip,
        limit=pagination.limit,
        status=status,
        search=search
    )
    return SuccessResponse(data=campaigns)


@router.post("/email-campaigns", response_model=SuccessResponse[EmailCampaignResponse])
async def create_email_campaign(
    campaign_data: EmailCampaignCreate,
    service: Annotated[PromotionsMarketingService, Depends(get_promotions_service)]
):
    """Create email campaign."""
    campaign = service.create_email_campaign(campaign_data)
    return SuccessResponse(data=campaign)


@router.get("/email-templates", response_model=SuccessResponse[list[EmailTemplateResponse]])
async def get_email_templates(
    service: Annotated[PromotionsMarketingService, Depends(get_promotions_service)],
    pagination: Annotated[PaginationParams, Depends()],
    category: Optional[str] = None,
    search: Optional[str] = None
):
    """Get email templates."""
    templates = service.get_email_templates(
        skip=pagination.skip,
        limit=pagination.limit,
        category=category,
        search=search
    )
    return SuccessResponse(data=templates)


@router.post("/email-templates", response_model=SuccessResponse[EmailTemplateResponse])
async def create_email_template(
    template_data: EmailTemplateCreate,
    service: Annotated[PromotionsMarketingService, Depends(get_promotions_service)]
):
    """Create email template."""
    template = service.create_email_template(template_data)
    return SuccessResponse(data=template)


# SMS Campaign Management Endpoints (2 endpoints)
@router.get("/sms/history", response_model=SuccessResponse[list[SMSResponse]])
async def get_sms_history(
    service: Annotated[PromotionsMarketingService, Depends(get_promotions_service)],
    pagination: Annotated[PaginationParams, Depends()],
    status: Optional[SMSStatus] = None,
    date_from: Optional[datetime] = Query(None, description="Filter SMS from this date"),
    date_to: Optional[datetime] = Query(None, description="Filter SMS until this date")
):
    """Get SMS history."""
    sms_history = service.get_sms_history(
        skip=pagination.skip,
        limit=pagination.limit,
        status=status,
        date_from=date_from,
        date_to=date_to
    )
    return SuccessResponse(data=sms_history)


@router.post("/sms/broadcast", response_model=SuccessResponse[SMSResponse])
async def send_sms_broadcast(
    sms_data: SMSBroadcastRequest,
    service: Annotated[PromotionsMarketingService, Depends(get_promotions_service)]
):
    """Send SMS broadcast."""
    sms_response = service.send_sms_broadcast(sms_data)
    return SuccessResponse(data=sms_response)


# Export Endpoints
@router.get("/export/promo-codes")
async def export_promo_codes(
    service: Annotated[PromotionsMarketingService, Depends(get_promotions_service)],
    status: Optional[PromoCodeStatus] = None,
    type: Optional[PromoCodeType] = None
):
    """Export promo codes to Excel."""
    file_stream, filename = service.export_promo_codes(status=status, type=type)
    
    return StreamingResponse(
        file_stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )