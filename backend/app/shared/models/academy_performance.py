"""
Academy Performance Model

Tracks KPI and performance metrics for individual academies
"""

from sqlalchemy import Column, String, Integer, Float, Date, UUID, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.shared.models.base import Base
import uuid
from datetime import datetime


class AcademyPerformance(Base):
    """Academy-specific performance and KPI tracking"""
    
    __tablename__ = "academy_performance"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    academy_id = Column(UUID(as_uuid=True), ForeignKey("academies.id"), nullable=False, index=True)
    metric_date = Column(Date, nullable=False, index=True)
    
    # Student metrics
    total_students = Column(Integer, default=0, nullable=False)
    new_enrollments = Column(Integer, default=0, nullable=False)
    active_students = Column(Integer, default=0, nullable=False)
    completed_courses = Column(Integer, default=0, nullable=False)
    dropout_count = Column(Integer, default=0, nullable=False)
    dropout_rate = Column(Float, default=0.0, nullable=False)  # Percentage
    
    # Course metrics
    total_courses_offered = Column(Integer, default=0, nullable=False)
    active_courses = Column(Integer, default=0, nullable=False)
    avg_course_completion_rate = Column(Float, default=0.0, nullable=False)  # Percentage
    avg_course_rating = Column(Float, default=0.0, nullable=False)  # 0-5
    
    # Financial metrics
    total_revenue = Column(Float, default=0.0, nullable=False)
    course_revenue = Column(Float, default=0.0, nullable=False)
    commission_earned = Column(Float, default=0.0, nullable=False)
    avg_revenue_per_student = Column(Float, default=0.0, nullable=False)
    outstanding_payments = Column(Float, default=0.0, nullable=False)
    
    # Engagement metrics
    avg_student_attendance_rate = Column(Float, default=0.0, nullable=False)  # Percentage
    avg_session_hours = Column(Float, default=0.0, nullable=False)
    student_satisfaction_score = Column(Float, default=0.0, nullable=False)  # 0-10
    
    # Instructor metrics
    total_instructors = Column(Integer, default=0, nullable=False)
    active_instructors = Column(Integer, default=0, nullable=False)
    avg_instructor_rating = Column(Float, default=0.0, nullable=False)  # 0-5
    
    # Marketing metrics
    leads_generated = Column(Integer, default=0, nullable=False)
    conversion_rate = Column(Float, default=0.0, nullable=False)  # Percentage
    website_visits = Column(Integer, default=0, nullable=False)
    
    # Growth indicators
    month_over_month_growth = Column(Float, default=0.0, nullable=False)  # Percentage
    year_over_year_growth = Column(Float, default=0.0, nullable=False)  # Percentage
    
    # Rankings and scores
    quality_score = Column(Float, default=0.0, nullable=False)  # 0-100
    performance_rank = Column(Integer, nullable=True)  # Rank among all academies
    
    # Additional data
    performance_metadata = Column(JSONB, nullable=True)  # Additional metrics
    calculated_at = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    
    # Tracking
    created_at = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    academy = relationship("Academy", backref="performance_metrics")

    def __repr__(self):
        return f"<AcademyPerformance(academy_id={self.academy_id}, date={self.metric_date})>"
