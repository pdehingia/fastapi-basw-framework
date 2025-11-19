"""
Marketing Management API

This module provides comprehensive REST API endpoints for marketing management.
Includes promo codes, referrals, and advertisements management.

REFACTORED: Now uses constants for consistent API structure and responses.
"""

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException, Query, Path
from sqlalchemy.exc import SQLAlchemyError

# REFACTORED: Import constants for consistent API responses
from app.shared.constants import (
    API_ROUTES,
    API_TAGS,
    HTTP_STATUS_CODES,
    SUCCESS_MESSAGES,
    ERROR_MESSAGES,
    VALIDATION_MESSAGES
)

from app.domains.admin.features.v1.marketing_management.dependencies import MarketingManagementServiceDep
from app.domains.admin.features.v1.marketing_management.schemas import (
    PromoCodeResponse, PromoCodeCreate, PromoCodeUpdate,
    ReferralResponse, ReferralCreate, ReferralUpdate,
    AdResponse, AdCreate, AdUpdate,
    PromoCodeFilterParams, ReferralFilterParams, AdFilterParams,
    MarketingAnalyticsResponse, CampaignPerformanceResponse,
    BulkOperationResponse
)

# REFACTORED: Use constants for router configuration
router = APIRouter(
    prefix="/marketing",  # Keep this specific since it's a feature prefix
    tags=[API_TAGS.MARKETING_MANAGEMENT]  # Use constant instead of hardcoded string
)


# === PROMO CODE ENDPOINTS ===

@router.post(
    "/promo-codes", 
    response_model=PromoCodeResponse, 
    status_code=HTTP_STATUS_CODES.CREATED  # Use constant instead of 201
)
async def create_promo_code(
    promo_data: PromoCodeCreate,
    service: MarketingManagementServiceDep
) -> PromoCodeResponse:
    """Create a new promo code."""
    try:
        promo_code = await service.create_promo_code(promo_data.model_dump())
        return PromoCodeResponse.model_validate(promo_code)
    except ValueError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST,  # Use constant
            detail=str(e)
        )
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,  # Use constant
            detail=ERROR_MESSAGES.DATABASE_ERROR  # Use constant message
        )


@router.get("/promo-codes", response_model=List[PromoCodeResponse])
async def get_promo_codes(
    service: MarketingManagementServiceDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    active_only: bool = Query(False),
    code: Optional[str] = Query(None),
    discount_type: Optional[str] = Query(None),
    min_discount_value: Optional[float] = Query(None),
    max_discount_value: Optional[float] = Query(None)
) -> List[PromoCodeResponse]:
    """Get promo codes with filtering options."""
    try:
        filters = PromoCodeFilterParams(
            active_only=active_only,
            code=code,
            discount_type=discount_type,
            min_discount_value=min_discount_value,
            max_discount_value=max_discount_value
        )
        promo_codes = await service.get_promo_codes(skip=skip, limit=limit, filters=filters)
        return [PromoCodeResponse.model_validate(pc) for pc in promo_codes]
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=ERROR_MESSAGES.DATABASE_ERROR
        )


@router.get("/promo-codes/{promo_code_id}", response_model=PromoCodeResponse)
async def get_promo_code(
    promo_code_id: int = Path(..., gt=0),
    service: MarketingManagementServiceDep = None
) -> PromoCodeResponse:
    """Get promo code by ID."""
    try:
        promo_code = await service.get_promo_code_by_id(promo_code_id)
        if not promo_code:
            raise HTTPException(
                status_code=HTTP_STATUS_CODES.NOT_FOUND,
                detail=ERROR_MESSAGES.NOT_FOUND.format(entity="Promo code")  # Dynamic message
            )
        return PromoCodeResponse.model_validate(promo_code)
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=ERROR_MESSAGES.DATABASE_ERROR
        )


@router.put("/promo-codes/{promo_code_id}", response_model=PromoCodeResponse)
async def update_promo_code(
    promo_code_id: int,
    update_data: PromoCodeUpdate,
    service: MarketingManagementServiceDep
) -> PromoCodeResponse:
    """Update promo code."""
    try:
        promo_code = await service.update_promo_code(promo_code_id, update_data.model_dump(exclude_unset=True))
        if not promo_code:
            raise HTTPException(
                status_code=HTTP_STATUS_CODES.NOT_FOUND,
                detail=ERROR_MESSAGES.NOT_FOUND.format(entity="Promo code")
            )
        return PromoCodeResponse.model_validate(promo_code)
    except ValueError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST,
            detail=str(e)
        )
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=ERROR_MESSAGES.DATABASE_ERROR
        )


