"""PPC campaign model."""

from datetime import datetime, date
from decimal import Decimal
from sqlalchemy import (
    Column, String, Date, DateTime, Numeric, BigInteger, Integer,
    ForeignKey, Index, CheckConstraint
)
from sqlalchemy.dialects.postgresql import UUID, JSONB

from .base import Base


class PPCCampaign(Base):
    """PPC (Pay-Per-Click) campaign model for academy course marketing."""
    
    __tablename__ = "ppc_campaigns"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default="uuid_generate_v4()")
    academy_id = Column(UUID(as_uuid=True), ForeignKey('academies.id'), nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey('courses.id'), nullable=True)
    campaign_name = Column(String(255), nullable=False)
    platform = Column(String(50), nullable=False)  # 'google', 'facebook', 'instagram', etc.
    campaign_type = Column(String(50), nullable=False)  # 'search', 'display', 'video', etc.
    budget_type = Column(String(20), nullable=False)  # 'daily', 'monthly'
    budget_amount = Column(Numeric(10, 2), nullable=False)
    target_keywords = Column(JSONB, nullable=True)
    target_demographics = Column(JSONB, nullable=True)
    target_locations = Column(JSONB, nullable=True)
    campaign_status = Column(String(30), nullable=False, default='draft')  # 'draft', 'active', 'paused', 'completed'
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    impressions = Column(BigInteger, default=0)
    clicks = Column(Integer, default=0)
    conversions = Column(Integer, default=0)
    cost = Column(Numeric(12, 2), default=Decimal('0.00'))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index('idx_ppc_campaigns_academy', 'academy_id'),
        Index('idx_ppc_campaigns_status', 'campaign_status'),
        CheckConstraint('budget_amount > 0', name='ck_ppc_budget_positive'),
        CheckConstraint('impressions >= 0', name='ck_ppc_impressions_positive'),
        CheckConstraint('clicks >= 0', name='ck_ppc_clicks_positive'),
        CheckConstraint('conversions >= 0', name='ck_ppc_conversions_positive'),
        CheckConstraint('cost >= 0', name='ck_ppc_cost_positive'),
    )

    def __repr__(self):
        return f"<PPCCampaign(id={self.id}, name={self.campaign_name}, platform={self.platform})>"
