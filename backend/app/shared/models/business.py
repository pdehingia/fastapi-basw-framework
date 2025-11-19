"""Business models for salons, academies and related entities."""

from datetime import datetime, date
from decimal import Decimal
from typing import Optional, Dict, Any
from uuid import UUID

from sqlalchemy import Column, String, Boolean, Integer, DateTime, Date, DECIMAL, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID, JSONB
from sqlalchemy.orm import relationship

from app.shared.models.base import BaseModel


class Salon(BaseModel):
    """
    Salon business entity.
    Independent salons where providers can work.
    """
    
    __tablename__ = "salons"
    
    salon_name = Column(String(255), nullable=False)
    salon_slug = Column(String(255), nullable=False, unique=True)
    address_id = Column(PostgresUUID(as_uuid=True), ForeignKey('addresses.id'), nullable=True)
    commission_rate = Column(DECIMAL(precision=5, scale=2), default=15.00, nullable=True)
    
    # Status fields
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    # Business operations
    business_hours = Column(JSONB, nullable=True)  # JSON structure for hours
    
    # Relationships
    # address = relationship("Address", back_populates="salons")
    # salon_providers = relationship("SalonProvider", back_populates="salon")
    
    def __repr__(self):
        return f"<Salon(id={self.id}, name={self.salon_name}, verified={self.is_verified})>"


class Academy(BaseModel):
    """
    Academy business entity.
    Educational institutions linked to provider users.
    """
    
    __tablename__ = "academies"
    
    provider_user_id = Column(PostgresUUID(as_uuid=True), ForeignKey('provider_users.id'), nullable=True, unique=True)
    academy_name = Column(String(255), nullable=False)
    gst_number = Column(String(20), nullable=True)
    registration_number = Column(String(100), nullable=True)
    address_id = Column(PostgresUUID(as_uuid=True), ForeignKey('addresses.id'), nullable=True)
    commission_rate = Column(DECIMAL(precision=5, scale=2), default=5.00, nullable=True)
    
    # Status fields
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    # Academy branding and settings
    branding = Column(JSONB, nullable=True)  # Logo, colors, etc.
    
    # Relationships
    # provider_user = relationship("ProviderUser", back_populates="academy")
    # address = relationship("Address", back_populates="academies")
    # academy_courses = relationship("AcademyCourse", back_populates="academy")
    
    def __repr__(self):
        return f"<Academy(id={self.id}, name={self.academy_name}, verified={self.is_verified})>"


class SalonProvider(BaseModel):
    """
    Junction table for salon-provider relationships.
    Tracks provider employment at salons.
    """
    
    __tablename__ = "salon_providers"
    
    salon_id = Column(PostgresUUID(as_uuid=True), ForeignKey('salons.id', ondelete='CASCADE'), nullable=False)
    provider_user_id = Column(PostgresUUID(as_uuid=True), ForeignKey('provider_users.id', ondelete='CASCADE'), nullable=False)
    
    # Employment details
    employment_type = Column(String(20), nullable=False)  # 'full_time', 'part_time', 'freelance'
    joined_date = Column(Date, nullable=False)
    left_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Performance metrics
    total_bookings = Column(Integer, default=0)
    total_revenue = Column(DECIMAL(precision=12, scale=2), default=0)
    
    # Relationships
    # salon = relationship("Salon", back_populates="salon_providers")
    # provider_user = relationship("ProviderUser", back_populates="salon_providers")
    
    def __repr__(self):
        return f"<SalonProvider(salon_id={self.salon_id}, provider_id={self.provider_user_id}, active={self.is_active})>"


class Service(BaseModel):
    """
    Service definitions available in the platform.
    Master catalog of beauty services.
    """
    
    __tablename__ = "services"
    
    service_name = Column(String(200), nullable=False, unique=True)
    service_slug = Column(String(200), nullable=False, unique=True)
    category = Column(String(60), nullable=False)
    description = Column(Text, nullable=True)
    
    # Pricing guidance
    suggested_price_min = Column(DECIMAL(precision=10, scale=2), nullable=True)
    suggested_price_max = Column(DECIMAL(precision=10, scale=2), nullable=True)
    default_duration_minutes = Column(Integer, nullable=True)
    
    # Media and metadata
    image_url = Column(Text, nullable=True)
    service_metadata = Column("metadata", JSONB, nullable=True)  # Map to 'metadata' column but use different attribute name
    
    # Status and display
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    display_order = Column(Integer, nullable=True)
    
    def __repr__(self):
        return f"<Service(id={self.id}, name={self.service_name}, category={self.category})>"


