"""
Refactored Models Example

Example showing how to refactor models to use the new constants system.
"""

from datetime import datetime, date, time
from enum import Enum
from typing import Optional, Dict, Any
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, DECIMAL, JSON, ForeignKey, Enum as SQLEnum, Date, Time, UUID
from sqlalchemy.orm import relationship

from app.shared.models.base import BaseModel

# REFACTORED: Import constants instead of defining inline
from app.shared.constants import (
    BOOKING_STATUS, 
    PAYMENT_STATUS,
    USER_ROLES,
    VERIFICATION_STATUS
)

# REMOVED: These enums are now replaced by constants
# class BookingStatus(str, Enum):
#     PENDING = "pending" 
#     CONFIRMED = "confirmed"
#     # etc...

# class PaymentStatus(str, Enum):
#     PENDING = "pending"
#     PAID = "paid"
#     # etc...

class BookingRefactored(BaseModel):
    """
    Refactored Booking model using constants.
    
    This demonstrates how to use the new constants system in models.
    """
    
    __tablename__ = "bookings_refactored_example"
    
    # Basic booking information
    booking_number = Column(String(50), unique=True, nullable=False, index=True)
    customer_user_id = Column(UUID, nullable=False, index=True)
    provider_user_id = Column(UUID, nullable=False, index=True)
    service_id = Column(UUID, nullable=False)
    service_name = Column(String(255), nullable=False)
    service_price = Column(DECIMAL(10, 2), nullable=False)
    service_duration_minutes = Column(Integer, nullable=False)
    
    # REFACTORED: Use constants for default values
    status = Column(
        String(20), 
        nullable=False, 
        default=BOOKING_STATUS.PENDING,  # Instead of "pending"
        index=True
    )
    
    payment_status = Column(
        String(20), 
        nullable=False, 
        default=PAYMENT_STATUS.PENDING,  # Instead of "pending"
        index=True
    )
    
    # Booking timing
    booking_date = Column(Date, nullable=False, index=True)
    booking_time = Column(Time, nullable=False)
    duration = Column(Integer, nullable=False)
    
    # Location and details
    salon_id = Column(UUID, nullable=False, index=True)
    salon_name = Column(String(255), nullable=False)
    salon_address = Column(Text, nullable=False)
    
    # Pricing and payment
    base_price = Column(DECIMAL(10, 2), nullable=False)
    tax_amount = Column(DECIMAL(10, 2), default=0)
    discount_amount = Column(DECIMAL(10, 2), default=0)
    total_amount = Column(DECIMAL(10, 2), nullable=False)
    
    # Cancellation tracking  
    cancelled_at = Column(DateTime, nullable=True)
    cancelled_by = Column(String(50), nullable=True)  # Could also use constants
    cancellation_reason = Column(Text, nullable=True)
    
    # Metadata
    booking_notes = Column(Text, nullable=True)
    special_requests = Column(Text, nullable=True)
    booking_source = Column(String(50), nullable=True)  # web, mobile, etc.
    
    # Reviews and ratings (after service completion)
    customer_rating = Column(Integer, nullable=True)  # 1-5 stars
    customer_review = Column(Text, nullable=True)
    provider_rating = Column(Integer, nullable=True)  # Provider rates customer
    provider_review = Column(Text, nullable=True)
    
    # Additional JSON fields for flexibility
    additional_data = Column(JSON, nullable=True)
    
    @property 
    def is_pending(self) -> bool:
        """Check if booking is pending."""
        # REFACTORED: Use constants for comparison
        return self.status == BOOKING_STATUS.PENDING
    
    @property
    def is_confirmed(self) -> bool:
        """Check if booking is confirmed."""
        return self.status == BOOKING_STATUS.CONFIRMED
    
    @property
    def is_completed(self) -> bool:
        """Check if booking is completed."""
        return self.status == BOOKING_STATUS.COMPLETED
    
    @property
    def is_cancelled(self) -> bool:
        """Check if booking is cancelled."""
        return self.status == BOOKING_STATUS.CANCELLED
    
    @property
    def payment_pending(self) -> bool:
        """Check if payment is pending."""
        return self.payment_status == PAYMENT_STATUS.PENDING
    
    @property
    def payment_completed(self) -> bool:
        """Check if payment is completed."""
        return self.payment_status == PAYMENT_STATUS.COMPLETED
    
    def can_be_cancelled(self) -> bool:
        """
        Check if booking can be cancelled.
        
        REFACTORED: Use constants instead of hardcoded strings.
        """
        cancellable_statuses = [
            BOOKING_STATUS.PENDING, 
            BOOKING_STATUS.CONFIRMED
        ]
        return self.status in cancellable_statuses
    
    def can_be_rescheduled(self) -> bool:
        """Check if booking can be rescheduled."""
        reschedulable_statuses = [
            BOOKING_STATUS.PENDING,
            BOOKING_STATUS.CONFIRMED
        ]
        return self.status in reschedulable_statuses


class UserRefactored(BaseModel):
    """
    Refactored User model example showing role constants usage.
    """
    
    __tablename__ = "users_refactored_example"
    
    # Basic user information
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), nullable=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    
    # REFACTORED: Use constants for roles and status
    role = Column(
        String(50), 
        nullable=False, 
        default=USER_ROLES.CUSTOMER,  # Instead of "customer"
        index=True
    )
    
    verification_status = Column(
        String(50),
        nullable=False,
        default=VERIFICATION_STATUS.PENDING,  # Instead of "pending"
        index=True
    )
    
    # User status and flags
    is_active = Column(Boolean, default=True, index=True)
    is_verified = Column(Boolean, default=False)
    
    def is_admin(self) -> bool:
        """Check if user is admin."""
        # REFACTORED: Use constants
        admin_roles = [
            USER_ROLES.SUPER_ADMIN,
            USER_ROLES.ADMIN,
            USER_ROLES.MODERATOR
        ]
        return self.role in admin_roles
    
    def is_provider(self) -> bool:
        """Check if user is a service provider."""
        provider_roles = [
            USER_ROLES.PROVIDER,
            USER_ROLES.SALON_OWNER,
            USER_ROLES.SALON_MANAGER,
            USER_ROLES.SALON_STAFF
        ]
        return self.role in provider_roles
    
    def is_customer(self) -> bool:
        """Check if user is a customer."""
        customer_roles = [
            USER_ROLES.CUSTOMER,
            USER_ROLES.PREMIUM_CUSTOMER,
            USER_ROLES.VIP_CUSTOMER
        ]
        return self.role in customer_roles


"""
REFACTORING BENEFITS DEMONSTRATED:

1. SINGLE SOURCE OF TRUTH:
   - All status values defined in constants module
   - No duplicate enum definitions across models

2. CONSISTENCY:
   - Same status values used everywhere in the app
   - Guaranteed consistency across models and services

3. MAINTAINABILITY:
   - Change status value once in constants
   - Automatically updates everywhere it's used

4. TYPE SAFETY:
   - IDE provides autocompletion for constants
   - Catch typos at development time

5. DOCUMENTATION:
   - Clear imports show what constants are used
   - Constants module serves as documentation

MIGRATION CHECKLIST FOR EXISTING MODELS:
□ Replace enum definitions with constant imports
□ Update default values to use constants  
□ Update property methods to use constants
□ Update business logic methods to use constants
□ Test all model functionality after changes
"""