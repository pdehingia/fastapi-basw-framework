"""Analytics and reports schemas."""

from datetime import datetime, date
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class ReportPeriod(str, Enum):
    TODAY = "today"
    YESTERDAY = "yesterday"
    THIS_WEEK = "this_week"
    LAST_WEEK = "last_week"
    THIS_MONTH = "this_month"
    LAST_MONTH = "last_month"
    LAST_3_MONTHS = "last_3_months"
    LAST_6_MONTHS = "last_6_months"
    THIS_YEAR = "this_year"
    CUSTOM = "custom"


class ReportFormat(str, Enum):
    JSON = "json"
    EXCEL = "excel"
    PDF = "pdf"
    CSV = "csv"


class ChartType(str, Enum):
    LINE = "line"
    BAR = "bar"
    PIE = "pie"
    AREA = "area"
    DOUGHNUT = "doughnut"


# Request Schemas
class AnalyticsFilters(BaseModel):
    period: ReportPeriod = Field(default=ReportPeriod.THIS_MONTH)
    start_date: Optional[date] = Field(None, description="Required for custom period")
    end_date: Optional[date] = Field(None, description="Required for custom period")
    user_type: Optional[str] = Field(None, description="Filter by user type: customer, artist, academy")
    service_type: Optional[str] = Field(None, description="Filter by service type")
    city: Optional[str] = Field(None, description="Filter by city")
    include_test_data: bool = Field(default=False, description="Include test/demo data")


class ReportGenerationRequest(BaseModel):
    report_type: str = Field(..., description="Type of report to generate")
    filters: AnalyticsFilters = Field(default_factory=AnalyticsFilters)
    format: ReportFormat = Field(default=ReportFormat.JSON)
    include_charts: bool = Field(default=True, description="Include charts in report")
    email_to: Optional[str] = Field(None, description="Email address to send report")


# Response Schemas
class MetricValue(BaseModel):
    current: float
    previous: float
    change_percentage: float
    trend: str  # "up", "down", "stable"


class ChartDataPoint(BaseModel):
    label: str
    value: float
    metadata: Optional[Dict[str, Any]] = None


class ChartData(BaseModel):
    type: ChartType
    title: str
    labels: List[str]
    datasets: List[Dict[str, Any]]
    options: Optional[Dict[str, Any]] = None


class DashboardStats(BaseModel):
    total_users: MetricValue
    active_users: MetricValue
    total_bookings: MetricValue
    total_revenue: MetricValue
    platform_growth: MetricValue
    customer_satisfaction: MetricValue


class UserAnalytics(BaseModel):
    total_registered: int
    active_users: int
    new_registrations: int
    user_retention_rate: float
    user_types_breakdown: Dict[str, int]
    top_cities: List[Dict[str, Any]]
    registration_trend: List[ChartDataPoint]
    activity_heatmap: List[Dict[str, Any]]


class BookingAnalytics(BaseModel):
    total_bookings: int
    successful_bookings: int
    cancelled_bookings: int
    average_booking_value: float
    booking_success_rate: float
    popular_services: List[Dict[str, Any]]
    booking_trends: List[ChartDataPoint]
    seasonal_patterns: List[Dict[str, Any]]
    cancellation_reasons: Dict[str, int]


class FinancialAnalytics(BaseModel):
    total_revenue: float
    platform_commission: float
    artist_earnings: float
    pending_payouts: float
    refunds_processed: float
    payment_methods_breakdown: Dict[str, float]
    revenue_trends: List[ChartDataPoint]
    commission_analytics: Dict[str, Any]
    financial_health_score: float


class PlatformPerformance(BaseModel):
    total_api_calls: int
    average_response_time: float
    error_rate: float
    uptime_percentage: float
    peak_usage_hours: List[int]
    system_alerts: int
    performance_trends: List[ChartDataPoint]
    resource_utilization: Dict[str, float]


class ComprehensiveReport(BaseModel):
    id: str
    title: str
    period: str
    generated_at: datetime
    generated_by: str
    summary: Dict[str, Any]
    dashboard_stats: DashboardStats
    user_analytics: UserAnalytics
    booking_analytics: BookingAnalytics
    financial_analytics: FinancialAnalytics
    platform_performance: PlatformPerformance
    charts: List[ChartData]
    recommendations: List[str]
    export_urls: Dict[str, str]


class CustomReportConfig(BaseModel):
    name: str
    description: str
    metrics: List[str]
    filters: AnalyticsFilters
    chart_configs: List[Dict[str, Any]]
    schedule: Optional[Dict[str, Any]] = None
    recipients: Optional[List[str]] = None


# List Response Schemas
class AnalyticsOverviewResponse(BaseModel):
    dashboard_stats: DashboardStats
    quick_metrics: Dict[str, MetricValue]
    recent_trends: List[ChartData]
    alerts: List[Dict[str, Any]]
    period_comparison: Dict[str, Any]


class CustomReportListResponse(BaseModel):
    reports: List[Dict[str, Any]]
    saved_configurations: List[CustomReportConfig]
    recent_exports: List[Dict[str, Any]]
    pagination: Dict[str, Any]