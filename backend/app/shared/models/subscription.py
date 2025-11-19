"""Subscription and payment models."""

import uuid
import enum
from datetime import datetime, date
from sqlalchemy import Column, String, Numeric, Date, Boolean, Integer, Text, ForeignKey, UniqueConstraint, Index, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB, ENUM
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.shared.models.base import Base


class SubscriptionPlanEnum(str, enum.Enum):
    """Subscription plan types."""
    PREMIUM = "premium"
    ELITE = "elite"


class SubscriptionStatusEnum(str, enum.Enum):
    """Subscription status."""
    ACTIVE = "active"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    PAUSED = "paused"
    PAYMENT_FAILED = "payment_failed"


class TransactionStatusEnum(str, enum.Enum):
    """Transaction status."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class Subscription(Base):
    """Subscription model for provider premium plans."""
    
    __tablename__ = "subscriptions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.uuid_generate_v4())
    provider_user_id = Column(UUID(as_uuid=True), ForeignKey("provider_users.id"), nullable=False, unique=True)
    
    # Plan details
    plan_type = Column(SQLEnum(SubscriptionPlanEnum, name="subscription_plan"), nullable=False)
    plan_name = Column(String(100), nullable=False)
    plan_price = Column(Numeric(10, 2), nullable=False)
    billing_cycle = Column(String(20), nullable=False)  # monthly, yearly
    commission_rate = Column(Numeric(5, 2), nullable=False)
    features = Column(JSONB, nullable=False)
    
    # Subscription dates
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    current_period_start = Column(Date, nullable=False)
    current_period_end = Column(Date, nullable=False)
    
    # Payment gateway
    razorpay_subscription_id = Column(String(255), unique=True, nullable=True)
    
    # Status and renewal
    status = Column(
        ENUM('active', 'cancelled', 'expired', 'paused', 'payment_failed', name='subscription_status'),
        server_default='active',
        nullable=False
    )
    auto_renew = Column(Boolean, server_default='true', nullable=True)
    cancel_at_period_end = Column(Boolean, server_default='false', nullable=True)
    cancelled_at = Column(Date, nullable=True)
    payment_failed_count = Column(Integer, server_default='0', nullable=True)
    
    # Timestamps
    created_at = Column(Date, server_default=func.now(), nullable=True)
    updated_at = Column(Date, server_default=func.now(), onupdate=func.now(), nullable=True)
    
    # Indexes
    __table_args__ = (
        Index('idx_subscriptions_provider', 'provider_user_id'),
        Index('idx_subscriptions_status', 'status', 'end_date'),
        Index('idx_subscriptions_billing', 'current_period_end', 'status'),
    )


class SubscriptionPayment(Base):
    """Subscription payment records."""
    
    __tablename__ = "subscription_payments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.uuid_generate_v4())
    subscription_id = Column(UUID(as_uuid=True), ForeignKey("subscriptions.id"), nullable=False)
    provider_user_id = Column(UUID(as_uuid=True), ForeignKey("provider_users.id"), nullable=False)
    
    # Payment details
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), server_default='INR', nullable=False)
    razorpay_payment_id = Column(String(255), nullable=True)
    razorpay_order_id = Column(String(255), nullable=True)
    
    # Billing period
    billing_period_start = Column(Date, nullable=False)
    billing_period_end = Column(Date, nullable=False)
    
    # Status
    status = Column(
        ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', name='transaction_status'),
        server_default='pending',
        nullable=False
    )
    failure_reason = Column(Text, nullable=True)
    retry_attempt = Column(Integer, server_default='0', nullable=True)
    
    # Relationships
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id"), nullable=True)
    
    # Timestamps
    payment_date = Column(Date, server_default=func.now(), nullable=True)
    created_at = Column(Date, server_default=func.now(), nullable=True)
    
    # Indexes
    __table_args__ = (
        Index('idx_sub_payments_subscription', 'subscription_id', 'payment_date'),
        Index('idx_sub_payments_provider', 'provider_user_id', 'payment_date'),
        Index('idx_sub_payments_status', 'status', 'payment_date'),
    )
