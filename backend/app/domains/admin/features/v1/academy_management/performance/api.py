"""Academy Performance API endpoints."""

from typing import Optional
from datetime import date
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status

from app.domains.admin.features.v1.auth.dependencies import get_current_admin
from .schemas import (
    AcademyPerformanceResponse,
    AcademyPerformanceListResponse,
    AcademyPerformanceSummary,
    AcademyPerformanceTrends,
    TopPerformerResponse
)


router = APIRouter(prefix="/academy-performance", tags=["Academy Performance"])


@router.get(
    "",
    response_model=AcademyPerformanceListResponse,
    summary="List academy performance"
)
async def list_academy_performance(
    current_admin: dict = Depends(get_current_admin),
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=100),
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    academy_id: Optional[UUID] = Query(None)
):
    """Get paginated list of academy performance records."""
    # Mock implementation
    return AcademyPerformanceListResponse(
        items=[],
        total=0,
        page=page,
        size=size,
        pages=0
    )


@router.get(
    "/academy/{academy_id}",
    response_model=AcademyPerformanceSummary,
    summary="Get academy performance"
)
async def get_academy_performance(
    academy_id: UUID,
    current_admin: dict = Depends(get_current_admin),
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None)
):
    """Get performance summary for a specific academy."""
    # Mock implementation
    return AcademyPerformanceSummary(
        academy_id=academy_id,
        academy_name="Sample Academy",
        total_revenue=0.0,
        total_students=0,
        avg_rating=0.0,
        performance_rank=None,
        quality_score=0.0
    )


@router.get(
    "/academy/{academy_id}/trends",
    response_model=AcademyPerformanceTrends,
    summary="Get academy performance trends"
)
async def get_academy_performance_trends(
    academy_id: UUID,
    current_admin: dict = Depends(get_current_admin),
    metric: str = Query(..., description="Metric to analyze"),
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None)
):
    """Get time-series performance trends for specific academy."""
    # Mock implementation
    return AcademyPerformanceTrends(
        academy_id=academy_id,
        metric=metric,
        period="daily",
        data_points=[]
    )


@router.get(
    "/top-performers",
    response_model=List[TopPerformerResponse],
    summary="Get top performing academies"
)
async def get_top_performers(
    current_admin: dict = Depends(get_current_admin),
    limit: int = Query(10, ge=1, le=50),
    metric: str = Query("quality_score", description="Ranking metric"),
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None)
):
    """Get list of top performing academies by specified metric."""
    # Mock implementation
    return []


@router.post(
    "/calculate",
    response_model=dict,
    summary="Calculate academy performance"
)
async def calculate_academy_performance(
    current_admin: dict = Depends(get_current_admin),
    target_date: date = Query(...),
    academy_id: Optional[UUID] = Query(None, description="Calculate for specific academy or all")
):
    """Trigger calculation of academy performance metrics."""
    # Mock implementation
    return {
        "message": "Performance calculation triggered successfully",
        "target_date": str(target_date),
        "academy_id": str(academy_id) if academy_id else "all"
    }


@router.post(
    "/export",
    response_model=dict,
    summary="Export academy performance"
)
async def export_academy_performance(
    current_admin: dict = Depends(get_current_admin),
    from_date: date = Query(...),
    to_date: date = Query(...),
    academy_id: Optional[UUID] = Query(None),
    format: str = Query("csv", regex="^(csv|excel)$")
):
    """Export academy performance data to CSV or Excel."""
    # Mock implementation
    return {
        "message": "Export initiated successfully",
        "format": format,
        "download_url": "/api/downloads/academy-performance-export.csv"
    }