@router.delete("/promo-codes/{promo_code_id}", status_code=HTTP_STATUS_CODES.NO_CONTENT)
async def delete_promo_code(
    promo_code_id: int,
    service: MarketingManagementServiceDep
):
    """Delete promo code."""
    try:
        success = await service.delete_promo_code(promo_code_id)
        if not success:
            raise HTTPException(
                status_code=HTTP_STATUS_CODES.NOT_FOUND,
                detail=ERROR_MESSAGES.NOT_FOUND.format(entity="Promo code")
            )
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=ERROR_MESSAGES.DATABASE_ERROR
        )


@router.post("/promo-codes/{promo_code_id}/activate", response_model=PromoCodeResponse)
async def activate_promo_code(
    promo_code_id: int,
    service: MarketingManagementServiceDep
) -> PromoCodeResponse:
    """Activate promo code."""
    try:
        promo_code = await service.activate_promo_code(promo_code_id)
        if not promo_code:
            raise HTTPException(
                status_code=HTTP_STATUS_CODES.NOT_FOUND,
                detail=ERROR_MESSAGES.NOT_FOUND.format(entity="Promo code")
            )
        return PromoCodeResponse.model_validate(promo_code)
    except ValueError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST,
            detail=str(e)
        )
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=ERROR_MESSAGES.DATABASE_ERROR
        )


@router.post("/promo-codes/{promo_code_id}/deactivate", response_model=PromoCodeResponse)
async def deactivate_promo_code(
    promo_code_id: int,
    service: MarketingManagementServiceDep
) -> PromoCodeResponse:
    """Deactivate promo code."""
    try:
        promo_code = await service.deactivate_promo_code(promo_code_id)
        if not promo_code:
            raise HTTPException(
                status_code=HTTP_STATUS_CODES.NOT_FOUND,
                detail=ERROR_MESSAGES.NOT_FOUND.format(entity="Promo code")
            )
        return PromoCodeResponse.model_validate(promo_code)
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=ERROR_MESSAGES.DATABASE_ERROR
        )

# === REFERRAL ENDPOINTS ===

@router.post(
    "/referrals", 
    response_model=ReferralResponse, 
    status_code=HTTP_STATUS_CODES.CREATED
)
async def create_referral(
    referral_data: ReferralCreate,
    service: MarketingManagementServiceDep
) -> ReferralResponse:
    """Create a new referral."""
    try:
        referral = await service.create_referral(referral_data.model_dump())
        return ReferralResponse.model_validate(referral)
    except ValueError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST,
            detail=str(e)
        )
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=ERROR_MESSAGES.DATABASE_ERROR
        )


@router.get("/referrals", response_model=List[ReferralResponse])
async def get_referrals(
    service: MarketingManagementServiceDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    status: Optional[str] = Query(None),
    referrer_id: Optional[int] = Query(None),
    referred_id: Optional[int] = Query(None),
    min_commission: Optional[float] = Query(None),
    max_commission: Optional[float] = Query(None)
) -> List[ReferralResponse]:
    """Get referrals with filtering options."""
    try:
        filters = ReferralFilterParams(
            status=status,
            referrer_id=referrer_id,
            referred_id=referred_id,
            min_commission=min_commission,
            max_commission=max_commission
        )
        referrals = await service.get_referrals(skip=skip, limit=limit, filters=filters)
        return [ReferralResponse.model_validate(r) for r in referrals]
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=ERROR_MESSAGES.DATABASE_ERROR
        )


@router.get("/referrals/{referral_id}", response_model=ReferralResponse)
async def get_referral(
    referral_id: int = Path(..., gt=0),
    service: MarketingManagementServiceDep = None
) -> ReferralResponse:
    """Get referral by ID."""
    try:
        referral = await service.get_referral_by_id(referral_id)
        if not referral:
            raise HTTPException(
                status_code=HTTP_STATUS_CODES.NOT_FOUND,
                detail=ERROR_MESSAGES.NOT_FOUND.format(entity="Referral")
            )
        return ReferralResponse.model_validate(referral)
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=ERROR_MESSAGES.DATABASE_ERROR
        )


@router.put("/referrals/{referral_id}", response_model=ReferralResponse)
async def update_referral(
    referral_id: int,
    update_data: ReferralUpdate,
    service: MarketingManagementServiceDep
) -> ReferralResponse:
    """Update referral."""
    try:
        referral = await service.update_referral(referral_id, update_data.model_dump(exclude_unset=True))
        if not referral:
            raise HTTPException(
                status_code=HTTP_STATUS_CODES.NOT_FOUND,
                detail=ERROR_MESSAGES.NOT_FOUND.format(entity="Referral")
            )
        return ReferralResponse.model_validate(referral)
    except ValueError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST,
            detail=str(e)
        )
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=ERROR_MESSAGES.DATABASE_ERROR
        )


