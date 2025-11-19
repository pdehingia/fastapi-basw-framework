"""Academy Performance module schemas."""

from datetime import date, datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field


class AcademyPerformanceBase(BaseModel):
    """Base academy performance schema."""
    academy_id: UUID
    metric_date: date
    total_students: int = 0
    new_enrollments: int = 0
    active_students: int = 0
    total_revenue: float = 0.0
    avg_course_rating: float = 0.0
    student_satisfaction_score: float = 0.0


class AcademyPerformanceResponse(AcademyPerformanceBase):
    """Academy performance response schema."""
    id: UUID
    completed_courses: int
    dropout_rate: float
    avg_revenue_per_student: float
    quality_score: float
    performance_rank: Optional[int]
    calculated_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class AcademyPerformanceListResponse(BaseModel):
    """Paginated academy performance list."""
    items: List[AcademyPerformanceResponse]
    total: int
    page: int
    size: int
    pages: int


class AcademyPerformanceSummary(BaseModel):
    """Academy performance summary."""
    academy_id: UUID
    academy_name: str
    total_revenue: float
    total_students: int
    avg_rating: float
    performance_rank: Optional[int]
    quality_score: float


class AcademyPerformanceTrends(BaseModel):
    """Academy performance trends."""
    academy_id: UUID
    metric: str
    period: str
    data_points: List[dict]


class TopPerformerResponse(BaseModel):
    """Top performing academy."""
    academy_id: UUID
    academy_name: str
    total_revenue: float
    total_students: int
    quality_score: float
    performance_rank: int
