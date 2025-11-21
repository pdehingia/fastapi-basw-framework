"""
Provider Business and Salon Ownership Models
"""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import Column, String, Text, Date, Boolean, Integer, ForeignKey, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID, JSONB, NUMERIC
from sqlalchemy.orm import relationship

from app.shared.models.base import Base


class ProviderBusinessDetail(Base):
    """
    Extended business details for provider users.
    Additional business information beyond basic provider profile.
    """
    
    __tablename__ = "provider_business_details"
    
    provider_user_id = Column(
        PostgresUUID(as_uuid=True),
        ForeignKey('provider_users.id', ondelete='CASCADE'),
        primary_key=True,
        nullable=False
    )
    
    # Business information
    business_description = Column(Text, nullable=True)
    business_website = Column(String(255), nullable=True)
    business_social_media = Column(JSONB, nullable=True)  # {"instagram": "@...", "facebook": "..."}
    
    # Approval workflow
    is_approved = Column(Boolean, default=False, nullable=False)
    approval_date = Column(TIMESTAMP(timezone=True), nullable=True)
    approved_by = Column(PostgresUUID(as_uuid=True), ForeignKey('admin_users.id', ondelete='SET NULL'), nullable=True)
    
    # Service capabilities
    service_categories = Column(JSONB, nullable=True)  # ['hair', 'nails', 'makeup']
    service_areas = Column(JSONB, nullable=True)  # Geographic areas served
    business_settings = Column(JSONB, nullable=True)  # Provider preferences and settings
    
    # Financial and performance
    commission_rate = Column(NUMERIC(precision=5, scale=2), default=Decimal("15.00"), nullable=True)
    rating = Column(NUMERIC(precision=3, scale=2), default=Decimal("0.00"), nullable=True)
    total_bookings = Column(Integer, default=0, nullable=True)
    total_revenue = Column(NUMERIC(precision=15, scale=2), default=Decimal("0.00"), nullable=True)
    is_featured = Column(Boolean, default=False, nullable=False)
    
    # Activity and status
    last_business_activity = Column(TIMESTAMP(timezone=True), nullable=True)
    suspension_reason = Column(Text, nullable=True)
    suspended_until = Column(TIMESTAMP(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<ProviderBusinessDetail(provider_id={self.provider_user_id}, approved={self.is_approved})>"


class ProviderSalon(Base):
    """
    Junction table for provider-salon ownership relationships.
    Tracks provider ownership and management of salons.
    """
    
    __tablename__ = "provider_salons"
    
    provider_user_id = Column(
        PostgresUUID(as_uuid=True),
        ForeignKey('provider_users.id', ondelete='CASCADE'),
        primary_key=True,
        nullable=False
    )
    salon_id = Column(
        PostgresUUID(as_uuid=True),
        ForeignKey('salons.id', ondelete='CASCADE'),
        primary_key=True,
        nullable=False
    )
    
    # Ownership details
    ownership_type = Column(String(50), nullable=False)  # 'owner', 'manager', 'partner'
    ownership_percentage = Column(NUMERIC(precision=5, scale=2), nullable=True)  # For partnerships
    joined_date = Column(Date, nullable=False)
    left_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    permissions = Column(JSONB, nullable=True)  # What they can manage
    
    def __repr__(self):
        return f"<ProviderSalon(provider_id={self.provider_user_id}, salon_id={self.salon_id}, type={self.ownership_type})>"
