"""
Platform Analytics Model

Stores aggregated platform metrics for daily/monthly reporting
"""

from sqlalchemy import Column, String, Integer, Float, Date, UUID, TIMESTAMP, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import JSONB
from app.shared.models.base import Base
import uuid
from datetime import datetime
import enum


class MetricPeriod(str, enum.Enum):
    """Metric aggregation period"""
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"


class PlatformAnalytic(Base):
    """Platform-wide analytics metrics"""
    
    __tablename__ = "platform_analytics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    metric_date = Column(Date, nullable=False, index=True)
    period_type = Column(
        SQLEnum(MetricPeriod, name="metric_period_enum", create_type=False),
        default=MetricPeriod.DAILY,
        nullable=False
    )
    
    # User metrics
    total_users = Column(Integer, default=0, nullable=False)
    new_users = Column(Integer, default=0, nullable=False)
    active_users = Column(Integer, default=0, nullable=False)
    deleted_users = Column(Integer, default=0, nullable=False)
    
    # Booking metrics
    total_bookings = Column(Integer, default=0, nullable=False)
    completed_bookings = Column(Integer, default=0, nullable=False)
    cancelled_bookings = Column(Integer, default=0, nullable=False)
    booking_conversion_rate = Column(Float, default=0.0, nullable=False)  # Percentage
    
    # Financial metrics
    total_revenue = Column(Float, default=0.0, nullable=False)
    platform_commission = Column(Float, default=0.0, nullable=False)
    provider_earnings = Column(Float, default=0.0, nullable=False)
    avg_transaction_value = Column(Float, default=0.0, nullable=False)
    
    # Provider metrics
    active_providers = Column(Integer, default=0, nullable=False)
    new_providers = Column(Integer, default=0, nullable=False)
    verified_providers = Column(Integer, default=0, nullable=False)
    
    # Customer metrics
    active_customers = Column(Integer, default=0, nullable=False)
    new_customers = Column(Integer, default=0, nullable=False)
    returning_customers = Column(Integer, default=0, nullable=False)
    customer_retention_rate = Column(Float, default=0.0, nullable=False)  # Percentage
    
    # Engagement metrics
    avg_session_duration_minutes = Column(Float, default=0.0, nullable=False)
    total_sessions = Column(Integer, default=0, nullable=False)
    bounce_rate = Column(Float, default=0.0, nullable=False)  # Percentage
    
    # Support metrics
    support_tickets_opened = Column(Integer, default=0, nullable=False)
    support_tickets_resolved = Column(Integer, default=0, nullable=False)
    avg_resolution_time_hours = Column(Float, default=0.0, nullable=False)
    
    # Additional data
    metadata = Column(JSONB, nullable=True)  # Additional metrics
    calculated_at = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    
    # Tracking
    created_at = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<PlatformAnalytic(date={self.metric_date}, period={self.period_type})>"
