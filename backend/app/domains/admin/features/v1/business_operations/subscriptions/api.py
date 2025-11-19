"""Subscription Management API endpoints."""

from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.shared.models.user import AdminUser
from app.shared.pagination import PaginationParams
from app.shared.responses import SuccessResponse

from .schemas import (
    SubscriptionCreate, SubscriptionUpdate, SubscriptionResponse, SubscriptionDetailResponse,
    SubscriptionPaymentCreate, SubscriptionPaymentResponse,
    SubscriptionCancel, SubscriptionRenew, SubscriptionRetryPayment,
    SubscriptionFilterParams, SubscriptionListResponse, PaymentListResponse,
    SubscriptionStatistics, PaymentStatistics, ExpiringSubscriptionsResponse,
    SubscriptionPlan, SubscriptionStatus, PaymentStatus
)
from .service import SubscriptionManagementService
from .dependencies import require_subscription_management


router = APIRouter(prefix="/subscriptions", tags=["Subscription Management"])


# ===== SUBSCRIPTION CRUD ENDPOINTS =====

@router.post(
    "",
    response_model=SuccessResponse[SubscriptionResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create subscription",
    description="Create a new subscription for a provider"
)
async def create_subscription(
    subscription_data: SubscriptionCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_subscription_management)
):
    """Create a new subscription."""
    service = SubscriptionManagementService(db)
    subscription = service.create_subscription(subscription_data)
    
    return SuccessResponse(
        data=subscription,
        message="Subscription created successfully"
    )


@router.get(
    "",
    response_model=SuccessResponse[SubscriptionListResponse],
    summary="List all subscriptions",
    description="Get paginated list of all subscriptions with filters"
)
async def list_subscriptions(
    search: Optional[str] = Query(None, description="Search in plan name or provider details"),
    plan_type: Optional[SubscriptionPlan] = Query(None, description="Filter by plan type"),
    status_filter: Optional[SubscriptionStatus] = Query(None, alias="status", description="Filter by status"),
    auto_renew: Optional[bool] = Query(None, description="Filter by auto-renewal"),
    provider_user_id: Optional[str] = Query(None, description="Filter by provider"),
    expiring_in_days: Optional[int] = Query(None, ge=1, le=90, description="Expiring within days"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_subscription_management)
):
    """Get paginated list of subscriptions with filters."""
    service = SubscriptionManagementService(db)
    
    filters = SubscriptionFilterParams(
        search=search,
        plan_type=plan_type,
        status=status_filter,
        auto_renew=auto_renew,
        provider_user_id=provider_user_id,
        expiring_in_days=expiring_in_days
    )
    
    pagination = PaginationParams(page=page, page_size=page_size)
    
    result = service.get_subscriptions_list(filters, pagination)
    
    return SuccessResponse(
        data=result,
        message="Subscriptions retrieved successfully"
    )


@router.get(
    "/{subscription_id}",
    response_model=SuccessResponse[SubscriptionDetailResponse],
    summary="Get subscription details",
    description="Get detailed information about a specific subscription"
)
async def get_subscription_details(
    subscription_id: str,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_subscription_management)
):
    """Get subscription details."""
    service = SubscriptionManagementService(db)
    subscription = service.get_subscription_by_id(subscription_id)
    
    return SuccessResponse(
        data=subscription,
        message="Subscription details retrieved successfully"
    )


@router.put(
    "/{subscription_id}",
    response_model=SuccessResponse[SubscriptionResponse],
    summary="Update subscription",
    description="Update subscription details"
)
async def update_subscription(
    subscription_id: str,
    subscription_data: SubscriptionUpdate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_subscription_management)
):
    """Update subscription details."""
    service = SubscriptionManagementService(db)
    subscription = service.update_subscription(subscription_id, subscription_data)
    
    return SuccessResponse(
        data=subscription,
        message="Subscription updated successfully"
    )


# ===== SUBSCRIPTION ACTION ENDPOINTS =====

@router.post(
    "/{subscription_id}/cancel",
    response_model=SuccessResponse[SubscriptionResponse],
    summary="Cancel subscription",
    description="Cancel a subscription immediately or at period end"
)
async def cancel_subscription(
    subscription_id: str,
    cancel_data: SubscriptionCancel,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_subscription_management)
):
    """Cancel a subscription."""
    service = SubscriptionManagementService(db)
    subscription = service.cancel_subscription(subscription_id, cancel_data)
    
    return SuccessResponse(
        data=subscription,
        message="Subscription cancelled successfully"
    )


