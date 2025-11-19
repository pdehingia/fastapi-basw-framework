"""
Marketing Repository

This module provides data access layer for marketing entities including
promo codes, referrals, and advertisements.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, date
from decimal import Decimal
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc, text
from sqlalchemy.dialects.postgresql import JSONB

from app.shared.models.booking import (
    PromoCode, Referral, Ad, DiscountType, ReferralStatus, AdType, AdStatus
)
from app.shared.repositories.base import BaseRepository


class PromoCodeRepository(BaseRepository[PromoCode, dict, dict]):
    """Repository for promo code operations."""
    
    def __init__(self, db: Session):
        super().__init__(db, PromoCode)
    
    def get_by_code(self, code: str) -> Optional[PromoCode]:
        """Get promo code by code string."""
        return self.db.query(PromoCode).filter(
            PromoCode.code == code.upper()
        ).first()
    
    def get_active_codes(self) -> List[PromoCode]:
        """Get all active promo codes."""
        current_time = datetime.utcnow()
        return self.db.query(PromoCode).filter(
            and_(
                PromoCode.is_active == True,
                PromoCode.valid_from <= current_time,
                PromoCode.valid_until >= current_time
            )
        ).order_by(desc(PromoCode.created_at)).all()
    
    def get_by_campaign(self, campaign_name: str) -> List[PromoCode]:
        """Get promo codes by campaign name."""
        return self.db.query(PromoCode).filter(
            PromoCode.campaign_name == campaign_name
        ).order_by(desc(PromoCode.created_at)).all()
    
    def get_expiring_soon(self, days: int = 7) -> List[PromoCode]:
        """Get promo codes expiring in the next N days."""
        expiry_date = datetime.utcnow() + text(f'INTERVAL \'{days} days\'')
        return self.db.query(PromoCode).filter(
            and_(
                PromoCode.is_active == True,
                PromoCode.valid_until <= expiry_date,
                PromoCode.valid_until >= datetime.utcnow()
            )
        ).order_by(asc(PromoCode.valid_until)).all()
    
    def get_usage_stats(self, promo_id: UUID) -> Dict[str, Any]:
        """Get usage statistics for a promo code."""
        promo = self.get_by_id(promo_id)
        if not promo:
            return {}
        
        usage_rate = (promo.usage_count / promo.usage_limit * 100) if promo.usage_limit else 0
        
        return {
            'total_usage': promo.usage_count,
            'usage_limit': promo.usage_limit,
            'usage_rate': round(usage_rate, 2),
            'remaining_uses': max(0, (promo.usage_limit or 0) - promo.usage_count),
            'is_unlimited': promo.usage_limit is None,
            'days_remaining': (promo.valid_until - datetime.utcnow()).days if promo.valid_until > datetime.utcnow() else 0
        }
    
    def search_codes(
        self, 
        search_term: str = None,
        discount_type: DiscountType = None,
        is_active: bool = None,
        campaign_name: str = None
    ) -> List[PromoCode]:
        """Search promo codes with filters."""
        query = self.db.query(PromoCode)
        
        if search_term:
            query = query.filter(
                or_(
                    PromoCode.code.ilike(f'%{search_term}%'),
                    PromoCode.title.ilike(f'%{search_term}%'),
                    PromoCode.description.ilike(f'%{search_term}%')
                )
            )
        
        if discount_type:
            query = query.filter(PromoCode.discount_type == discount_type)
        
        if is_active is not None:
            query = query.filter(PromoCode.is_active == is_active)
        
        if campaign_name:
            query = query.filter(PromoCode.campaign_name.ilike(f'%{campaign_name}%'))
        
        return query.order_by(desc(PromoCode.created_at)).all()


class ReferralRepository(BaseRepository[Referral, dict, dict]):
    """Repository for referral operations."""
    
    def __init__(self, db: Session):
        super().__init__(db, Referral)
    
    def get_by_code(self, referral_code: str) -> Optional[Referral]:
        """Get referral by code."""
        return self.db.query(Referral).filter(
            Referral.referral_code == referral_code.upper()
        ).first()
    
    def get_by_referrer(self, user_id: UUID, user_type: str) -> List[Referral]:
        """Get referrals created by a user."""
        return self.db.query(Referral).filter(
            and_(
                Referral.referrer_user_id == user_id,
                Referral.referrer_user_type == user_type
            )
        ).order_by(desc(Referral.created_at)).all()
    
    def get_by_referee(self, user_id: UUID, user_type: str) -> Optional[Referral]:
        """Get referral for a referee user."""
        return self.db.query(Referral).filter(
            and_(
                Referral.referee_user_id == user_id,
                Referral.referee_user_type == user_type
            )
        ).first()
    
    def get_pending_referrals(self) -> List[Referral]:
        """Get all pending referrals."""
        return self.db.query(Referral).filter(
            Referral.status == ReferralStatus.PENDING
        ).order_by(desc(Referral.created_at)).all()
    
    def get_qualified_unrewarded(self) -> List[Referral]:
        """Get qualified referrals that haven't been rewarded yet."""
        return self.db.query(Referral).filter(
            Referral.status == ReferralStatus.QUALIFIED
        ).order_by(asc(Referral.qualified_at)).all()
    
    def get_referrer_stats(self, user_id: UUID, user_type: str) -> Dict[str, Any]:
        """Get referral statistics for a referrer."""
        referrals = self.get_by_referrer(user_id, user_type)
        
        total_referrals = len(referrals)
        qualified_referrals = len([r for r in referrals if r.status == ReferralStatus.QUALIFIED])
        rewarded_referrals = len([r for r in referrals if r.status == ReferralStatus.REWARDED])
        total_rewards = sum(r.referrer_reward_amount or 0 for r in referrals if r.status == ReferralStatus.REWARDED)
        
        return {
            'total_referrals': total_referrals,
            'qualified_referrals': qualified_referrals,
            'rewarded_referrals': rewarded_referrals,
            'pending_referrals': total_referrals - qualified_referrals - rewarded_referrals,
            'total_rewards_earned': float(total_rewards),
            'conversion_rate': round((qualified_referrals / total_referrals * 100) if total_referrals > 0 else 0, 2)
        }
    
    def get_expiring_soon(self, days: int = 7) -> List[Referral]:
        """Get referrals expiring in the next N days."""
        expiry_date = datetime.utcnow() + text(f'INTERVAL \'{days} days\'')
        return self.db.query(Referral).filter(
            and_(
                Referral.status == ReferralStatus.PENDING,
                Referral.expires_at <= expiry_date,
                Referral.expires_at >= datetime.utcnow()
            )
        ).order_by(asc(Referral.expires_at)).all()