@router.delete("/referrals/{referral_id}", status_code=HTTP_STATUS_CODES.NO_CONTENT)
async def delete_referral(
    referral_id: int,
    service: MarketingManagementServiceDep
):
    """Delete referral."""
    try:
        success = await service.delete_referral(referral_id)
        if not success:
            raise HTTPException(
                status_code=HTTP_STATUS_CODES.NOT_FOUND,
                detail=ERROR_MESSAGES.NOT_FOUND.format(entity="Referral")
            )
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=ERROR_MESSAGES.DATABASE_ERROR
        )


@router.post("/referrals/{referral_id}/complete", response_model=ReferralResponse)
async def complete_referral(
    referral_id: int,
    service: MarketingManagementServiceDep
) -> ReferralResponse:
    """Complete referral."""
    try:
        referral = await service.complete_referral(referral_id)
        if not referral:
            raise HTTPException(
                status_code=HTTP_STATUS_CODES.NOT_FOUND,
                detail=ERROR_MESSAGES.NOT_FOUND.format(entity="Referral")
            )
        return ReferralResponse.model_validate(referral)
    except ValueError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST,
            detail=str(e)
        )
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=ERROR_MESSAGES.DATABASE_ERROR
        )


# === ADVERTISEMENT ENDPOINTS ===

@router.post(
    "/ads", 
    response_model=AdResponse, 
    status_code=HTTP_STATUS_CODES.CREATED
)
async def create_ad(
    ad_data: AdCreate,
    service: MarketingManagementServiceDep
) -> AdResponse:
    """Create a new advertisement."""
    try:
        ad = await service.create_ad(ad_data.model_dump())
        return AdResponse.model_validate(ad)
    except ValueError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST,
            detail=str(e)
        )
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=ERROR_MESSAGES.DATABASE_ERROR
        )


@router.get("/ads", response_model=List[AdResponse])
async def get_ads(
    service: MarketingManagementServiceDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    active_only: bool = Query(False),
    ad_type: Optional[str] = Query(None),
    salon_id: Optional[int] = Query(None),
    min_budget: Optional[float] = Query(None),
    max_budget: Optional[float] = Query(None)
) -> List[AdResponse]:
    """Get ads with filtering options."""
    try:
        filters = AdFilterParams(
            active_only=active_only,
            ad_type=ad_type,
            salon_id=salon_id,
            min_budget=min_budget,
            max_budget=max_budget
        )
        ads = await service.get_ads(skip=skip, limit=limit, filters=filters)
        return [AdResponse.model_validate(ad) for ad in ads]
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, 
            detail=ERROR_MESSAGES.DATABASE_ERROR
        )


@router.get("/ads/{ad_id}", response_model=AdResponse)
async def get_ad(
    ad_id: int = Path(..., gt=0),
    service: MarketingManagementServiceDep = None
) -> AdResponse:
    """Get ad by ID."""
    try:
        ad = await service.get_ad_by_id(ad_id)
        if not ad:
            raise HTTPException(
                status_code=HTTP_STATUS_CODES.NOT_FOUND, 
                detail=ERROR_MESSAGES.NOT_FOUND.format(entity="Ad")
            )
        return AdResponse.model_validate(ad)
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, 
            detail=ERROR_MESSAGES.DATABASE_ERROR
        )


@router.put("/ads/{ad_id}", response_model=AdResponse)
async def update_ad(
    ad_id: int,
    update_data: AdUpdate,
    service: MarketingManagementServiceDep
) -> AdResponse:
    """Update ad."""
    try:
        ad = await service.update_ad(ad_id, update_data.model_dump(exclude_unset=True))
        if not ad:
            raise HTTPException(
                status_code=HTTP_STATUS_CODES.NOT_FOUND, 
                detail=ERROR_MESSAGES.NOT_FOUND.format(entity="Ad")
            )
        return AdResponse.model_validate(ad)
    except ValueError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST, 
            detail=str(e)
        )
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, 
            detail=ERROR_MESSAGES.DATABASE_ERROR
        )


@router.delete("/ads/{ad_id}", status_code=HTTP_STATUS_CODES.NO_CONTENT)
async def delete_ad(
    ad_id: int,
    service: MarketingManagementServiceDep
):
    """Delete ad."""
    try:
        success = await service.delete_ad(ad_id)
        if not success:
            raise HTTPException(
                status_code=HTTP_STATUS_CODES.NOT_FOUND, 
                detail=ERROR_MESSAGES.NOT_FOUND.format(entity="Ad")
            )
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, 
            detail=ERROR_MESSAGES.DATABASE_ERROR
        )


