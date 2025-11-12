"""
Health check endpoints.
"""

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.core.cache import cache_client
from app.core.config import settings

router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Basic health check.

    Returns:
        Health status
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION
    }


@router.get("/health/detailed")
async def detailed_health_check(db: Session = Depends(get_db)):
    """
    Detailed health check with dependency status.

    Args:
        db: Database session

    Returns:
        Detailed health status
    """
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "environment": settings.ENVIRONMENT,
        "checks": {}
    }

    # Check database
    try:
        db.execute("SELECT 1")
        health_status["checks"]["database"] = {
            "status": "healthy",
            "message": "Database connection successful"
        }
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["checks"]["database"] = {
            "status": "unhealthy",
            "message": f"Database connection failed: {str(e)}"
        }

    # Check cache
    try:
        if cache_client.ping():
            health_status["checks"]["cache"] = {
                "status": "healthy",
                "message": "Cache connection successful"
            }
        else:
            health_status["checks"]["cache"] = {
                "status": "degraded",
                "message": "Cache not available"
            }
    except Exception as e:
        health_status["checks"]["cache"] = {
            "status": "degraded",
            "message": f"Cache check failed: {str(e)}"
        }

    # Return appropriate status code
    if health_status["status"] == "unhealthy":
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=health_status
        )

    return health_status


@router.get("/ready")
async def readiness_check(db: Session = Depends(get_db)):
    """
    Kubernetes readiness probe.

    Args:
        db: Database session

    Returns:
        Ready status
    """
    try:
        # Check if database is accessible
        db.execute("SELECT 1")
        return {
            "status": "ready",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "not ready",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )


@router.get("/live")
async def liveness_check():
    """
    Kubernetes liveness probe.

    Returns:
        Live status
    """
    return {
        "status": "alive",
        "timestamp": datetime.utcnow().isoformat()
    }
