"""SMS Campaign Model for marketing campaigns."""
from sqlalchemy import (
    Column, String, Integer, ForeignKey, TIMESTAMP, func, text
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.shared.models.base import Base


class SMSCampaign(Base):
    """SMS Campaign model for marketing campaigns."""
    
    __tablename__ = "sms_campaigns"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    campaign_name = Column(String(255), nullable=False)
    campaign_type = Column(String(50), nullable=False)  # promotional, reminder, notification
    message_content = Column(String(1600), nullable=False)  # SMS length limit
    target_audience = Column(String(50), nullable=False)  # all_users, academies, artists, customers
    segment_criteria = Column(JSONB, nullable=True)
    campaign_status = Column(String(30), nullable=False, server_default="draft")
    scheduled_at = Column(TIMESTAMP(timezone=True), nullable=True)
    sent_at = Column(TIMESTAMP(timezone=True), nullable=True)
    total_recipients = Column(Integer, server_default="0", nullable=True)
    total_sent = Column(Integer, server_default="0", nullable=True)
    total_delivered = Column(Integer, server_default="0", nullable=True)
    total_failed = Column(Integer, server_default="0", nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("admin_users.id"), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    creator = relationship("AdminUser", foreign_keys=[created_by])
