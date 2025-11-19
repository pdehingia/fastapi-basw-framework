"""
Platform analytics schemas for admin domain.
Comprehensive analytics and reporting for platform insights.
"""

from typing import Optional, List, Dict, Any, Union
from datetime import datetime, date
from uuid import UUID
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, Field, ConfigDict

from app.shared.schemas.base import BaseSchema, BaseResponse


class MetricCategory(str, Enum):
    """Platform analytics metric categories."""
    USER = "user"
    BOOKING = "booking"
    REVENUE = "revenue"
    ENGAGEMENT = "engagement"
    PERFORMANCE = "performance"
    MARKETING = "marketing"
    ACADEMY = "academy"
    SALON = "salon"
    PROVIDER = "provider"


class AnalyticsTimeRange(str, Enum):
    """Time range options for analytics."""
    TODAY = "today"
    YESTERDAY = "yesterday"
    LAST_7_DAYS = "last_7_days"
    LAST_30_DAYS = "last_30_days"
    LAST_90_DAYS = "last_90_days"
    THIS_MONTH = "this_month"
    LAST_MONTH = "last_month"
    THIS_YEAR = "this_year"
    CUSTOM = "custom"


class AnalyticsGranularity(str, Enum):
    """Analytics data granularity."""
    HOURLY = "hourly"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"


# Platform analytics filtering and search schemas
class PlatformAnalyticsFilterParams(BaseSchema):
    """Parameters for filtering platform analytics."""
    
    metric_names: Optional[List[str]] = Field(None, description="Filter by metric names")
    metric_categories: Optional[List[MetricCategory]] = Field(None, description="Filter by metric categories")
    start_date: Optional[date] = Field(None, description="Filter from date")
    end_date: Optional[date] = Field(None, description="Filter to date")
    time_range: Optional[AnalyticsTimeRange] = Field(None, description="Predefined time range")
    granularity: Optional[AnalyticsGranularity] = Field(AnalyticsGranularity.DAILY, description="Data granularity")
    page: int = Field(1, ge=1)
    page_size: int = Field(100, ge=1, le=1000)
    sort_by: Optional[str] = Field("metric_date", pattern="^(metric_date|metric_value|metric_name|created_at)$")
    sort_order: Optional[str] = Field("desc", pattern="^(asc|desc)$")


# Platform analytics CRUD schemas
class PlatformAnalyticsCreate(BaseSchema):
    """Schema for creating platform analytics entries."""
    
    metric_name: str = Field(..., min_length=2, max_length=100, description="Metric name")
    metric_category: MetricCategory = Field(..., description="Metric category")
    metric_value: Decimal = Field(..., description="Metric value")
    metric_date: date = Field(..., description="Metric date")
    metric_hour: Optional[int] = Field(None, ge=0, le=23, description="Metric hour (0-23)")
    dimensions: Optional[Dict[str, Any]] = Field(None, description="Additional metric dimensions")


class PlatformAnalyticsUpdate(BaseSchema):
    """Schema for updating platform analytics entries."""
    
    metric_value: Optional[Decimal] = None
    dimensions: Optional[Dict[str, Any]] = None


class PlatformAnalyticsResponse(BaseSchema):
    """Schema for platform analytics responses."""
    
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    metric_name: str
    metric_category: MetricCategory
    metric_value: Decimal
    metric_date: date
    metric_hour: Optional[int]
    dimensions: Optional[Dict[str, Any]]
    created_at: datetime


# Academy performance schemas
class AcademyPerformanceFilterParams(BaseSchema):
    """Parameters for filtering academy performance data."""
    
    academy_ids: Optional[List[UUID]] = Field(None, description="Filter by academy IDs")
    start_date: Optional[date] = Field(None, description="Filter from date")
    end_date: Optional[date] = Field(None, description="Filter to date")
    time_range: Optional[AnalyticsTimeRange] = Field(None, description="Predefined time range")
    min_revenue: Optional[Decimal] = Field(None, ge=0, description="Minimum revenue filter")
    min_students: Optional[int] = Field(None, ge=0, description="Minimum students filter")
    page: int = Field(1, ge=1)
    page_size: int = Field(50, ge=1, le=200)
    sort_by: Optional[str] = Field("metric_date", pattern="^(metric_date|revenue_generated|total_students_enrolled|conversion_rate)$")
    sort_order: Optional[str] = Field("desc", pattern="^(asc|desc)$")