@router.post("/ads/{ad_id}/activate", response_model=AdResponse)
async def activate_ad(
    ad_id: int,
    service: MarketingManagementServiceDep
) -> AdResponse:
    """Activate ad."""
    try:
        ad = await service.activate_ad(ad_id)
        if not ad:
            raise HTTPException(
                status_code=HTTP_STATUS_CODES.NOT_FOUND, 
                detail=ERROR_MESSAGES.NOT_FOUND.format(entity="Ad")
            )
        return AdResponse.model_validate(ad)
    except ValueError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST, 
            detail=str(e)
        )
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, 
            detail=ERROR_MESSAGES.DATABASE_ERROR
        )


@router.post("/ads/{ad_id}/deactivate", response_model=AdResponse)
async def deactivate_ad(
    ad_id: int,
    service: MarketingManagementServiceDep
) -> AdResponse:
    """Deactivate ad."""
    try:
        ad = await service.deactivate_ad(ad_id)
        if not ad:
            raise HTTPException(
                status_code=HTTP_STATUS_CODES.NOT_FOUND, 
                detail=ERROR_MESSAGES.NOT_FOUND.format(entity="Ad")
            )
        return AdResponse.model_validate(ad)
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, 
            detail=ERROR_MESSAGES.DATABASE_ERROR
        )


# === ANALYTICS ENDPOINTS ===

@router.get("/analytics", response_model=MarketingAnalyticsResponse)
async def get_marketing_analytics(
    service: MarketingManagementServiceDep,
    days: int = Query(30, ge=1, le=365)
) -> MarketingAnalyticsResponse:
    """Get marketing analytics."""
    try:
        analytics = await service.get_marketing_analytics(days)
        return MarketingAnalyticsResponse.model_validate(analytics)
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=ERROR_MESSAGES.DATABASE_ERROR
        )


@router.get("/campaigns/performance", response_model=List[CampaignPerformanceResponse])
async def get_campaign_performance(
    service: MarketingManagementServiceDep,
    campaign_type: Optional[str] = Query(None),
    days: int = Query(30, ge=1, le=365)
) -> List[CampaignPerformanceResponse]:
    """Get campaign performance data."""
    try:
        performance = await service.get_campaign_performance(campaign_type, days)
        return [CampaignPerformanceResponse.model_validate(p) for p in performance]
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=ERROR_MESSAGES.DATABASE_ERROR
        )


# === BULK OPERATIONS ===

@router.post("/promo-codes/bulk-activate", response_model=BulkOperationResponse)
async def bulk_activate_promo_codes(
    promo_code_ids: List[int],
    service: MarketingManagementServiceDep
) -> BulkOperationResponse:
    """Bulk activate promo codes."""
    try:
        result = await service.bulk_activate_promo_codes(promo_code_ids)
        return BulkOperationResponse.model_validate(result)
    except ValueError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST,
            detail=str(e)
        )
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=ERROR_MESSAGES.DATABASE_ERROR
        )


@router.post("/promo-codes/bulk-deactivate", response_model=BulkOperationResponse)
async def bulk_deactivate_promo_codes(
    promo_code_ids: List[int],
    service: MarketingManagementServiceDep
) -> BulkOperationResponse:
    """Bulk deactivate promo codes."""
    try:
        result = await service.bulk_deactivate_promo_codes(promo_code_ids)
        return BulkOperationResponse.model_validate(result)
    except ValueError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST,
            detail=str(e)
        )
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=ERROR_MESSAGES.DATABASE_ERROR
        )


@router.post("/ads/bulk-activate", response_model=BulkOperationResponse)
async def bulk_activate_ads(
    ad_ids: List[int],
    service: MarketingManagementServiceDep
) -> BulkOperationResponse:
    """Bulk activate ads."""
    try:
        result = await service.bulk_activate_ads(ad_ids)
        return BulkOperationResponse.model_validate(result)
    except ValueError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST,
            detail=str(e)
        )
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=ERROR_MESSAGES.DATABASE_ERROR
        )


@router.post("/ads/bulk-deactivate", response_model=BulkOperationResponse)
async def bulk_deactivate_ads(
    ad_ids: List[int],
    service: MarketingManagementServiceDep
) -> BulkOperationResponse:
    """Bulk deactivate ads."""
    try:
        result = await service.bulk_deactivate_ads(ad_ids)
        return BulkOperationResponse.model_validate(result)
    except ValueError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST,
            detail=str(e)
        )
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=ERROR_MESSAGES.DATABASE_ERROR
        )