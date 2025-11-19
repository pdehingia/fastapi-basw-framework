"""Subscription Management service."""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, extract
from datetime import datetime, date, timedelta
from decimal import Decimal

from app.shared.models.subscription import Subscription, SubscriptionPayment, SubscriptionStatusEnum, TransactionStatusEnum
from app.shared.models.user import ProviderUser
from app.shared.exceptions import NotFoundError, ValidationException, ConflictError
from app.shared.pagination import PaginationParams
from .schemas import (
    SubscriptionCreate, SubscriptionUpdate, SubscriptionResponse, SubscriptionDetailResponse,
    SubscriptionPaymentCreate, SubscriptionPaymentResponse,
    SubscriptionCancel, SubscriptionRenew, SubscriptionRetryPayment,
    SubscriptionFilterParams, PaymentFilterParams,
    SubscriptionListResponse, PaymentListResponse,
    SubscriptionStatistics, PaymentStatistics, ExpiringSubscription, ExpiringSubscriptionsResponse
)


class SubscriptionManagementService:
    """Service for managing subscriptions and payments."""
    
    def __init__(self, db: Session):
        self.db = db
    
    # ===== SUBSCRIPTION CRUD =====
    
    def create_subscription(self, subscription_data: SubscriptionCreate) -> SubscriptionResponse:
        """Create a new subscription."""
        # Check if provider exists
        provider = self.db.query(ProviderUser).filter(
            ProviderUser.id == subscription_data.provider_user_id
        ).first()
        
        if not provider:
            raise NotFoundError(f"Provider with ID {subscription_data.provider_user_id} not found")
        
        # Check if provider already has active subscription
        existing = self.db.query(Subscription).filter(
            Subscription.provider_user_id == subscription_data.provider_user_id,
            Subscription.status.in_(['active', 'paused'])
        ).first()
        
        if existing:
            raise ConflictError(f"Provider already has an active subscription (ID: {existing.id})")
        
        # Create subscription
        subscription_dict = subscription_data.model_dump()
        subscription_dict['current_period_start'] = subscription_data.start_date
        subscription_dict['current_period_end'] = subscription_data.end_date
        subscription_dict['status'] = 'active'
        
        db_subscription = Subscription(**subscription_dict)
        self.db.add(db_subscription)
        self.db.commit()
        self.db.refresh(db_subscription)
        
        return SubscriptionResponse.model_validate(db_subscription)
    
    def get_subscription_by_id(self, subscription_id: str) -> SubscriptionDetailResponse:
        """Get subscription by ID with provider details."""
        subscription = self.db.query(Subscription).filter(Subscription.id == subscription_id).first()
        if not subscription:
            raise NotFoundError(f"Subscription with ID {subscription_id} not found")
        
        # Get provider details
        provider = self.db.query(ProviderUser).filter(
            ProviderUser.id == subscription.provider_user_id
        ).first()
        
        # Calculate days remaining
        days_remaining = (subscription.end_date - date.today()).days
        is_expiring_soon = 0 < days_remaining <= 30
        
        subscription_dict = SubscriptionResponse.model_validate(subscription).model_dump()
        subscription_dict['provider_name'] = provider.full_name if provider else None
        subscription_dict['provider_email'] = provider.email if provider else None
        subscription_dict['provider_phone'] = provider.phone_number if provider else None
        subscription_dict['days_remaining'] = days_remaining
        subscription_dict['is_expiring_soon'] = is_expiring_soon
        
        return SubscriptionDetailResponse(**subscription_dict)
    
    def get_subscriptions_list(
        self,
        filters: SubscriptionFilterParams,
        pagination: PaginationParams
    ) -> SubscriptionListResponse:
        """Get paginated list of subscriptions with filters."""
        query = self.db.query(Subscription)
        
        # Apply filters
        if filters.plan_type:
            query = query.filter(Subscription.plan_type == filters.plan_type.value)
        
        if filters.status:
            query = query.filter(Subscription.status == filters.status.value)
        
        if filters.auto_renew is not None:
            query = query.filter(Subscription.auto_renew == filters.auto_renew)
        
        if filters.provider_user_id:
            query = query.filter(Subscription.provider_user_id == filters.provider_user_id)
        
        if filters.start_date_from:
            query = query.filter(Subscription.start_date >= filters.start_date_from)
        
        if filters.start_date_to:
            query = query.filter(Subscription.start_date <= filters.start_date_to)
        
        if filters.end_date_from:
            query = query.filter(Subscription.end_date >= filters.end_date_from)
        
        if filters.end_date_to:
            query = query.filter(Subscription.end_date <= filters.end_date_to)
        
        if filters.expiring_in_days:
            expiry_threshold = date.today() + timedelta(days=filters.expiring_in_days)
            query = query.filter(
                and_(
                    Subscription.end_date <= expiry_threshold,
                    Subscription.end_date >= date.today(),
                    Subscription.status == 'active'
                )
            )
        
        # Search in plan name or provider details
        if filters.search:
            search_filter = f"%{filters.search}%"
            provider_subquery = self.db.query(ProviderUser.id).filter(
                or_(
                    ProviderUser.full_name.ilike(search_filter),
                    ProviderUser.email.ilike(search_filter)
                )
            ).subquery()
            
            query = query.filter(
                or_(
                    Subscription.plan_name.ilike(search_filter),
                    Subscription.provider_user_id.in_(provider_subquery)
                )
            )
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        subscriptions = query.offset(pagination.skip).limit(pagination.page_size).all()
        
        # Build detailed responses
        detailed_subscriptions = []
        for subscription in subscriptions:
            provider = self.db.query(ProviderUser).filter(
                ProviderUser.id == subscription.provider_user_id
            ).first()
            
            days_remaining = (subscription.end_date - date.today()).days
            is_expiring_soon = 0 < days_remaining <= 30
            
            sub_dict = SubscriptionResponse.model_validate(subscription).model_dump()
            sub_dict['provider_name'] = provider.full_name if provider else None
            sub_dict['provider_email'] = provider.email if provider else None
            sub_dict['provider_phone'] = provider.phone_number if provider else None
            sub_dict['days_remaining'] = days_remaining
            sub_dict['is_expiring_soon'] = is_expiring_soon
            
            detailed_subscriptions.append(SubscriptionDetailResponse(**sub_dict))
        
        total_pages = (total + pagination.page_size - 1) // pagination.page_size
        
        return SubscriptionListResponse(
            subscriptions=detailed_subscriptions,
            total=total,
            page=pagination.page,
            page_size=pagination.page_size,
            total_pages=total_pages
        )
    
    def update_subscription(self, subscription_id: str, subscription_data: SubscriptionUpdate) -> SubscriptionResponse:
        """Update subscription."""
        subscription = self.db.query(Subscription).filter(Subscription.id == subscription_id).first()
        if not subscription:
            raise NotFoundError(f"Subscription with ID {subscription_id} not found")
        
        # Update fields
        update_data = subscription_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if field == 'plan_type' and value:
                setattr(subscription, field, value.value)
            else:
                setattr(subscription, field, value)
        
        subscription.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(subscription)
        
        return SubscriptionResponse.model_validate(subscription)
    
    # ===== SUBSCRIPTION ACTIONS =====
    
    def cancel_subscription(self, subscription_id: str, cancel_data: SubscriptionCancel) -> SubscriptionResponse:
        """Cancel subscription."""
        subscription = self.db.query(Subscription).filter(Subscription.id == subscription_id).first()
        if not subscription:
            raise NotFoundError(f"Subscription with ID {subscription_id} not found")
        
        if subscription.status == 'cancelled':
            raise ValidationException("Subscription is already cancelled")
        
        if cancel_data.cancel_immediately:
            subscription.status = 'cancelled'
            subscription.cancelled_at = datetime.utcnow()
            subscription.cancel_at_period_end = False
            subscription.auto_renew = False
        else:
            subscription.cancel_at_period_end = True
            subscription.auto_renew = False
        
        subscription.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(subscription)
        
        return SubscriptionResponse.model_validate(subscription)
    
    def renew_subscription(self, subscription_id: str, renew_data: SubscriptionRenew) -> SubscriptionResponse:
        """Renew subscription."""
        subscription = self.db.query(Subscription).filter(Subscription.id == subscription_id).first()
        if not subscription:
            raise NotFoundError(f"Subscription with ID {subscription_id} not found")
        
        if renew_data.new_end_date <= subscription.end_date:
            raise ValidationException("New end date must be after current end date")
        
        # Update subscription
        subscription.end_date = renew_data.new_end_date
        subscription.current_period_end = renew_data.new_end_date
        subscription.status = 'active'
        subscription.cancel_at_period_end = False
        subscription.cancelled_at = None
        subscription.payment_failed_count = 0
        subscription.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(subscription)
        
        return SubscriptionResponse.model_validate(subscription)
    
    def get_provider_subscription(self, provider_id: str) -> SubscriptionDetailResponse:
        """Get active subscription for provider."""
        subscription = self.db.query(Subscription).filter(
            Subscription.provider_user_id == provider_id,
            Subscription.status.in_(['active', 'paused'])
        ).first()
        
        if not subscription:
            raise NotFoundError(f"No active subscription found for provider {provider_id}")
        
        return self.get_subscription_by_id(str(subscription.id))
    
    # ===== PAYMENT MANAGEMENT =====
    
    def create_subscription_payment(self, payment_data: SubscriptionPaymentCreate) -> SubscriptionPaymentResponse:
        """Create a subscription payment record."""
        # Verify subscription exists
        subscription = self.db.query(Subscription).filter(
            Subscription.id == payment_data.subscription_id
        ).first()
        
        if not subscription:
            raise NotFoundError(f"Subscription with ID {payment_data.subscription_id} not found")
        
        # Create payment
        db_payment = SubscriptionPayment(**payment_data.model_dump())
        self.db.add(db_payment)
        self.db.commit()
        self.db.refresh(db_payment)
        
        return SubscriptionPaymentResponse.model_validate(db_payment)
    
    def get_subscription_payments(
        self,
        subscription_id: str,
        pagination: PaginationParams
    ) -> PaymentListResponse:
        """Get payment history for subscription."""
        query = self.db.query(SubscriptionPayment).filter(
            SubscriptionPayment.subscription_id == subscription_id
        ).order_by(SubscriptionPayment.payment_date.desc())
        
        total = query.count()
        payments = query.offset(pagination.skip).limit(pagination.page_size).all()
        
        total_pages = (total + pagination.page_size - 1) // pagination.page_size
        
        return PaymentListResponse(
            payments=[SubscriptionPaymentResponse.model_validate(p) for p in payments],
            total=total,
            page=pagination.page,
            page_size=pagination.page_size,
            total_pages=total_pages
        )
    
    def retry_failed_payment(
        self,
        payment_id: str,
        retry_data: SubscriptionRetryPayment
    ) -> SubscriptionPaymentResponse:
        """Retry a failed payment."""
        payment = self.db.query(SubscriptionPayment).filter(
            SubscriptionPayment.id == payment_id
        ).first()
        
        if not payment:
            raise NotFoundError(f"Payment with ID {payment_id} not found")
        
        if payment.status != 'failed':
            raise ValidationException("Can only retry failed payments")
        
        # Update payment
        payment.status = 'processing'
        payment.retry_attempt += 1
        payment.failure_reason = None
        
        if retry_data.razorpay_payment_id:
            payment.razorpay_payment_id = retry_data.razorpay_payment_id
        
        if retry_data.razorpay_order_id:
            payment.razorpay_order_id = retry_data.razorpay_order_id
        
        self.db.commit()
        self.db.refresh(payment)
        
        return SubscriptionPaymentResponse.model_validate(payment)
    
    # ===== STATISTICS & REPORTS =====
    
    def get_subscription_statistics(self) -> SubscriptionStatistics:
        """Get subscription statistics."""
        total = self.db.query(Subscription).count()
        active = self.db.query(Subscription).filter(Subscription.status == 'active').count()
        cancelled = self.db.query(Subscription).filter(Subscription.status == 'cancelled').count()
        expired = self.db.query(Subscription).filter(Subscription.status == 'expired').count()
        paused = self.db.query(Subscription).filter(Subscription.status == 'paused').count()
        payment_failed = self.db.query(Subscription).filter(Subscription.status == 'payment_failed').count()
        
        # Subscriptions by plan
        plans = self.db.query(
            Subscription.plan_type, func.count(Subscription.id)
        ).group_by(Subscription.plan_type).all()
        
        subscriptions_by_plan = {plan: count for plan, count in plans}
        
        # Calculate MRR and ARR
        monthly_subs = self.db.query(func.sum(Subscription.plan_price)).filter(
            Subscription.status == 'active',
            Subscription.billing_cycle == 'monthly'
        ).scalar() or Decimal('0')
        
        yearly_subs = self.db.query(func.sum(Subscription.plan_price)).filter(
            Subscription.status == 'active',
            Subscription.billing_cycle == 'yearly'
        ).scalar() or Decimal('0')
        
        total_mrr = monthly_subs + (yearly_subs / 12)
        total_arr = total_mrr * 12
        
        avg_value = self.db.query(func.avg(Subscription.plan_price)).filter(
            Subscription.status == 'active'
        ).scalar() or Decimal('0')
        
        # Expiring subscriptions
        today = date.today()
        expiring_30 = self.db.query(Subscription).filter(
            Subscription.status == 'active',
            Subscription.end_date <= today + timedelta(days=30),
            Subscription.end_date > today
        ).count()
        
        expiring_7 = self.db.query(Subscription).filter(
            Subscription.status == 'active',
            Subscription.end_date <= today + timedelta(days=7),
            Subscription.end_date > today
        ).count()
        
        # Calculate churn and renewal rates (simplified)
        churn_rate = (cancelled / total * 100) if total > 0 else Decimal('0')
        renewal_rate = Decimal('100') - churn_rate
        
        return SubscriptionStatistics(
            total_subscriptions=total,
            active_subscriptions=active,
            cancelled_subscriptions=cancelled,
            expired_subscriptions=expired,
            paused_subscriptions=paused,
            payment_failed_subscriptions=payment_failed,
            subscriptions_by_plan=subscriptions_by_plan,
            total_mrr=total_mrr,
            total_arr=total_arr,
            avg_subscription_value=avg_value,
            churn_rate=churn_rate,
            renewal_rate=renewal_rate,
            subscriptions_expiring_30_days=expiring_30,
            subscriptions_expiring_7_days=expiring_7
        )
    
    def get_expiring_subscriptions(self, days: int = 30) -> ExpiringSubscriptionsResponse:
        """Get subscriptions expiring within specified days."""
        today = date.today()
        threshold_date = today + timedelta(days=days)
        
        subscriptions = self.db.query(Subscription).filter(
            Subscription.status == 'active',
            Subscription.end_date <= threshold_date,
            Subscription.end_date > today
        ).order_by(Subscription.end_date.asc()).all()
        
        expiring_list = []
        for subscription in subscriptions:
            provider = self.db.query(ProviderUser).filter(
                ProviderUser.id == subscription.provider_user_id
            ).first()
            
            days_remaining = (subscription.end_date - today).days
            
            expiring_list.append(ExpiringSubscription(
                subscription_id=str(subscription.id),
                provider_user_id=str(subscription.provider_user_id),
                provider_name=provider.full_name if provider else "Unknown",
                provider_email=provider.email if provider else "",
                provider_phone=provider.phone_number if provider else "",
                plan_name=subscription.plan_name,
                plan_type=subscription.plan_type,
                end_date=subscription.end_date,
                days_remaining=days_remaining,
                auto_renew=subscription.auto_renew,
                status=subscription.status
            ))
        
        return ExpiringSubscriptionsResponse(
            expiring_subscriptions=expiring_list,
            total=len(expiring_list),
            days_threshold=days
        )
    
    def get_payment_statistics(self) -> PaymentStatistics:
        """Get payment statistics."""
        total = self.db.query(SubscriptionPayment).count()
        successful = self.db.query(SubscriptionPayment).filter(
            SubscriptionPayment.status == 'completed'
        ).count()
        failed = self.db.query(SubscriptionPayment).filter(
            SubscriptionPayment.status == 'failed'
        ).count()
        pending = self.db.query(SubscriptionPayment).filter(
            SubscriptionPayment.status == 'pending'
        ).count()
        
        # Revenue calculations
        total_revenue = self.db.query(func.sum(SubscriptionPayment.amount)).filter(
            SubscriptionPayment.status == 'completed'
        ).scalar() or Decimal('0')
        
        avg_amount = self.db.query(func.avg(SubscriptionPayment.amount)).filter(
            SubscriptionPayment.status == 'completed'
        ).scalar() or Decimal('0')
        
        success_rate = (successful / total * 100) if total > 0 else Decimal('0')
        
        failed_amount = self.db.query(func.sum(SubscriptionPayment.amount)).filter(
            SubscriptionPayment.status == 'failed'
        ).scalar() or Decimal('0')
        
        # Payments by month (last 12 months)
        payments_by_month = {}
        for i in range(12):
            month_date = date.today().replace(day=1) - timedelta(days=30*i)
            month_key = month_date.strftime('%Y-%m')
            
            month_revenue = self.db.query(func.sum(SubscriptionPayment.amount)).filter(
                SubscriptionPayment.status == 'completed',
                extract('year', SubscriptionPayment.payment_date) == month_date.year,
                extract('month', SubscriptionPayment.payment_date) == month_date.month
            ).scalar() or Decimal('0')
            
            payments_by_month[month_key] = month_revenue
        
        return PaymentStatistics(
            total_payments=total,
            successful_payments=successful,
            failed_payments=failed,
            pending_payments=pending,
            total_revenue=total_revenue,
            avg_payment_amount=avg_amount,
            payment_success_rate=success_rate,
            total_failed_amount=failed_amount,
            payments_by_month=payments_by_month
        )