class AcademyPerformanceCreate(BaseSchema):
    """Schema for creating academy performance entries."""
    
    academy_id: UUID = Field(..., description="Academy ID")
    metric_date: date = Field(..., description="Performance date")
    total_students_enrolled: Optional[int] = Field(0, ge=0, description="Total enrolled students")
    new_enrollments: Optional[int] = Field(0, ge=0, description="New enrollments")
    graduated_students: Optional[int] = Field(0, ge=0, description="Graduated students")
    dropout_students: Optional[int] = Field(0, ge=0, description="Dropout students")
    revenue_generated: Optional[Decimal] = Field(Decimal('0'), ge=0, description="Revenue generated")
    maya_commission_earned: Optional[Decimal] = Field(Decimal('0'), ge=0, description="Maya commission")
    ppc_spend: Optional[Decimal] = Field(Decimal('0'), ge=0, description="PPC advertising spend")
    leads_generated: Optional[int] = Field(0, ge=0, description="Leads generated")
    leads_converted: Optional[int] = Field(0, ge=0, description="Leads converted")
    conversion_rate: Optional[Decimal] = Field(Decimal('0'), ge=0, le=100, description="Conversion rate percentage")


class AcademyPerformanceUpdate(BaseSchema):
    """Schema for updating academy performance entries."""
    
    total_students_enrolled: Optional[int] = Field(None, ge=0)
    new_enrollments: Optional[int] = Field(None, ge=0)
    graduated_students: Optional[int] = Field(None, ge=0)
    dropout_students: Optional[int] = Field(None, ge=0)
    revenue_generated: Optional[Decimal] = Field(None, ge=0)
    maya_commission_earned: Optional[Decimal] = Field(None, ge=0)
    ppc_spend: Optional[Decimal] = Field(None, ge=0)
    leads_generated: Optional[int] = Field(None, ge=0)
    leads_converted: Optional[int] = Field(None, ge=0)
    conversion_rate: Optional[Decimal] = Field(None, ge=0, le=100)


class AcademyPerformanceResponse(BaseSchema):
    """Schema for academy performance responses."""
    
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    academy_id: UUID
    metric_date: date
    total_students_enrolled: int
    new_enrollments: int
    graduated_students: int
    dropout_students: int
    revenue_generated: Decimal
    maya_commission_earned: Decimal
    ppc_spend: Decimal
    leads_generated: int
    leads_converted: int
    conversion_rate: Decimal
    created_at: datetime
    updated_at: datetime
    
    # Related data
    academy_name: Optional[str] = None


# Platform insights and dashboard schemas
class PlatformOverviewResponse(BaseSchema):
    """Platform overview dashboard response."""
    
    # User metrics
    total_users: int
    active_users: int
    new_users_today: int
    new_users_this_month: int
    user_growth_percentage: float
    
    # Business metrics
    total_academies: int
    active_academies: int
    total_salons: int
    active_salons: int
    total_providers: int
    verified_providers: int
    
    # Revenue metrics
    total_revenue: Decimal
    monthly_revenue: Decimal
    daily_revenue: Decimal
    commission_earned: Decimal
    revenue_growth_percentage: float
    
    # Engagement metrics
    total_bookings: int
    bookings_today: int
    bookings_this_month: int
    average_booking_value: Decimal
    booking_completion_rate: float
    
    # Performance metrics
    platform_uptime: float
    average_response_time: float
    error_rate: float
    active_sessions: int


class UserAnalyticsResponse(BaseSchema):
    """User analytics response."""
    
    total_users: int
    active_users: int
    new_registrations: List[Dict[str, Union[str, int]]]  # Daily/monthly new users
    user_retention: List[Dict[str, Union[str, float]]]  # Retention rates
    user_demographics: Dict[str, List[Dict[str, Union[str, int]]]]  # Age, gender, location
    user_activity_trends: List[Dict[str, Union[str, int]]]  # Activity over time
    top_active_users: List[Dict[str, Any]]  # Most active users


