"""Admission inquiry model."""

from datetime import datetime, date
from sqlalchemy import (
    Column, String, Integer, Date, DateTime, Text, Boolean,
    ForeignKey, Index, CheckConstraint
)
from sqlalchemy.dialects.postgresql import UUID

from .base import Base


class AdmissionInquiry(Base):
    """Admission inquiry model for academy course enrollment inquiries."""
    
    __tablename__ = "admission_inquiries"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default="uuid_generate_v4()")
    academy_id = Column(UUID(as_uuid=True), ForeignKey('academies.id'), nullable=True)
    course_id = Column(UUID(as_uuid=True), ForeignKey('courses.id'), nullable=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    age = Column(Integer, nullable=True)
    education_level = Column(String(100), nullable=True)
    previous_experience = Column(Text, nullable=True)
    inquiry_source = Column(String(50), nullable=True)  # 'website', 'phone', 'walk-in', 'referral'
    inquiry_status = Column(String(30), nullable=False, default='new')  # 'new', 'contacted', 'interested', 'enrolled', 'lost'
    follow_up_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    conversion_probability = Column(Integer, nullable=True)  # 1-10 scale
    assigned_to = Column(UUID(as_uuid=True), ForeignKey('admin_users.id'), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index('idx_admission_inquiries_academy', 'academy_id'),
        Index('idx_admission_inquiries_status', 'inquiry_status'),
        CheckConstraint('conversion_probability >= 1 AND conversion_probability <= 10', name='ck_inquiry_probability_range'),
        CheckConstraint('age > 0', name='ck_inquiry_age_positive'),
    )

    def __repr__(self):
        return f"<AdmissionInquiry(id={self.id}, name={self.full_name}, status={self.inquiry_status})>"
