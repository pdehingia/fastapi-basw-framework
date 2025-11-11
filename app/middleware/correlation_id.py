"""
Correlation ID middleware for request tracing.
Adds a unique ID to each request for tracking across logs and services.
"""

import uuid
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger(__name__)


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """
    Middleware that adds correlation ID to requests.

    The correlation ID can be:
    1. Provided by the client via X-Correlation-ID header
    2. Auto-generated if not provided

    The ID is added to:
    - Request state (accessible in route handlers)
    - Response headers
    - Log records (if using structured logging)
    """

    HEADER_NAME = "X-Correlation-ID"

    async def dispatch(self, request: Request, call_next):
        """
        Process request and add correlation ID.

        Args:
            request: Incoming request
            call_next: Next middleware/handler

        Returns:
            Response with correlation ID header
        """
        # Get correlation ID from header or generate new one
        correlation_id = request.headers.get(self.HEADER_NAME)
        if not correlation_id:
            correlation_id = str(uuid.uuid4())

        # Add to request state for access in route handlers
        request.state.correlation_id = correlation_id

        # Log request start with correlation ID
        logger.info(
            f"Request started: {request.method} {request.url.path}",
            extra={
                "correlation_id": correlation_id,
                "method": request.method,
                "path": request.url.path,
                "client_ip": request.client.host if request.client else None,
            }
        )

        try:
            # Process request
            response: Response = await call_next(request)

            # Add correlation ID to response headers
            response.headers[self.HEADER_NAME] = correlation_id

            # Log request completion
            logger.info(
                f"Request completed: {request.method} {request.url.path} - {response.status_code}",
                extra={
                    "correlation_id": correlation_id,
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": response.status_code,
                }
            )

            return response

        except Exception as e:
            # Log error with correlation ID
            logger.error(
                f"Request failed: {request.method} {request.url.path}",
                extra={
                    "correlation_id": correlation_id,
                    "method": request.method,
                    "path": request.url.path,
                    "error": str(e),
                },
                exc_info=True
            )
            raise


def get_correlation_id(request: Request) -> str:
    """
    Get correlation ID from request state.

    Args:
        request: FastAPI request object

    Returns:
        Correlation ID string

    Example:
        @router.get("/users")
        async def get_users(request: Request):
            correlation_id = get_correlation_id(request)
            logger.info(f"Getting users", extra={"correlation_id": correlation_id})
    """
    return getattr(request.state, "correlation_id", "unknown")
