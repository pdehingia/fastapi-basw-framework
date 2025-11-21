"""Analytics and reports API endpoints."""

from typing import Annotated, Optional
from datetime import date
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse

from app.shared.constants import API_TAGS
from app.shared.responses import SuccessResponse
from app.shared.pagination import PaginationParams
from .dependencies import get_analytics_service
from .service import AnalyticsReportsService
from .schemas import (
    AnalyticsFilters, ReportGenerationRequest, AnalyticsOverviewResponse,
    UserAnalytics, BookingAnalytics, FinancialAnalytics, PlatformPerformance,
    ComprehensiveReport, CustomReportListResponse, ReportPeriod
)

router = APIRouter(prefix="", tags=[API_TAGS.ANALYTICS_REPORTS])


@router.get("/overview", response_model=SuccessResponse[AnalyticsOverviewResponse])
async def get_analytics_overview(
    service: Annotated[AnalyticsReportsService, Depends(get_analytics_service)],
    period: ReportPeriod = Query(default=ReportPeriod.THIS_MONTH, description="Report period"),
    start_date: Optional[date] = Query(None, description="Start date for custom period"),
    end_date: Optional[date] = Query(None, description="End date for custom period"),
    user_type: Optional[str] = Query(None, description="Filter by user type"),
    service_type: Optional[str] = Query(None, description="Filter by service type"),
    city: Optional[str] = Query(None, description="Filter by city"),
    include_test_data: bool = Query(False, description="Include test/demo data")
):
    """
    Get comprehensive analytics overview for admin dashboard.
    
    **Required Permission:** admin.analytics.view
    
    **Features:**
    - Real-time dashboard statistics with trend indicators
    - Quick metrics comparison with previous period
    - Interactive charts for key performance indicators
    - System alerts and notifications
    - Period-over-period comparison analysis
    
    **Metrics Included:**
    - Total users (active/inactive breakdown)
    - Revenue metrics with growth trends
    - Booking statistics and conversion rates
    - Platform performance indicators
    - Customer satisfaction scores
    - Growth rate calculations
    
    **Visualization:**
    - Revenue trend charts (line graphs)
    - User registration breakdown (bar/pie charts)
    - Booking success rate indicators
    - Performance heatmaps and alerts
    
    **Filters:**
    - Flexible period selection (today to custom date ranges)
    - User type filtering (customers, artists, academies)
    - Geographic filtering by city
    - Service category filtering
    - Test data inclusion toggle
    """
    filters = AnalyticsFilters(
        period=period,
        start_date=start_date,
        end_date=end_date,
        user_type=user_type,
        service_type=service_type,
        city=city,
        include_test_data=include_test_data
    )
    
    overview = service.get_analytics_overview(filters)
    return SuccessResponse(data=overview)


@router.get("/users", response_model=SuccessResponse[UserAnalytics])
async def get_user_analytics(
    service: Annotated[AnalyticsReportsService, Depends(get_analytics_service)],
    period: ReportPeriod = Query(default=ReportPeriod.THIS_MONTH),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    user_type: Optional[str] = Query(None),
    city: Optional[str] = Query(None)
):
    """
    Get detailed user analytics and behavior insights.
    
    **Required Permission:** admin.analytics.users
    
    **Analytics Provided:**
    - User registration trends and patterns
    - Active user metrics and retention rates
    - Geographic distribution and growth by city
    - User type breakdown (customers/artists/academies)
    - Registration source analysis
    - User activity heatmaps and engagement patterns
    
    **Key Insights:**
    - Peak registration periods and seasonality
    - User retention rate calculations
    - Churn analysis and risk indicators
    - Growth rate by user segments
    - Activity patterns and usage trends
    - Top performing cities and regions
    
    **Visualizations:**
    - Registration trend lines
    - User type distribution charts
    - Geographic heatmaps
    - Activity patterns by time/day
    - Retention cohort analysis
    """
    filters = AnalyticsFilters(
        period=period,
        start_date=start_date,
        end_date=end_date,
        user_type=user_type,
        city=city
    )
    
    user_analytics = service.get_user_analytics(filters)
    return SuccessResponse(data=user_analytics)