@router.post(
    "/{subscription_id}/renew",
    response_model=SuccessResponse[SubscriptionResponse],
    summary="Renew subscription",
    description="Manually renew a subscription"
)
async def renew_subscription(
    subscription_id: str,
    renew_data: SubscriptionRenew,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_subscription_management)
):
    """Renew a subscription."""
    service = SubscriptionManagementService(db)
    subscription = service.renew_subscription(subscription_id, renew_data)
    
    return SuccessResponse(
        data=subscription,
        message="Subscription renewed successfully"
    )


@router.get(
    "/provider/{provider_id}",
    response_model=SuccessResponse[SubscriptionDetailResponse],
    summary="Get provider subscription",
    description="Get active subscription for a specific provider"
)
async def get_provider_subscription(
    provider_id: str,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_subscription_management)
):
    """Get provider's active subscription."""
    service = SubscriptionManagementService(db)
    subscription = service.get_provider_subscription(provider_id)
    
    return SuccessResponse(
        data=subscription,
        message="Provider subscription retrieved successfully"
    )


# ===== PAYMENT ENDPOINTS =====

@router.get(
    "/{subscription_id}/payments",
    response_model=SuccessResponse[PaymentListResponse],
    summary="Get subscription payment history",
    description="Get paginated payment history for a subscription"
)
async def get_subscription_payments(
    subscription_id: str,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_subscription_management)
):
    """Get subscription payment history."""
    service = SubscriptionManagementService(db)
    pagination = PaginationParams(page=page, page_size=page_size)
    
    result = service.get_subscription_payments(subscription_id, pagination)
    
    return SuccessResponse(
        data=result,
        message="Payment history retrieved successfully"
    )


@router.post(
    "/payments",
    response_model=SuccessResponse[SubscriptionPaymentResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create subscription payment",
    description="Record a manual subscription payment"
)
async def create_subscription_payment(
    payment_data: SubscriptionPaymentCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_subscription_management)
):
    """Create a subscription payment record."""
    service = SubscriptionManagementService(db)
    payment = service.create_subscription_payment(payment_data)
    
    return SuccessResponse(
        data=payment,
        message="Payment recorded successfully"
    )


@router.post(
    "/payments/{payment_id}/retry",
    response_model=SuccessResponse[SubscriptionPaymentResponse],
    summary="Retry failed payment",
    description="Retry a failed subscription payment"
)
async def retry_failed_payment(
    payment_id: str,
    retry_data: SubscriptionRetryPayment,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_subscription_management)
):
    """Retry a failed payment."""
    service = SubscriptionManagementService(db)
    payment = service.retry_failed_payment(payment_id, retry_data)
    
    return SuccessResponse(
        data=payment,
        message="Payment retry initiated successfully"
    )


# ===== STATISTICS & REPORTS ENDPOINTS =====

@router.get(
    "/statistics/overview",
    response_model=SuccessResponse[SubscriptionStatistics],
    summary="Get subscription statistics",
    description="Get comprehensive subscription analytics and metrics"
)
async def get_subscription_statistics(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_subscription_management)
):
    """Get subscription statistics."""
    service = SubscriptionManagementService(db)
    stats = service.get_subscription_statistics()
    
    return SuccessResponse(
        data=stats,
        message="Subscription statistics retrieved successfully"
    )


@router.get(
    "/expiring",
    response_model=SuccessResponse[ExpiringSubscriptionsResponse],
    summary="Get expiring subscriptions",
    description="Get subscriptions expiring within specified days"
)
async def get_expiring_subscriptions(
    days: int = Query(30, ge=1, le=90, description="Days threshold"),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_subscription_management)
):
    """Get subscriptions expiring soon."""
    service = SubscriptionManagementService(db)
    result = service.get_expiring_subscriptions(days)
    
    return SuccessResponse(
        data=result,
        message=f"Expiring subscriptions retrieved (within {days} days)"
    )


@router.get(
    "/statistics/payments",
    response_model=SuccessResponse[PaymentStatistics],
    summary="Get payment statistics",
    description="Get payment analytics and revenue metrics"
)
async def get_payment_statistics(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_subscription_management)
):
    """Get payment statistics."""
    service = SubscriptionManagementService(db)
    stats = service.get_payment_statistics()
    
    return SuccessResponse(
        data=stats,
        message="Payment statistics retrieved successfully"
    )