class Course(BaseModel):
    """
    Course definitions for academies.
    Master catalog of educational courses.
    """
    
    __tablename__ = "courses"
    
    course_name = Column(String(255), nullable=False)
    course_slug = Column(String(255), nullable=False, unique=True)
    course_code = Column(String(60), nullable=True, unique=True)
    category = Column(String(100), nullable=False)
    level = Column(String(50), nullable=False)  # 'beginner', 'intermediate', 'advanced'
    
    # Course content
    short_description = Column(Text, nullable=True)
    full_description = Column(Text, nullable=True)
    duration_months = Column(Integer, nullable=False)
    total_hours = Column(Integer, nullable=True)
    syllabus = Column(JSONB, nullable=True)  # Course outline and modules
    
    # Pricing guidance
    suggested_fees_min = Column(DECIMAL(precision=10, scale=2), nullable=True)
    suggested_fees_max = Column(DECIMAL(precision=10, scale=2), nullable=True)
    
    # Media
    image_url = Column(Text, nullable=True)
    brochure_url = Column(Text, nullable=True)
    
    # Status and display
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    
    def __repr__(self):
        return f"<Course(id={self.id}, name={self.course_name}, category={self.category})>"


class AcademyCourse(BaseModel):
    """
    Junction table for academy-course relationships.
    Tracks which courses are offered by which academies.
    """
    
    __tablename__ = "academy_courses"
    
    academy_id = Column(PostgresUUID(as_uuid=True), ForeignKey('academies.id', ondelete='CASCADE'), nullable=False)
    course_id = Column(PostgresUUID(as_uuid=True), ForeignKey('courses.id', ondelete='CASCADE'), nullable=False)
    
    # Academy-specific course details
    actual_fees = Column(DECIMAL(precision=10, scale=2), nullable=True)
    actual_duration_months = Column(Integer, nullable=True)
    batch_size_limit = Column(Integer, nullable=True)
    is_available = Column(Boolean, default=True)
    
    # Schedule information
    schedule_info = Column(JSONB, nullable=True)  # Class timings, days, etc.
    
    # Relationships
    # academy = relationship("Academy", back_populates="academy_courses")
    # course = relationship("Course", back_populates="academy_courses")
    
    def __repr__(self):
        return f"<AcademyCourse(academy_id={self.academy_id}, course_id={self.course_id})>"


class AcademyStudent(BaseModel):
    """
    Academy students - Link table between academies and artists.
    Tracks student enrollment, progress, and graduation status.
    """
    
    __tablename__ = "academy_students"
    
    academy_id = Column(PostgresUUID(as_uuid=True), ForeignKey('academies.id', ondelete='CASCADE'), nullable=False)
    artist_user_id = Column(PostgresUUID(as_uuid=True), ForeignKey('provider_users.id', ondelete='CASCADE'), nullable=False)
    course_id = Column(PostgresUUID(as_uuid=True), ForeignKey('courses.id'), nullable=True)
    
    # Course enrollment details
    course_name = Column(String(255), nullable=False)
    enrollment_date = Column(Date, nullable=False)
    graduation_date = Column(Date, nullable=True)
    
    # Registration and invitation status
    maya_registration_status = Column(String(30), nullable=False, default='pending')  # pending, invited, registered, active, graduated, dropped_out, suspended
    invitation_sent = Column(Boolean, nullable=False, default=False)
    invitation_sent_at = Column(DateTime, nullable=True)
    
    # Media
    student_photo_url = Column(Text, nullable=True)
    certificate_url = Column(Text, nullable=True)
    
    # Relationships
    academy = relationship("Academy", backref="students")
    artist = relationship("ProviderUser", backref="academy_enrollments")
    course = relationship("Course", backref="enrolled_students")
    
    def __repr__(self):
        return f"<AcademyStudent(id={self.id}, academy_id={self.academy_id}, artist_id={self.artist_user_id}, status={self.maya_registration_status})>"