@router.get("/bookings", response_model=SuccessResponse[BookingAnalytics])
async def get_booking_analytics(
    service: Annotated[AnalyticsReportsService, Depends(get_analytics_service)],
    period: ReportPeriod = Query(default=ReportPeriod.THIS_MONTH),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    service_type: Optional[str] = Query(None),
    city: Optional[str] = Query(None)
):
    """
    Get comprehensive booking analytics and performance metrics.
    
    **Required Permission:** admin.analytics.bookings
    
    **Booking Metrics:**
    - Total bookings with success/cancellation rates
    - Average booking value and revenue per booking
    - Popular services and category performance
    - Booking conversion funnel analysis
    - Seasonal booking patterns and trends
    - Cancellation analysis with reason breakdown
    
    **Performance Insights:**
    - Peak booking periods and seasonality
    - Service category popularity rankings
    - Geographic booking distribution
    - Booking value trends and pricing analysis
    - Success rate optimization opportunities
    - Customer booking behavior patterns
    
    **Business Intelligence:**
    - Revenue optimization insights
    - Service demand forecasting
    - Seasonal planning recommendations
    - Market opportunity identification
    - Artist performance correlation
    """
    filters = AnalyticsFilters(
        period=period,
        start_date=start_date,
        end_date=end_date,
        service_type=service_type,
        city=city
    )
    
    booking_analytics = service.get_booking_analytics(filters)
    return SuccessResponse(data=booking_analytics)


@router.get("/financial", response_model=SuccessResponse[FinancialAnalytics])
async def get_financial_analytics(
    service: Annotated[AnalyticsReportsService, Depends(get_analytics_service)],
    period: ReportPeriod = Query(default=ReportPeriod.THIS_MONTH),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None)
):
    """
    Get comprehensive financial analytics and revenue insights.
    
    **Required Permission:** admin.analytics.financial
    
    **Revenue Analytics:**
    - Total platform revenue with growth trends
    - Commission analytics and rate optimization
    - Artist earnings and payout metrics
    - Payment method performance breakdown
    - Refund analysis and financial health scoring
    
    **Financial Health Metrics:**
    - Revenue diversification analysis
    - Payment success/failure rate tracking
    - Commission rate effectiveness
    - Cash flow and payout optimization
    - Financial risk assessment indicators
    
    **Business Insights:**
    - Revenue forecasting and projections
    - Commission optimization opportunities
    - Payment method preferences analysis
    - Refund pattern identification
    - Financial performance benchmarking
    
    **Compliance & Reporting:**
    - Financial transaction summaries
    - Commission tracking for tax purposes
    - Revenue recognition metrics
    - Audit trail and financial reconciliation
    """
    filters = AnalyticsFilters(
        period=period,
        start_date=start_date,
        end_date=end_date
    )
    
    financial_analytics = service.get_financial_analytics(filters)
    return SuccessResponse(data=financial_analytics)


@router.get("/platform-performance", response_model=SuccessResponse[PlatformPerformance])
async def get_platform_performance(
    service: Annotated[AnalyticsReportsService, Depends(get_analytics_service)],
    period: ReportPeriod = Query(default=ReportPeriod.THIS_WEEK)
):
    """
    Get platform performance metrics and system health analytics.
    
    **Required Permission:** admin.analytics.platform
    
    **System Performance:**
    - API response time monitoring and trends
    - System uptime and availability metrics
    - Error rate tracking and analysis
    - Resource utilization (CPU, memory, storage)
    - Peak usage patterns and load analysis
    
    **Technical Health:**
    - Database performance metrics
    - API endpoint performance breakdown
    - System alerts and incident tracking
    - Capacity planning insights
    - Performance optimization opportunities
    
    **Operational Intelligence:**
    - Usage pattern analysis by time of day
    - System bottleneck identification
    - Performance trending and forecasting
    - Infrastructure optimization recommendations
    - Service level agreement (SLA) compliance
    
    **Monitoring & Alerts:**
    - Real-time system health indicators
    - Performance threshold monitoring
    - Automated alert system status
    - Historical performance trends
    - Proactive maintenance indicators
    """
    filters = AnalyticsFilters(period=period)
    
    platform_performance = service.get_platform_performance(filters)
    return SuccessResponse(data=platform_performance)


