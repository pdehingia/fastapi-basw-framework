"""Test endpoint for demonstrating standardized responses."""

from fastapi import APIRouter, HTTPException
from app.shared.responses import success_response, error_response

router = APIRouter(prefix="/test", tags=["test"])


@router.get("/success")
async def test_success():
    """Test endpoint that returns standardized success response."""
    return success_response(
        message="Test endpoint working perfectly",
        data={"demo": "This is a standardized success response", "timestamp": "2025-11-13T12:04:00Z"}
    )


@router.get("/error")
async def test_error():
    """Test endpoint that returns standardized error response."""
    return error_response(
        message="Test error endpoint",
        error_code="TEST_ERROR",
        status_code=400,
        details={"demo": "This is a standardized error response"}
    )