"""
Super Admin Panel models for bookings, reviews, and related entities.
"""

from datetime import datetime, date, time
from enum import Enum
from typing import Optional, Dict, Any
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, DECIMAL, JSON, ForeignKey, Enum as SQLEnum, Date, Time, UUID
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
    
    # Basic booking information matching actual database schema
    booking_number = Column(String(50), unique=True, nullable=False, index=True)
    customer_user_id = Column(UUID, nullable=False, index=True)
    provider_user_id = Column(UUID, nullable=False, index=True)
    service_id = Column(UUID, nullable=False)
    service_name = Column(String(255), nullable=False)
    service_price = Column(DECIMAL(10, 2), nullable=False)
    service_duration_minutes = Column(Integer, nullable=False)
    occasion_type = Column(String(50), nullable=False)
    
    # Booking timing
    booking_date = Column(Date, nullable=False)
    booking_start_time = Column(Time, nullable=False)
    booking_end_time = Column(Time, nullable=False)
    
    # Location
    location_type = Column(String(20), nullable=False)
    address_id = Column(UUID, nullable=False)
    
    # Additional details
    special_requests = Column(Text, nullable=True)
    
    # Status and timing
    status = Column(SQLEnum(BookingStatus), default=BookingStatus.PENDING, nullable=False, index=True)
    payment_status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    confirmed_at = Column(DateTime(timezone=True), nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    cancelled_by = Column(String(20), nullable=True)
    cancellation_reason = Column(Text, nullable=True)
    
    # Financial information
    subtotal = Column(DECIMAL(10, 2), nullable=False)
    discount_amount = Column(DECIMAL(10, 2), nullable=False, default=0)
    promo_code = Column(String(50), nullable=True)
    taxes = Column(DECIMAL(10, 2), nullable=False, default=0)
    total_amount = Column(DECIMAL(10, 2), nullable=False)
    
    # Commission and payouts
    platform_commission_rate = Column(DECIMAL(5, 2), nullable=False, default=15.00)
    platform_commission = Column(DECIMAL(10, 2), nullable=False)
    provider_payout = Column(DECIMAL(10, 2), nullable=False)
    academy_commission = Column(DECIMAL(10, 2), nullable=True)
    academy_commission_rate = Column(DECIMAL(5, 2), nullable=True)
    academy_commission_amount = Column(DECIMAL(10, 2), nullable=True)
    
    # Transaction information
    transaction_id = Column(UUID, nullable=True)
    payout_transaction_id = Column(UUID, nullable=True)
    
    # Additional features
    chat_pg_id = Column(UUID, nullable=True)
    reschedule_count = Column(Integer, default=0)
    original_booking_id = Column(UUID, nullable=True)
    
    # Academy features
    is_academy_student_booking = Column(Boolean, default=False)
    academy_student_id = Column(UUID, nullable=True)


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