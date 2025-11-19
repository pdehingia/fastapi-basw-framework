"""
Marketing Management Service

This service provides comprehensive marketing management operations including
promo codes, referrals, and advertisements for the admin panel.
"""

import logging
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, date, timedelta
from decimal import Decimal
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from app.shared.models.booking import (
    PromoCode, Referral, Ad, DiscountType, ReferralStatus, AdType, AdStatus
)
from app.shared.repositories.marketing import (
    PromoCodeRepository, ReferralRepository, AdRepository, MarketingAnalyticsRepository
)
from app.domains.admin.features.v1.marketing_management.schemas import (
    PromoCodeCreate, PromoCodeUpdate, PromoCodeResponse, PromoCodeFilters,
    PromoCodeUsageStats, PromoCodeAnalytics,
    ReferralCreate, ReferralUpdate, ReferralResponse, ReferralFilters,
    ReferralStats, ReferralAnalytics,
    AdCreate, AdUpdate, AdResponse, AdFilters, AdPerformanceMetrics, AdAnalytics,
    CampaignPerformance, MarketingDashboard, BulkPromoCodeCreate, BulkPromoCodeResponse,
    CampaignCreate, CampaignResponse
)

logger = logging.getLogger(__name__)


class MarketingManagementService:
    """Service for marketing management operations."""
    
    def __init__(self, db: Session):
        self.db = db
        self.promo_code_repo = PromoCodeRepository(db)
        self.referral_repo = ReferralRepository(db)
        self.ad_repo = AdRepository(db)
        self.analytics_repo = MarketingAnalyticsRepository(db)
    
    # Promo Code Management
    async def create_promo_code(self, promo_data: PromoCodeCreate) -> PromoCodeResponse:
        """Create a new promo code."""
        try:
            # Check if code already exists
            existing_code = self.promo_code_repo.get_by_code(promo_data.code)
            if existing_code:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Promo code already exists"
                )
            
            promo_code = PromoCode(
                **promo_data.model_dump(),
                usage_count=0
            )
            
            created_code = self.promo_code_repo.create(promo_code)
            logger.info(f"Created promo code: {created_code.code}")
            
            return PromoCodeResponse.model_validate(created_code)
            
        except IntegrityError as e:
            logger.error(f"Error creating promo code: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Promo code creation failed due to data constraint violation"
            )
        except Exception as e:
            logger.error(f"Unexpected error creating promo code: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create promo code"
            )
    
    async def get_promo_code(self, promo_id: UUID) -> PromoCodeResponse:
        """Get promo code by ID."""
        promo_code = self.promo_code_repo.get_by_id(promo_id)
        if not promo_code:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Promo code not found"
            )
        
        return PromoCodeResponse.model_validate(promo_code)
    
    async def get_promo_code_by_code(self, code: str) -> PromoCodeResponse:
        """Get promo code by code string."""
        promo_code = self.promo_code_repo.get_by_code(code)
        if not promo_code:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Promo code not found"
            )
        
        return PromoCodeResponse.model_validate(promo_code)
    
    async def update_promo_code(
        self, 
        promo_id: UUID, 
        promo_data: PromoCodeUpdate
    ) -> PromoCodeResponse:
        """Update promo code."""
        promo_code = self.promo_code_repo.get_by_id(promo_id)
        if not promo_code:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Promo code not found"
            )
        
        # Update fields
        update_data = promo_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(promo_code, field, value)
        
        updated_code = self.promo_code_repo.update(promo_code)
        logger.info(f"Updated promo code: {promo_id}")
        
        return PromoCodeResponse.model_validate(updated_code)
    
    async def delete_promo_code(self, promo_id: UUID) -> Dict[str, Any]:
        """Delete promo code."""
        promo_code = self.promo_code_repo.get_by_id(promo_id)
        if not promo_code:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Promo code not found"
            )
        
        self.promo_code_repo.delete(promo_code)
        logger.info(f"Deleted promo code: {promo_id}")
        
        return {"message": "Promo code deleted successfully", "promo_id": str(promo_id)}
    
    async def search_promo_codes(
        self,
        filters: PromoCodeFilters,
        page: int = 1,
        size: int = 50
    ) -> Dict[str, Any]:
        """Search promo codes with filters."""
        offset = (page - 1) * size
        
        promo_codes = self.promo_code_repo.search_codes(
            search_term=filters.search_term,
            discount_type=filters.discount_type,
            is_active=filters.is_active,
            campaign_name=filters.campaign_name
        )
        
        # Apply pagination
        total = len(promo_codes)
        paginated_codes = promo_codes[offset:offset + size]
        
        return {
            "items": [PromoCodeResponse.model_validate(code) for code in paginated_codes],
            "total": total,
            "page": page,
            "size": size,
            "pages": (total + size - 1) // size
        }
    
    async def get_promo_code_usage_stats(self, promo_id: UUID) -> PromoCodeUsageStats:
        """Get usage statistics for a promo code."""
        usage_stats = self.promo_code_repo.get_usage_stats(promo_id)
        if not usage_stats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Promo code not found"
            )
        
        return PromoCodeUsageStats(**usage_stats)
    
    # Referral Management
    async def create_referral(self, referral_data: ReferralCreate) -> ReferralResponse:
        """Create a new referral."""
        try:
            # Check if referral code already exists
            existing_referral = self.referral_repo.get_by_code(referral_data.referral_code)
            if existing_referral:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Referral code already exists"
                )
            
            referral = Referral(
                **referral_data.model_dump(),
                status=ReferralStatus.PENDING
            )
            
            created_referral = self.referral_repo.create(referral)
            logger.info(f"Created referral: {created_referral.referral_code}")
            
            return ReferralResponse.model_validate(created_referral)
            
        except IntegrityError as e:
            logger.error(f"Error creating referral: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Referral creation failed"
            )
    
    async def get_referral(self, referral_id: UUID) -> ReferralResponse:
        """Get referral by ID."""
        referral = self.referral_repo.get_by_id(referral_id)
        if not referral:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Referral not found"
            )
        
        return ReferralResponse.model_validate(referral)
    
    async def update_referral(
        self, 
        referral_id: UUID, 
        referral_data: ReferralUpdate
    ) -> ReferralResponse:
        """Update referral."""
        referral = self.referral_repo.get_by_id(referral_id)
        if not referral:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Referral not found"
            )
        
        # Update fields
        update_data = referral_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(referral, field, value)
        
        updated_referral = self.referral_repo.update(referral)
        logger.info(f"Updated referral: {referral_id}")
        
        return ReferralResponse.model_validate(updated_referral)
    
    async def get_user_referrals(self, user_id: UUID, user_type: str) -> List[ReferralResponse]:
        """Get referrals for a specific user."""
        referrals = self.referral_repo.get_by_referrer(user_id, user_type)
        return [ReferralResponse.model_validate(referral) for referral in referrals]
    
    async def get_referral_stats(self, user_id: UUID, user_type: str) -> ReferralStats:
        """Get referral statistics for a user."""
        stats = self.referral_repo.get_referrer_stats(user_id, user_type)
        return ReferralStats(**stats)
    
    # Advertisement Management
    async def create_ad(self, ad_data: AdCreate) -> AdResponse:
        """Create a new advertisement."""
        try:
            ad = Ad(
                **ad_data.model_dump(),
                status=AdStatus.DRAFT
            )
            
            created_ad = self.ad_repo.create(ad)
            logger.info(f"Created ad: {created_ad.id}")
            
            return AdResponse.model_validate(created_ad)
            
        except IntegrityError as e:
            logger.error(f"Error creating ad: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Advertisement creation failed"
            )
    
    async def get_ad(self, ad_id: UUID) -> AdResponse:
        """Get advertisement by ID."""
        ad = self.ad_repo.get_by_id(ad_id)
        if not ad:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Advertisement not found"
            )
        
        return AdResponse.model_validate(ad)
    
    async def update_ad(self, ad_id: UUID, ad_data: AdUpdate) -> AdResponse:
        """Update advertisement."""
        ad = self.ad_repo.get_by_id(ad_id)
        if not ad:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Advertisement not found"
            )
        
        # Update fields
        update_data = ad_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(ad, field, value)
        
        updated_ad = self.ad_repo.update(ad)
        logger.info(f"Updated ad: {ad_id}")
        
        return AdResponse.model_validate(updated_ad)
    
    async def delete_ad(self, ad_id: UUID) -> Dict[str, Any]:
        """Delete advertisement."""
        ad = self.ad_repo.get_by_id(ad_id)
        if not ad:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Advertisement not found"
            )
        
        self.ad_repo.delete(ad)
        logger.info(f"Deleted ad: {ad_id}")
        
        return {"message": "Advertisement deleted successfully", "ad_id": str(ad_id)}
    
    async def search_ads(
        self,
        filters: AdFilters,
        page: int = 1,
        size: int = 50
    ) -> Dict[str, Any]:
        """Search advertisements with filters."""
        offset = (page - 1) * size
        
        ads = self.ad_repo.search_ads(
            search_term=filters.search_term,
            advertiser_type=filters.advertiser_type,
            ad_type=filters.ad_type,
            status=filters.status,
            campaign_name=filters.campaign_name
        )
        
        # Apply pagination
        total = len(ads)
        paginated_ads = ads[offset:offset + size]
        
        return {
            "items": [AdResponse.model_validate(ad) for ad in paginated_ads],
            "total": total,
            "page": page,
            "size": size,
            "pages": (total + size - 1) // size
        }
    
    async def get_ad_performance(self, ad_id: UUID) -> AdPerformanceMetrics:
        """Get performance metrics for an advertisement."""
        metrics = self.ad_repo.get_performance_metrics(ad_id)
        if not metrics:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Advertisement not found or no metrics available"
            )
        
        return AdPerformanceMetrics(**metrics)
    
    # Analytics and Reporting
    async def get_promo_code_analytics(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> PromoCodeAnalytics:
        """Get promo code analytics."""
        analytics = self.analytics_repo.get_promo_code_analytics(start_date, end_date)
        return PromoCodeAnalytics(**analytics)
    
    async def get_referral_analytics(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> ReferralAnalytics:
        """Get referral analytics."""
        analytics = self.analytics_repo.get_referral_analytics(start_date, end_date)
        return ReferralAnalytics(**analytics)
    
    async def get_ad_analytics(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> AdAnalytics:
        """Get advertisement analytics."""
        analytics = self.analytics_repo.get_ad_analytics(start_date, end_date)
        return AdAnalytics(**analytics)
    
    async def get_marketing_dashboard(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> MarketingDashboard:
        """Get comprehensive marketing dashboard."""
        promo_analytics = await self.get_promo_code_analytics(start_date, end_date)
        referral_analytics = await self.get_referral_analytics(start_date, end_date)
        ad_analytics = await self.get_ad_analytics(start_date, end_date)
        
        top_campaigns = self.analytics_repo.get_top_performing_campaigns(limit=5)
        top_campaign_responses = [CampaignPerformance(**campaign) for campaign in top_campaigns]
        
        return MarketingDashboard(
            promo_code_analytics=promo_analytics,
            referral_analytics=referral_analytics,
            ad_analytics=ad_analytics,
            top_campaigns=top_campaign_responses,
            period_start=start_date,
            period_end=end_date
        )
    
    # Bulk Operations
    async def bulk_create_promo_codes(
        self, 
        bulk_data: BulkPromoCodeCreate
    ) -> BulkPromoCodeResponse:
        """Create multiple promo codes in bulk."""
        created_codes = []
        failed_codes = []
        
        for code_data in bulk_data.promo_codes:
            try:
                created_code = await self.create_promo_code(code_data)
                created_codes.append(created_code)
            except Exception as e:
                failed_codes.append({
                    "code_data": code_data.model_dump(),
                    "error": str(e)
                })
        
        return BulkPromoCodeResponse(
            created_codes=created_codes,
            failed_codes=failed_codes,
            success_count=len(created_codes),
            failure_count=len(failed_codes)
        )
    
    # Campaign Management
    async def create_campaign(self, campaign_data: CampaignCreate) -> CampaignResponse:
        """Create a marketing campaign (placeholder for future implementation)."""
        # This would involve creating a campaigns table and managing
        # multiple marketing assets under one campaign
        campaign_id = UUID("12345678-1234-5678-9abc-123456789abc")  # Placeholder
        
        return CampaignResponse(
            id=campaign_id,
            campaign_name=campaign_data.campaign_name,
            campaign_type=campaign_data.campaign_type,
            description=campaign_data.description,
            start_date=campaign_data.start_date,
            end_date=campaign_data.end_date,
            budget=campaign_data.budget,
            target_audience=campaign_data.target_audience,
            goals=campaign_data.goals,
            performance_metrics={},
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
    
    # Special Operations
    async def approve_ad(self, ad_id: UUID, approval_notes: str = None) -> AdResponse:
        """Approve an advertisement."""
        ad = self.ad_repo.get_by_id(ad_id)
        if not ad:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Advertisement not found"
            )
        
        if ad.status != AdStatus.PENDING_REVIEW:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Advertisement is not pending review"
            )
        
        ad.status = AdStatus.APPROVED
        ad.approval = {
            "approved_at": datetime.utcnow().isoformat(),
            "approved_by": "system",  # Should be current admin user
            "notes": approval_notes
        }
        
        updated_ad = self.ad_repo.update(ad)
        logger.info(f"Approved ad: {ad_id}")
        
        return AdResponse.model_validate(updated_ad)
    
    async def reject_ad(self, ad_id: UUID, rejection_reason: str) -> AdResponse:
        """Reject an advertisement."""
        ad = self.ad_repo.get_by_id(ad_id)
        if not ad:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Advertisement not found"
            )
        
        if ad.status != AdStatus.PENDING_REVIEW:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Advertisement is not pending review"
            )
        
        ad.status = AdStatus.REJECTED
        ad.approval = {
            "rejected_at": datetime.utcnow().isoformat(),
            "rejected_by": "system",  # Should be current admin user
            "reason": rejection_reason
        }
        
        updated_ad = self.ad_repo.update(ad)
        logger.info(f"Rejected ad: {ad_id}")
        
        return AdResponse.model_validate(updated_ad)
    
    async def activate_promo_code(self, promo_id: UUID) -> PromoCodeResponse:
        """Activate a promo code."""
        promo_code = self.promo_code_repo.get_by_id(promo_id)
        if not promo_code:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Promo code not found"
            )
        
        promo_code.is_active = True
        updated_code = self.promo_code_repo.update(promo_code)
        logger.info(f"Activated promo code: {promo_id}")
        
        return PromoCodeResponse.model_validate(updated_code)
    
    async def deactivate_promo_code(self, promo_id: UUID) -> PromoCodeResponse:
        """Deactivate a promo code."""
        promo_code = self.promo_code_repo.get_by_id(promo_id)
        if not promo_code:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Promo code not found"
            )
        
        promo_code.is_active = False
        updated_code = self.promo_code_repo.update(promo_code)
        logger.info(f"Deactivated promo code: {promo_id}")
        
        return PromoCodeResponse.model_validate(updated_code)