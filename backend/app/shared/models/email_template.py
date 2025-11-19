"""Email Template Model for marketing campaigns."""
from sqlalchemy import (
    Column, String, Integer, ForeignKey, Boolean, TIMESTAMP, Text, func, text
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.shared.database import Base


class EmailTemplate(Base):
    """Email Template model for marketing campaigns."""
    
    __tablename__ = "email_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    template_name = Column(String(255), nullable=False)
    template_category = Column(String(100), nullable=False)
    subject_template = Column(String(255), nullable=False)
    html_content = Column(Text, nullable=False)
    text_content = Column(Text, nullable=True)
    template_variables = Column(JSONB, nullable=True)
    is_active = Column(Boolean, nullable=False, server_default="true")
    is_system_template = Column(Boolean, nullable=False, server_default="false")
    usage_count = Column(Integer, server_default="0", nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("admin_users.id"), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    campaigns = relationship("EmailCampaign", back_populates="template")
    creator = relationship("AdminUser", foreign_keys=[created_by])