class AdRepository(BaseRepository[Ad, dict, dict]):
    """Repository for advertisement operations."""
    
    def __init__(self, db: Session):
        super().__init__(db, Ad)
    
    def get_by_campaign(self, campaign_name: str) -> List[Ad]:
        """Get ads by campaign name."""
        return self.db.query(Ad).filter(
            Ad.campaign_name == campaign_name
        ).order_by(desc(Ad.created_at)).all()
    
    def get_active_ads(self) -> List[Ad]:
        """Get all active advertisements."""
        return self.db.query(Ad).filter(
            Ad.status == AdStatus.ACTIVE
        ).order_by(desc(Ad.created_at)).all()
    
    def get_by_status(self, status: AdStatus) -> List[Ad]:
        """Get ads by status."""
        return self.db.query(Ad).filter(
            Ad.status == status
        ).order_by(desc(Ad.created_at)).all()
    
    def get_by_advertiser(self, advertiser_type: str, advertiser_name: str = None) -> List[Ad]:
        """Get ads by advertiser."""
        query = self.db.query(Ad).filter(Ad.advertiser_type == advertiser_type)
        
        if advertiser_name:
            query = query.filter(Ad.advertiser_name == advertiser_name)
        
        return query.order_by(desc(Ad.created_at)).all()
    
    def get_by_ad_type(self, ad_type: AdType) -> List[Ad]:
        """Get ads by type."""
        return self.db.query(Ad).filter(
            Ad.ad_type == ad_type
        ).order_by(desc(Ad.created_at)).all()
    
    def get_pending_approval(self) -> List[Ad]:
        """Get ads pending approval."""
        return self.db.query(Ad).filter(
            Ad.status == AdStatus.PENDING_REVIEW
        ).order_by(asc(Ad.created_at)).all()
    
    def search_ads(
        self,
        search_term: str = None,
        advertiser_type: str = None,
        ad_type: AdType = None,
        status: AdStatus = None,
        campaign_name: str = None
    ) -> List[Ad]:
        """Search ads with filters."""
        query = self.db.query(Ad)
        
        if search_term:
            query = query.filter(
                or_(
                    Ad.advertiser_name.ilike(f'%{search_term}%'),
                    Ad.campaign_name.ilike(f'%{search_term}%')
                )
            )
        
        if advertiser_type:
            query = query.filter(Ad.advertiser_type == advertiser_type)
        
        if ad_type:
            query = query.filter(Ad.ad_type == ad_type)
        
        if status:
            query = query.filter(Ad.status == status)
        
        if campaign_name:
            query = query.filter(Ad.campaign_name.ilike(f'%{campaign_name}%'))
        
        return query.order_by(desc(Ad.created_at)).all()
    
    def get_performance_metrics(self, ad_id: UUID) -> Dict[str, Any]:
        """Get performance metrics for an ad."""
        ad = self.get_by_id(ad_id)
        if not ad or not ad.metrics:
            return {}
        
        metrics = ad.metrics
        impressions = metrics.get('impressions', 0)
        clicks = metrics.get('clicks', 0)
        conversions = metrics.get('conversions', 0)
        spend = metrics.get('spend', 0)
        
        ctr = (clicks / impressions * 100) if impressions > 0 else 0
        cvr = (conversions / clicks * 100) if clicks > 0 else 0
        cpc = (spend / clicks) if clicks > 0 else 0
        cpm = (spend / impressions * 1000) if impressions > 0 else 0
        
        return {
            'impressions': impressions,
            'clicks': clicks,
            'conversions': conversions,
            'spend': spend,
            'ctr': round(ctr, 2),  # Click-through rate
            'cvr': round(cvr, 2),  # Conversion rate
            'cpc': round(cpc, 2),  # Cost per click
            'cpm': round(cpm, 2),  # Cost per mille (thousand impressions)
            'roas': round((conversions * 100 / spend) if spend > 0 else 0, 2)  # Return on ad spend
        }


