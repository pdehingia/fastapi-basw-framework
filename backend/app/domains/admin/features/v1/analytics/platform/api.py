"""Platform Analytics API endpoints."""

from typing import Optional
from datetime import date, timedelta
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status

from app.domains.admin.features.v1.auth.dependencies import get_current_admin_user
from .schemas import (
    PlatformAnalyticSummary,
    PlatformAnalyticTrends,
    PlatformAnalyticsDashboardResponse,
    PlatformOverviewMetrics,
    PlatformTrendPoint,
    PlatformTopMetrics,
    TopMetricItem,
    MetricPeriod
)


router = APIRouter(prefix="", tags=["Platform Analytics"])


@router.get(
    "",
    response_model=PlatformAnalyticsDashboardResponse,
    summary="Get platform analytics dashboard"
)
async def get_platform_analytics_dashboard(
    current_admin: dict = Depends(get_current_admin_user),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    period: Optional[str] = Query(None, description="Aggregation period (day, week, month, quarter, year)")
):
    """Return aggregated platform analytics for dashboard widgets."""
    today = end_date or date.today()
    start = start_date or (today - timedelta(days=6))

    # Generate simple trend data for the selected window
    total_days = (today - start).days + 1
    trend_points = []
    for idx in range(total_days):
        current_day = start + timedelta(days=idx)
        trend_points.append(
            PlatformTrendPoint(
                date=current_day,
                users=120 + idx * 5,
                bookings=48 + idx * 3,
                revenue=1800.0 + idx * 125.0
            )
        )

    overview = PlatformOverviewMetrics(
        total_users=2735,
        total_bookings=15840,
        total_revenue=482_560.00,
        total_providers=684,
        active_users=1942,
        growth_rate=12.4
    )

    top_metrics = PlatformTopMetrics(
        most_booked_services=[
            TopMetricItem(name="Bridal Makeup", count=3240),
            TopMetricItem(name="Hair Styling", count=2875),
            TopMetricItem(name="Spa Therapy", count=1980)
        ],
        top_revenue_providers=[
            TopMetricItem(name="Glamour Studio", revenue=98520.0),
            TopMetricItem(name="Urban Styles", revenue=87410.0),
            TopMetricItem(name="Elegance Pro", revenue=76500.0)
        ],
        popular_locations=[
            TopMetricItem(name="Mumbai", count=4120),
            TopMetricItem(name="Delhi", count=3650),
            TopMetricItem(name="Bengaluru", count=2985)
        ]
    )

    return PlatformAnalyticsDashboardResponse(
        overview=overview,
        trends=trend_points,
        top_metrics=top_metrics
    )


@router.get(
    "/summary",
    response_model=PlatformAnalyticSummary,
    summary="Get analytics summary"
)
async def get_platform_analytics_summary(
    current_admin: dict = Depends(get_current_admin_user),
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None)
):
    """Get aggregated platform analytics summary."""
    summary_period = "custom" if from_date or to_date else "this_month"

    return PlatformAnalyticSummary(
        period=summary_period,
        total_transactions=15840,
        total_users=2735,
        total_revenue=482_560.0,
        avg_booking_value=152.75,
        user_retention_rate=87.3,
        provider_satisfaction=4.6
    )


@router.get(
    "/trends",
    response_model=PlatformAnalyticTrends,
    summary="Get analytics trends"
)
async def get_platform_analytics_trends(
    current_admin: dict = Depends(get_current_admin_user),
    metric: str = Query(..., description="Metric to analyze"),
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    period: MetricPeriod = Query(MetricPeriod.DAILY)
):
    """Get time-series trends for specific metrics."""
    today = to_date or date.today()
    if period == MetricPeriod.DAILY:
        start = from_date or (today - timedelta(days=6))
        step = timedelta(days=1)
        total_points = (today - start).days + 1
    elif period == MetricPeriod.WEEKLY:
        start = from_date or (today - timedelta(weeks=11))
        step = timedelta(weeks=1)
        total_points = ((today - start).days // 7) + 1
    else:
        start = from_date or (today - timedelta(days=180))
        step = timedelta(days=30)
        total_points = 6

    data_points = []
    for idx in range(total_points):
        point_date = start + (step * idx)
        value = 0.0
        if metric == "revenue":
            value = 1800.0 + idx * 145.0
        elif metric == "bookings":
            value = 240 + idx * 12
        else:  # users or fallback
            value = 320 + idx * 18

        data_points.append({
            "date": point_date,
            "value": float(value)
        })

    return PlatformAnalyticTrends(
        metric=metric,
        period=period,
        data_points=data_points
    )


@router.post(
    "/calculate",
    response_model=dict,
    summary="Calculate platform analytics"
)
async def calculate_platform_analytics(
    current_admin: dict = Depends(get_current_admin_user),
    target_date: date = Query(...),
    period_type: MetricPeriod = Query(MetricPeriod.DAILY)
):
    """Trigger calculation of platform analytics for a specific date."""
    # Mock implementation
    return {
        "message": "Analytics calculation triggered successfully",
        "target_date": str(target_date),
        "period_type": period_type
    }


@router.delete(
    "/{analytics_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete analytics record"
)
async def delete_platform_analytic(
    analytics_id: UUID,
    current_admin: dict = Depends(get_current_admin_user)
):
    """Delete a specific platform analytics record."""
    # Mock implementation
    pass


@router.post(
    "/export",
    response_model=dict,
    summary="Export platform analytics"
)
async def export_platform_analytics(
    current_admin: dict = Depends(get_current_admin_user),
    from_date: date = Query(...),
    to_date: date = Query(...),
    format: str = Query("csv", regex="^(csv|excel)$")
):
    """Export platform analytics data to CSV or Excel."""
    # Mock implementation
    return {
        "message": "Export initiated successfully",
        "format": format,
        "download_url": "/api/downloads/platform-analytics-export.csv"
    }
