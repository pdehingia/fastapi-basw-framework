"""Analytics and reports service layer."""

import io
from datetime import datetime, timedelta, date
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session

from .schemas import (
    AnalyticsFilters, ReportGenerationRequest, DashboardStats, MetricValue,
    UserAnalytics, BookingAnalytics, FinancialAnalytics, PlatformPerformance,
    ComprehensiveReport, ChartData, ChartDataPoint, ChartType, CustomReportConfig,
    AnalyticsOverviewResponse, CustomReportListResponse, ReportPeriod
)


class AnalyticsReportsService:
    """Service class for analytics and reporting operations."""

    def __init__(self, db: Session, admin_user_id: str):
        self.db = db
        self.admin_user_id = admin_user_id

    def get_analytics_overview(self, filters: AnalyticsFilters) -> AnalyticsOverviewResponse:
        """Get comprehensive analytics overview for admin dashboard."""
        
        # Mock dashboard statistics
        dashboard_stats = DashboardStats(
            total_users=MetricValue(
                current=15420,
                previous=14830,
                change_percentage=3.98,
                trend="up"
            ),
            active_users=MetricValue(
                current=8750,
                previous=8320,
                change_percentage=5.17,
                trend="up"
            ),
            total_bookings=MetricValue(
                current=2340,
                previous=2180,
                change_percentage=7.34,
                trend="up"
            ),
            total_revenue=MetricValue(
                current=485600.00,
                previous=448300.00,
                change_percentage=8.33,
                trend="up"
            ),
            platform_growth=MetricValue(
                current=12.5,
                previous=10.8,
                change_percentage=15.74,
                trend="up"
            ),
            customer_satisfaction=MetricValue(
                current=4.6,
                previous=4.4,
                change_percentage=4.55,
                trend="up"
            )
        )

        # Quick metrics
        quick_metrics = {
            "revenue_per_user": MetricValue(current=31.5, previous=30.2, change_percentage=4.3, trend="up"),
            "avg_booking_value": MetricValue(current=207.5, previous=205.7, change_percentage=0.87, trend="up"),
            "conversion_rate": MetricValue(current=18.5, previous=17.8, change_percentage=3.93, trend="up"),
            "support_tickets": MetricValue(current=45, previous=52, change_percentage=-13.46, trend="down")
        }

        # Recent trends charts
        recent_trends = [
            ChartData(
                type=ChartType.LINE,
                title="Revenue Trend (Last 30 Days)",
                labels=["Day 1", "Day 7", "Day 14", "Day 21", "Day 30"],
                datasets=[{
                    "label": "Revenue",
                    "data": [12500, 14200, 16800, 18900, 20100],
                    "borderColor": "#3B82F6",
                    "backgroundColor": "rgba(59, 130, 246, 0.1)"
                }]
            ),
            ChartData(
                type=ChartType.BAR,
                title="User Registrations by Type",
                labels=["Customers", "Artists", "Academies"],
                datasets=[{
                    "label": "New Registrations",
                    "data": [450, 120, 35],
                    "backgroundColor": ["#10B981", "#F59E0B", "#EF4444"]
                }]
            )
        ]

        # System alerts
        alerts = [
            {
                "type": "warning",
                "message": "High payment failure rate detected (8.2%)",
                "severity": "medium",
                "created_at": datetime.now() - timedelta(hours=2)
            },
            {
                "type": "info", 
                "message": "New monthly revenue record achieved!",
                "severity": "low",
                "created_at": datetime.now() - timedelta(hours=6)
            }
        ]

        # Period comparison
        period_comparison = {
            "current_period": "This Month",
            "previous_period": "Last Month",
            "growth_metrics": {
                "users": "+3.98%",
                "bookings": "+7.34%", 
                "revenue": "+8.33%"
            }
        }

        return AnalyticsOverviewResponse(
            dashboard_stats=dashboard_stats,
            quick_metrics=quick_metrics,
            recent_trends=recent_trends,
            alerts=alerts,
            period_comparison=period_comparison
        )

    def get_user_analytics(self, filters: AnalyticsFilters) -> UserAnalytics:
        """Get detailed user analytics and metrics."""
        
        # Mock user analytics data
        registration_trend = [
            ChartDataPoint(label="Week 1", value=280, metadata={"active": 210}),
            ChartDataPoint(label="Week 2", value=320, metadata={"active": 245}), 
            ChartDataPoint(label="Week 3", value=295, metadata={"active": 225}),
            ChartDataPoint(label="Week 4", value=380, metadata={"active": 290})
        ]

        top_cities = [
            {"city": "Mumbai", "users": 3200, "growth": "+12%"},
            {"city": "Delhi", "users": 2800, "growth": "+8%"},
            {"city": "Bangalore", "users": 2100, "growth": "+15%"},
            {"city": "Chennai", "users": 1900, "growth": "+6%"},
            {"city": "Pune", "users": 1500, "growth": "+18%"}
        ]

        activity_heatmap = [
            {"hour": 9, "day": "Monday", "activity": 75},
            {"hour": 14, "day": "Monday", "activity": 92},
            {"hour": 19, "day": "Monday", "activity": 88},
            {"hour": 21, "day": "Saturday", "activity": 95}
        ]

        return UserAnalytics(
            total_registered=15420,
            active_users=8750,
            new_registrations=1275,
            user_retention_rate=73.5,
            user_types_breakdown={
                "customers": 12850,
                "artists": 2250,
                "academies": 320
            },
            top_cities=top_cities,
            registration_trend=registration_trend,
            activity_heatmap=activity_heatmap
        )

    def get_booking_analytics(self, filters: AnalyticsFilters) -> BookingAnalytics:
        """Get detailed booking analytics and performance metrics."""
        
        # Mock booking analytics data
        booking_trends = [
            ChartDataPoint(label="Jan", value=1850, metadata={"conversion_rate": 18.2}),
            ChartDataPoint(label="Feb", value=2100, metadata={"conversion_rate": 19.1}),
            ChartDataPoint(label="Mar", value=2340, metadata={"conversion_rate": 18.8}),
            ChartDataPoint(label="Apr", value=2280, metadata={"conversion_rate": 17.9})
        ]

        popular_services = [
            {"service": "Wedding Photography", "bookings": 520, "revenue": 156000},
            {"service": "Portrait Photography", "bookings": 380, "revenue": 76000},
            {"service": "Event Photography", "bookings": 290, "revenue": 87000},
            {"service": "Corporate Events", "bookings": 180, "revenue": 72000},
            {"service": "Fashion Photography", "bookings": 150, "revenue": 60000}
        ]

        seasonal_patterns = [
            {"month": "December", "booking_spike": 45, "reason": "Wedding Season"},
            {"month": "February", "booking_spike": 38, "reason": "Valentine's Day"},
            {"month": "November", "booking_spike": 42, "reason": "Festival Season"}
        ]

        return BookingAnalytics(
            total_bookings=2340,
            successful_bookings=2185,
            cancelled_bookings=155,
            average_booking_value=207.5,
            booking_success_rate=93.4,
            popular_services=popular_services,
            booking_trends=booking_trends,
            seasonal_patterns=seasonal_patterns,
            cancellation_reasons={
                "customer_request": 85,
                "artist_unavailable": 35,
                "payment_issues": 20,
                "weather_conditions": 15
            }
        )

    def get_financial_analytics(self, filters: AnalyticsFilters) -> FinancialAnalytics:
        """Get comprehensive financial analytics and revenue metrics."""
        
        # Mock financial analytics data
        revenue_trends = [
            ChartDataPoint(label="Week 1", value=118500, metadata={"commission": 11850}),
            ChartDataPoint(label="Week 2", value=125300, metadata={"commission": 12530}),
            ChartDataPoint(label="Week 3", value=120900, metadata={"commission": 12090}),
            ChartDataPoint(label="Week 4", value=135800, metadata={"commission": 13580})
        ]

        commission_analytics = {
            "average_commission_rate": 10.5,
            "total_commission_earned": 51050,
            "top_earning_categories": [
                {"category": "Wedding", "commission": 18500},
                {"category": "Corporate", "commission": 12300},
                {"category": "Portrait", "commission": 9800}
            ]
        }

        return FinancialAnalytics(
            total_revenue=485600.00,
            platform_commission=51050.00,
            artist_earnings=434550.00,
            pending_payouts=28750.00,
            refunds_processed=12480.00,
            payment_methods_breakdown={
                "credit_card": 245800.00,
                "upi": 156200.00,
                "net_banking": 68400.00,
                "wallet": 15200.00
            },
            revenue_trends=revenue_trends,
            commission_analytics=commission_analytics,
            financial_health_score=87.5
        )

    def get_platform_performance(self, filters: AnalyticsFilters) -> PlatformPerformance:
        """Get platform performance metrics and system health data."""
        
        # Mock platform performance data
        performance_trends = [
            ChartDataPoint(label="00:00", value=120, metadata={"errors": 2}),
            ChartDataPoint(label="06:00", value=280, metadata={"errors": 5}),
            ChartDataPoint(label="12:00", value=450, metadata={"errors": 8}),
            ChartDataPoint(label="18:00", value=380, metadata={"errors": 6}),
            ChartDataPoint(label="23:00", value=190, metadata={"errors": 3})
        ]

        resource_utilization = {
            "cpu_usage": 68.5,
            "memory_usage": 72.3,
            "storage_usage": 45.8,
            "bandwidth_usage": 58.9,
            "database_connections": 82.1
        }

        return PlatformPerformance(
            total_api_calls=1250000,
            average_response_time=185.5,
            error_rate=0.8,
            uptime_percentage=99.97,
            peak_usage_hours=[10, 11, 14, 15, 19, 20, 21],
            system_alerts=3,
            performance_trends=performance_trends,
            resource_utilization=resource_utilization
        )

    def generate_comprehensive_report(self, request: ReportGenerationRequest) -> ComprehensiveReport:
        """Generate a comprehensive analytics report."""
        
        # Get all analytics data
        dashboard_stats = self.get_analytics_overview(request.filters).dashboard_stats
        user_analytics = self.get_user_analytics(request.filters)
        booking_analytics = self.get_booking_analytics(request.filters)
        financial_analytics = self.get_financial_analytics(request.filters)
        platform_performance = self.get_platform_performance(request.filters)

        # Generate charts if requested
        charts = []
        if request.include_charts:
            charts = [
                ChartData(
                    type=ChartType.LINE,
                    title="Revenue Growth",
                    labels=["Jan", "Feb", "Mar", "Apr"],
                    datasets=[{
                        "label": "Monthly Revenue",
                        "data": [385600, 420300, 465100, 485600],
                        "borderColor": "#3B82F6"
                    }]
                ),
                ChartData(
                    type=ChartType.PIE,
                    title="User Distribution", 
                    labels=["Customers", "Artists", "Academies"],
                    datasets=[{
                        "data": [12850, 2250, 320],
                        "backgroundColor": ["#10B981", "#F59E0B", "#EF4444"]
                    }]
                )
            ]

        # Generate recommendations
        recommendations = [
            "Focus on user retention programs to improve the 73.5% retention rate",
            "Investigate payment failure rate of 8.2% and optimize payment flow",
            "Consider expanding marketing in high-growth cities like Pune (+18%)",
            "Implement seasonal pricing strategies for peak booking periods",
            "Monitor and optimize platform response time (current: 185.5ms)"
        ]

        # Export URLs
        export_urls = {
            "pdf": f"/api/admin/v1/analytics/reports/{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf",
            "excel": f"/api/admin/v1/analytics/reports/{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx",
            "csv": f"/api/admin/v1/analytics/reports/{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        }

        return ComprehensiveReport(
            id=f"RPT_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            title=f"Comprehensive Analytics Report - {request.filters.period.value.title()}",
            period=request.filters.period.value,
            generated_at=datetime.now(),
            generated_by=self.admin_user_id,
            summary={
                "total_users": dashboard_stats.total_users.current,
                "total_revenue": financial_analytics.total_revenue,
                "platform_health": platform_performance.uptime_percentage,
                "growth_rate": dashboard_stats.platform_growth.current
            },
            dashboard_stats=dashboard_stats,
            user_analytics=user_analytics,
            booking_analytics=booking_analytics,
            financial_analytics=financial_analytics,
            platform_performance=platform_performance,
            charts=charts,
            recommendations=recommendations,
            export_urls=export_urls
        )

    def get_custom_reports(self, page: int = 1, page_size: int = 20) -> CustomReportListResponse:
        """Get list of custom reports and saved configurations."""
        
        # Mock custom reports data
        reports = [
            {
                "id": "RPT_20240115_143022",
                "title": "Monthly Revenue Analysis",
                "type": "financial",
                "generated_at": datetime(2024, 1, 15, 14, 30, 22),
                "generated_by": "admin@maya.com",
                "status": "completed",
                "download_count": 5
            },
            {
                "id": "RPT_20240114_092010", 
                "title": "User Growth Report",
                "type": "user_analytics",
                "generated_at": datetime(2024, 1, 14, 9, 20, 10),
                "generated_by": "analytics@maya.com",
                "status": "completed", 
                "download_count": 12
            },
            {
                "id": "RPT_20240113_165540",
                "title": "Platform Performance Review",
                "type": "performance",
                "generated_at": datetime(2024, 1, 13, 16, 55, 40),
                "generated_by": "admin@maya.com",
                "status": "completed",
                "download_count": 3
            }
        ]

        # Mock saved configurations
        saved_configurations = [
            CustomReportConfig(
                name="Monthly Business Review",
                description="Comprehensive monthly report with all key metrics",
                metrics=["revenue", "users", "bookings", "performance"],
                filters=AnalyticsFilters(period=ReportPeriod.THIS_MONTH),
                chart_configs=[{"type": "line", "metric": "revenue"}],
                schedule={"frequency": "monthly", "day": 1},
                recipients=["management@maya.com", "analytics@maya.com"]
            ),
            CustomReportConfig(
                name="Weekly Performance Summary",
                description="Quick weekly performance overview",
                metrics=["active_users", "bookings", "response_time"],
                filters=AnalyticsFilters(period=ReportPeriod.THIS_WEEK),
                chart_configs=[{"type": "bar", "metric": "bookings"}]
            )
        ]

        # Recent exports
        recent_exports = [
            {
                "report_id": "RPT_20240115_143022",
                "format": "excel",
                "exported_at": datetime.now() - timedelta(hours=2),
                "file_size": "2.5 MB",
                "download_url": "/downloads/monthly_revenue_20240115.xlsx"
            },
            {
                "report_id": "RPT_20240114_092010",
                "format": "pdf", 
                "exported_at": datetime.now() - timedelta(hours=8),
                "file_size": "1.8 MB",
                "download_url": "/downloads/user_growth_20240114.pdf"
            }
        ]

        pagination = {
            "total": len(reports),
            "pages": (len(reports) + page_size - 1) // page_size,
            "current_page": page,
            "has_next": page < ((len(reports) + page_size - 1) // page_size),
            "has_prev": page > 1
        }

        return CustomReportListResponse(
            reports=reports,
            saved_configurations=saved_configurations,
            recent_exports=recent_exports,
            pagination=pagination
        )

    def export_analytics_data(self, filters: AnalyticsFilters, format: str = "excel") -> Tuple[io.BytesIO, str]:
        """Export analytics data to specified format."""
        
        # Create a simple mock export
        if format.lower() == "excel":
            # Mock Excel export
            data = {
                "Users": f"{filters.period.value} user data exported",
                "Bookings": f"{filters.period.value} booking data exported", 
                "Revenue": f"{filters.period.value} financial data exported",
                "Performance": f"{filters.period.value} platform metrics exported"
            }
            
            content = f"Maya Platform Analytics Export\\n"
            content += f"Period: {filters.period.value}\\n"
            content += f"Generated: {datetime.now().isoformat()}\\n\\n"
            for key, value in data.items():
                content += f"{key}: {value}\\n"
            
            buffer = io.BytesIO(content.encode('utf-8'))
            filename = f"maya_analytics_{filters.period.value}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
            
            return buffer, filename
        
        # Default to text export
        content = f"Maya Analytics Export - {filters.period.value}"
        buffer = io.BytesIO(content.encode('utf-8'))
        filename = f"analytics_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        
        return buffer, filename