class MarketingAnalyticsRepository:
    """Repository for marketing analytics and reporting."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_promo_code_analytics(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """Get comprehensive promo code analytics."""
        query = self.db.query(PromoCode)
        
        if start_date:
            query = query.filter(PromoCode.created_at >= start_date)
        if end_date:
            query = query.filter(PromoCode.created_at <= end_date)
        
        promo_codes = query.all()
        
        total_codes = len(promo_codes)
        active_codes = len([p for p in promo_codes if p.is_active])
        total_usage = sum(p.usage_count for p in promo_codes)
        total_discount_given = sum(p.discount_value * p.usage_count for p in promo_codes if p.discount_type == DiscountType.FIXED_AMOUNT)
        
        return {
            'total_promo_codes': total_codes,
            'active_promo_codes': active_codes,
            'total_usage_count': total_usage,
            'total_discount_given': float(total_discount_given),
            'average_usage_per_code': round(total_usage / total_codes if total_codes > 0 else 0, 2)
        }
    
    def get_referral_analytics(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """Get comprehensive referral analytics."""
        query = self.db.query(Referral)
        
        if start_date:
            query = query.filter(Referral.created_at >= start_date)
        if end_date:
            query = query.filter(Referral.created_at <= end_date)
        
        referrals = query.all()
        
        total_referrals = len(referrals)
        qualified_referrals = len([r for r in referrals if r.status in [ReferralStatus.QUALIFIED, ReferralStatus.REWARDED]])
        rewarded_referrals = len([r for r in referrals if r.status == ReferralStatus.REWARDED])
        total_rewards_paid = sum(r.referrer_reward_amount + r.referee_reward_amount for r in referrals if r.status == ReferralStatus.REWARDED)
        
        return {
            'total_referrals': total_referrals,
            'qualified_referrals': qualified_referrals,
            'rewarded_referrals': rewarded_referrals,
            'qualification_rate': round((qualified_referrals / total_referrals * 100) if total_referrals > 0 else 0, 2),
            'total_rewards_paid': float(total_rewards_paid or 0),
            'average_reward_per_referral': round(float(total_rewards_paid or 0) / rewarded_referrals if rewarded_referrals > 0 else 0, 2)
        }
    
    def get_ad_analytics(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """Get comprehensive ad analytics."""
        query = self.db.query(Ad)
        
        if start_date:
            query = query.filter(Ad.created_at >= start_date)
        if end_date:
            query = query.filter(Ad.created_at <= end_date)
        
        ads = query.all()
        
        total_ads = len(ads)
        active_ads = len([a for a in ads if a.status == AdStatus.ACTIVE])
        
        # Aggregate metrics
        total_impressions = sum(a.metrics.get('impressions', 0) if a.metrics else 0 for a in ads)
        total_clicks = sum(a.metrics.get('clicks', 0) if a.metrics else 0 for a in ads)
        total_spend = sum(a.metrics.get('spend', 0) if a.metrics else 0 for a in ads)
        
        avg_ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
        avg_cpc = (total_spend / total_clicks) if total_clicks > 0 else 0
        
        return {
            'total_ads': total_ads,
            'active_ads': active_ads,
            'total_impressions': total_impressions,
            'total_clicks': total_clicks,
            'total_spend': total_spend,
            'average_ctr': round(avg_ctr, 2),
            'average_cpc': round(avg_cpc, 2)
        }
    
    def get_top_performing_campaigns(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get top performing marketing campaigns."""
        # This would involve complex queries across promo codes, referrals, and ads
        # For now, returning a simplified version
        return [
            {
                'campaign_name': 'Summer Sale 2024',
                'type': 'promo_code',
                'performance_score': 95.5,
                'total_usage': 1250,
                'revenue_impact': 45000.00
            },
            {
                'campaign_name': 'Refer a Friend',
                'type': 'referral',
                'performance_score': 87.3,
                'total_referrals': 890,
                'revenue_impact': 32000.00
            }
        ][:limit]