"""
Shared health check endpoints.
Available across all domains for system monitoring.
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
    Returns simple status for load balancer health checks.
    """
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "service": "maya-platform-api"
        }
    )


@router.get("/health/detailed")
async def detailed_health_check(db: Session = Depends(get_db)):
    """
    Detailed health check with database and cache status.
    """
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "maya-platform-api",
        "version": settings.PROJECT_VERSION,
        "checks": {}
    }
    
    # Database check
    try:
        # Test database connection
        db.execute("SELECT 1")
        health_status["checks"]["database"] = {
            "status": "healthy",
            "message": "PostgreSQL connection successful"
        }
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["checks"]["database"] = {
            "status": "unhealthy", 
            "message": f"Database connection failed: {str(e)}"
        }
    
    # Cache check
    try:
        if cache_client:
            cache_client.ping()
            health_status["checks"]["cache"] = {
                "status": "healthy",
                "message": "Redis connection successful"
            }
        else:
            health_status["checks"]["cache"] = {
                "status": "disabled",
                "message": "Cache not configured"
            }
    except Exception as e:
        health_status["status"] = "degraded"
        health_status["checks"]["cache"] = {
            "status": "unhealthy",
            "message": f"Cache connection failed: {str(e)}"
        }
    
    # Return appropriate status code
    if health_status["status"] == "healthy":
        status_code = status.HTTP_200_OK
    elif health_status["status"] == "degraded":
        status_code = status.HTTP_200_OK  # Still functional
    else:
        status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        
    return JSONResponse(
        status_code=status_code,
        content=health_status
    )


@router.get("/health/readiness")
async def readiness_check(db: Session = Depends(get_db)):
    """
    Kubernetes readiness probe.
    Checks if service is ready to accept traffic.
    """
    try:
        # Test critical dependencies
        db.execute("SELECT 1")
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "status": "ready",
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "not_ready",
                "timestamp": datetime.utcnow().isoformat(),
                "error": str(e)
            }
        )


@router.get("/health/liveness")
async def liveness_check():
    """
    Kubernetes liveness probe.
    Simple check that service is alive.
    """
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": "alive",
            "timestamp": datetime.utcnow().isoformat()
        }
    )