class RevenueAnalyticsResponse(BaseSchema):
    """Revenue analytics response."""
    
    total_revenue: Decimal
    monthly_recurring_revenue: Decimal
    revenue_trends: List[Dict[str, Union[str, Decimal]]]  # Revenue over time
    revenue_by_category: List[Dict[str, Union[str, Decimal]]]  # Revenue breakdown
    commission_analytics: Dict[str, Decimal]  # Commission breakdown
    payment_method_distribution: List[Dict[str, Union[str, int, Decimal]]]
    top_revenue_generators: List[Dict[str, Any]]  # Top academies/providers


class EngagementAnalyticsResponse(BaseSchema):
    """Engagement analytics response."""
    
    daily_active_users: List[Dict[str, Union[str, int]]]
    session_duration: Dict[str, float]  # Average, median session duration
    page_views: List[Dict[str, Union[str, int]]]
    feature_usage: List[Dict[str, Union[str, int]]]  # Most used features
    user_journey_analytics: Dict[str, Any]  # User flow analysis
    bounce_rate: float
    conversion_funnel: List[Dict[str, Union[str, int, float]]]


class PerformanceAnalyticsResponse(BaseSchema):
    """Performance analytics response."""
    
    system_uptime: float
    response_times: Dict[str, float]  # Average response times by endpoint
    error_rates: List[Dict[str, Union[str, float]]]  # Error rates over time
    database_performance: Dict[str, float]  # Query performance metrics
    server_metrics: Dict[str, float]  # CPU, memory, disk usage
    api_usage_stats: List[Dict[str, Union[str, int]]]  # API endpoint usage


# Analytics export schemas
class AnalyticsExportFormat(str, Enum):
    """Export format options."""
    CSV = "csv"
    EXCEL = "excel"
    JSON = "json"
    PDF = "pdf"


class AnalyticsExportRequest(BaseSchema):
    """Request for analytics data export."""
    
    format: AnalyticsExportFormat = AnalyticsExportFormat.CSV
    metrics: Optional[List[str]] = Field(None, description="Specific metrics to export")
    categories: Optional[List[MetricCategory]] = Field(None, description="Metric categories to export")
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    time_range: Optional[AnalyticsTimeRange] = None
    granularity: Optional[AnalyticsGranularity] = AnalyticsGranularity.DAILY
    include_dimensions: bool = Field(True, description="Include metric dimensions")
    include_academy_performance: bool = Field(False, description="Include academy performance data")


# Custom reports schemas
class CustomReportRequest(BaseSchema):
    """Request for custom analytics report."""
    
    report_name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    metrics: List[str] = Field(..., min_items=1, description="Metrics to include")
    dimensions: Optional[List[str]] = Field(None, description="Dimensions for grouping")
    filters: Optional[Dict[str, Any]] = Field(None, description="Filter criteria")
    time_range: AnalyticsTimeRange
    granularity: AnalyticsGranularity
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    
    # Visualization options
    chart_type: Optional[str] = Field("line", pattern="^(line|bar|pie|area|scatter)$")
    include_trends: bool = Field(True, description="Include trend analysis")
    include_forecasting: bool = Field(False, description="Include forecasting")


class CustomReportResponse(BaseSchema):
    """Custom report response."""
    
    report_id: str
    report_name: str
    generated_at: datetime
    data: List[Dict[str, Any]]
    summary: Dict[str, Any]
    trends: Optional[Dict[str, Any]] = None
    forecasts: Optional[Dict[str, Any]] = None
    metadata: Dict[str, Any]


# Real-time analytics schemas
class RealTimeMetricsResponse(BaseSchema):
    """Real-time metrics response."""
    
    current_active_users: int
    current_sessions: int
    requests_per_minute: int
    bookings_today: int
    revenue_today: Decimal
    errors_last_hour: int
    server_status: Dict[str, str]
    last_updated: datetime


class AlertsResponse(BaseSchema):
    """Analytics alerts response."""
    
    active_alerts: List[Dict[str, Any]]
    resolved_alerts: List[Dict[str, Any]]
    alert_summary: Dict[str, int]