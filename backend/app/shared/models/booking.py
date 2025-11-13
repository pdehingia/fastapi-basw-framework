"""
Super Admin Panel models for bookings, reviews, and related entities.
"""

from datetime import datetime
from enum import Enum
from typing import Optional, Dict, Any
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, DECIMAL, JSON, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship

from app.shared.models.base import BaseModel


class BookingStatus(str, Enum):
    """Booking status enumeration."""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    DISPUTED = "disputed"


class PaymentStatus(str, Enum):
    """Payment status enumeration."""
    PENDING = "pending"
    PAID = "paid"
    REFUNDED = "refunded"
    PARTIAL_REFUND = "partial_refund"


class CancelledBy(str, Enum):
    """Cancelled by enumeration."""
    CUSTOMER = "customer"
    PROVIDER = "provider"
    ADMIN = "admin"


class Booking(BaseModel):
    """Booking model for platform bookings."""
    
    __tablename__ = "bookings"
    
    booking_number = Column(String(20), unique=True, nullable=False, index=True)
    customer_user_id = Column(Integer, nullable=False, index=True)
    provider_user_id = Column(Integer, nullable=False, index=True)
    service_type = Column(String(100), nullable=False, index=True)
    occasion_type = Column(String(100), nullable=False, index=True)
    booking_date = Column(DateTime(timezone=True), nullable=False)
    event_date = Column(DateTime(timezone=True), nullable=False, index=True)
    event_duration_hours = Column(Integer, nullable=False)
    venue_name = Column(String(255), nullable=True)
    venue_address = Column(Text, nullable=True)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False)
    
    # Status
    status = Column(SQLEnum(BookingStatus), default=BookingStatus.PENDING, nullable=False, index=True)
    cancellation_reason = Column(Text, nullable=True)
    cancelled_by = Column(SQLEnum(CancelledBy), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    
    # Pricing
    base_price = Column(DECIMAL(10, 2), nullable=False)
    platform_fee = Column(DECIMAL(10, 2), nullable=False)
    taxes = Column(DECIMAL(10, 2), default=0)
    discount_amount = Column(DECIMAL(10, 2), default=0)
    promo_code = Column(String(50), nullable=True)
    total_amount = Column(DECIMAL(10, 2), nullable=False)
    academy_commission = Column(DECIMAL(10, 2), default=0)
    academy_commission_rate = Column(DECIMAL(5, 2), default=0)
    
    # Payment
    payment_status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    payment_method = Column(String(50), nullable=True)
    transaction_id = Column(String(100), nullable=True)
    refund_amount = Column(DECIMAL(10, 2), default=0)
    refund_reason = Column(Text, nullable=True)
    
    # Additional details
    special_requests = Column(Text, nullable=True)
    guest_count = Column(Integer, nullable=True)
    contact_phone = Column(String(15), nullable=False)
    contact_email = Column(String(255), nullable=False)


class ModerationStatus(str, Enum):
    """Review moderation status enumeration."""
    PENDING = "pending"
    APPROVED = "approved"
    FLAGGED = "flagged"
    REMOVED = "removed"


class Review(BaseModel):
    """Review model for booking reviews."""
    
    __tablename__ = "reviews"
    
    booking_id = Column(Integer, ForeignKey('bookings.id'), nullable=False, index=True)
    customer_user_id = Column(Integer, nullable=False, index=True)
    provider_user_id = Column(Integer, nullable=False, index=True)
    rating = Column(Integer, nullable=False, index=True)  # 1-5
    review_text = Column(Text, nullable=True)
    review_images = Column(JSON, nullable=True)
    service_rating = Column(Integer, nullable=True)
    communication_rating = Column(Integer, nullable=True)
    value_rating = Column(Integer, nullable=True)
    
    # Moderation
    moderation_status = Column(SQLEnum(ModerationStatus), default=ModerationStatus.PENDING, nullable=False, index=True)
    moderated_by = Column(Integer, nullable=True)  # admin user ID
    moderated_at = Column(DateTime(timezone=True), nullable=True)
    moderation_notes = Column(Text, nullable=True)
    flag_reason = Column(String(255), nullable=True)
    helpful_count = Column(Integer, default=0)
    report_count = Column(Integer, default=0)
    
    # Provider response
    provider_response = Column(Text, nullable=True)
    provider_response_at = Column(DateTime(timezone=True), nullable=True)
    is_verified = Column(Boolean, default=False)


class UserTypeEnum(str, Enum):
    """User type enumeration."""
    CUSTOMER = "customer"
    PROVIDER = "provider"
    ADMIN = "admin"


class TicketPriority(str, Enum):
    """Ticket priority enumeration."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TicketStatus(str, Enum):
    """Ticket status enumeration."""
    NEW = "new"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    WAITING_CUSTOMER = "waiting_customer"
    RESOLVED = "resolved"
    CLOSED = "closed"


class SupportTicket(BaseModel):
    """Support ticket model."""
    
    __tablename__ = "support_tickets"
    
    ticket_number = Column(String(20), unique=True, nullable=False, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    user_type = Column(String(20), nullable=False)  # 'customer', 'provider', 'admin'
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    issue_type = Column(String(50), nullable=False, index=True)
    priority = Column(String(20), server_default='medium', nullable=False)  # 'low', 'medium', 'high', 'critical'
    status = Column(String(30), server_default='new', nullable=False)  # 'new', 'assigned', 'in_progress', 'waiting_customer', 'resolved', 'closed'
    assigned_to = Column(Integer, nullable=True, index=True)
    booking_id = Column(Integer, ForeignKey('bookings.id'), nullable=True, index=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    first_response_at = Column(DateTime(timezone=True), nullable=True)
    resolution_summary = Column(Text, nullable=True)
    customer_satisfaction_rating = Column(Integer, nullable=True)
    tags = Column(JSON, nullable=True)
    extra_data = Column('metadata', JSON, nullable=True)  # Map to metadata column


class SenderType(str, Enum):
    """Message sender type enumeration."""
    CUSTOMER = "customer"
    PROVIDER = "provider"
    ADMIN = "admin"


class SupportTicketMessage(BaseModel):
    """Support ticket message model."""
    
    __tablename__ = "support_ticket_messages"
    
    ticket_id = Column(Integer, ForeignKey('support_tickets.id', ondelete='CASCADE'), nullable=False, index=True)
    sender_id = Column(Integer, nullable=False, index=True)
    sender_type = Column(String(20), nullable=False)  # 'customer', 'provider', 'admin'
    message = Column(Text, nullable=False)
    message_type = Column(String(20), server_default='message', nullable=False)  # 'message', 'note', 'system'
    attachments = Column(JSON, nullable=True)
    is_internal = Column(Boolean, default=False, nullable=False)
    edited_at = Column(DateTime(timezone=True), nullable=True)
    extra_data = Column('metadata', JSON, nullable=True)  # Map to metadata column


class CannedResponse(BaseModel):
    """Canned response model for support."""
    
    __tablename__ = "canned_responses"
    
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(100), nullable=False, index=True)
    tags = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, nullable=False)


class WalletUserType(str, Enum):
    """Wallet user type enumeration."""
    CUSTOMER = "customer"
    PROVIDER = "provider"
    ADMIN = "admin"


class Wallet(BaseModel):
    """Wallet model for user wallets."""
    
    __tablename__ = "wallets"
    
    user_id = Column(Integer, nullable=False, index=True)
    user_type = Column(SQLEnum(WalletUserType), nullable=False)
    balance = Column(DECIMAL(10, 2), default=0, nullable=False)
    pending_balance = Column(DECIMAL(10, 2), default=0)
    lifetime_earnings = Column(DECIMAL(10, 2), default=0)
    total_withdrawn = Column(DECIMAL(10, 2), default=0)
    currency = Column(String(3), default='INR', nullable=False)
    is_active = Column(Boolean, default=True)


class TransactionType(str, Enum):
    """Transaction type enumeration."""
    CREDIT = "credit"
    DEBIT = "debit"


class TransactionStatus(str, Enum):
    """Transaction status enumeration."""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class Transaction(BaseModel):
    """Transaction model."""
    
    __tablename__ = "transactions"
    
    transaction_id = Column(String(100), unique=True, nullable=False, index=True)
    wallet_id = Column(Integer, ForeignKey('wallets.id'), nullable=False, index=True)
    booking_id = Column(Integer, ForeignKey('bookings.id'), nullable=True, index=True)
    transaction_type = Column(SQLEnum(TransactionType), nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
    description = Column(Text, nullable=False)
    reference_type = Column(String(50), nullable=False)
    reference_id = Column(String(100), nullable=True)
    gateway_transaction_id = Column(String(100), nullable=True)
    status = Column(SQLEnum(TransactionStatus), default=TransactionStatus.PENDING, nullable=False, index=True)
    processed_at = Column(DateTime(timezone=True), nullable=True)


class DiscountType(str, Enum):
    """Discount type enumeration."""
    PERCENTAGE = "percentage"
    FIXED_AMOUNT = "fixed_amount"


class PromoCode(BaseModel):
    """Promo code model."""
    
    __tablename__ = "promo_codes"
    
    code = Column(String(50), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    discount_type = Column(SQLEnum(DiscountType), nullable=False)
    discount_value = Column(DECIMAL(10, 2), nullable=False)
    min_order_amount = Column(DECIMAL(10, 2), nullable=True)
    max_discount_amount = Column(DECIMAL(10, 2), nullable=True)
    usage_limit = Column(Integer, nullable=True)
    usage_count = Column(Integer, default=0)
    user_usage_limit = Column(Integer, nullable=True)
    valid_from = Column(DateTime(timezone=True), nullable=False)
    valid_until = Column(DateTime(timezone=True), nullable=False)
    applicable_cities = Column(JSON, nullable=True)
    applicable_services = Column(JSON, nullable=True)
    applicable_user_types = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, nullable=False)