@router.post("/reports/generate", response_model=SuccessResponse[ComprehensiveReport])
async def generate_comprehensive_report(
    service: Annotated[AnalyticsReportsService, Depends(get_analytics_service)],
    request: ReportGenerationRequest
):
    """
    Generate a comprehensive analytics report with all metrics.
    
    **Required Permission:** admin.analytics.reports
    
    **Report Components:**
    - Executive dashboard summary with key metrics
    - Detailed user analytics and behavior insights
    - Comprehensive booking performance analysis
    - Financial analytics with revenue breakdowns
    - Platform performance and technical health metrics
    - Actionable recommendations and insights
    
    **Customization Options:**
    - Flexible date range selection
    - Multiple export formats (JSON, Excel, PDF, CSV)
    - Chart inclusion toggle for visual reports
    - Email delivery option for scheduled reports
    - Filter combinations for focused analysis
    
    **Business Value:**
    - Complete business health overview
    - Performance trend identification
    - Growth opportunity analysis
    - Risk factor identification
    - Strategic planning insights
    - Operational optimization recommendations
    
    **Export & Sharing:**
    - Multiple format support for different use cases
    - Automated email delivery for stakeholders
    - Secure download URLs with expiration
    - Report archiving and historical access
    """
    report = service.generate_comprehensive_report(request)
    return SuccessResponse(data=report)


@router.get("/reports", response_model=SuccessResponse[CustomReportListResponse])
async def get_custom_reports(
    service: Annotated[AnalyticsReportsService, Depends(get_analytics_service)],
    pagination: Annotated[PaginationParams, Depends()]
):
    """
    Get list of custom reports and saved configurations.
    
    **Required Permission:** admin.analytics.reports
    
    **Report Management:**
    - Previously generated report history
    - Saved report configuration templates
    - Recent export download history
    - Report scheduling and automation setup
    
    **Features:**
    - Report template library for common use cases
    - Custom metric combination configurations
    - Automated report scheduling options
    - Export format preferences saving
    - Recipient list management for automated reports
    
    **Use Cases:**
    - Monthly business review automation
    - Weekly performance summaries
    - Quarterly stakeholder reports
    - Custom department-specific analytics
    - Compliance and audit reporting
    """
    reports = service.get_custom_reports(pagination.page, pagination.size)
    return SuccessResponse(data=reports)


@router.get("/export")
async def export_analytics_data(
    service: Annotated[AnalyticsReportsService, Depends(get_analytics_service)],
    period: ReportPeriod = Query(default=ReportPeriod.THIS_MONTH),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    format: str = Query(default="excel", description="Export format: excel, csv, pdf"),
    user_type: Optional[str] = Query(None),
    service_type: Optional[str] = Query(None),
    city: Optional[str] = Query(None)
):
    """
    Export analytics data to specified format for offline analysis.
    
    **Required Permission:** admin.analytics.export
    
    **Export Formats:**
    - Excel (.xlsx) with multiple worksheets and charts
    - CSV for data analysis and integration
    - PDF for presentation and sharing
    
    **Data Included:**
    - User registration and activity data
    - Booking transactions and performance metrics
    - Financial data with revenue breakdowns
    - Platform performance and technical metrics
    
    **Use Cases:**
    - Offline data analysis and modeling
    - External reporting and presentation
    - Data integration with business intelligence tools
    - Backup and archival purposes
    - Compliance and audit documentation
    
    **Features:**
    - Filtered data export based on criteria
    - Structured data format for easy analysis
    - Automated file naming with timestamps
    - Secure download with temporary URLs
    """
    filters = AnalyticsFilters(
        period=period,
        start_date=start_date,
        end_date=end_date,
        user_type=user_type,
        service_type=service_type,
        city=city
    )
    
    file_stream, filename = service.export_analytics_data(filters, format)
    
    # Determine media type based on format
    media_types = {
        "excel": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "csv": "text/csv",
        "pdf": "application/pdf"
    }
    
    media_type = media_types.get(format.lower(), "application/octet-stream")
    
    return StreamingResponse(
        file_stream,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )