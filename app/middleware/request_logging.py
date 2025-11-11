"""
Request logging middleware.
Logs detailed information about each request and response.
"""

import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware that logs request and response details.

    Logs:
    - Request method, path, query params
    - Request headers (optional)
    - Response status code
    - Request duration
    - Client IP
    """

    def __init__(self, app, log_headers: bool = False):
        """
        Initialize middleware.

        Args:
            app: FastAPI application
            log_headers: Whether to log request headers (may contain sensitive data)
        """
        super().__init__(app)
        self.log_headers = log_headers

    async def dispatch(self, request: Request, call_next):
        """
        Process request and log details.

        Args:
            request: Incoming request
            call_next: Next middleware/handler

        Returns:
            Response
        """
        # Start timer
        start_time = time.time()

        # Prepare log data
        log_data = {
            "method": request.method,
            "path": request.url.path,
            "query_params": str(request.query_params) if request.query_params else None,
            "client_ip": request.client.host if request.client else None,
            "user_agent": request.headers.get("user-agent"),
        }

        # Add correlation ID if present
        if hasattr(request.state, "correlation_id"):
            log_data["correlation_id"] = request.state.correlation_id

        # Optionally log headers (be careful with sensitive data)
        if self.log_headers:
            # Filter out sensitive headers
            safe_headers = {
                k: v for k, v in request.headers.items()
                if k.lower() not in ["authorization", "cookie", "x-api-key"]
            }
            log_data["headers"] = safe_headers

        # Process request
        try:
            response: Response = await call_next(request)

            # Calculate duration
            duration = time.time() - start_time

            # Add response data
            log_data.update({
                "status_code": response.status_code,
                "duration_ms": round(duration * 1000, 2),
            })

            # Log based on status code
            if response.status_code >= 500:
                logger.error("Request failed", extra=log_data)
            elif response.status_code >= 400:
                logger.warning("Request returned error", extra=log_data)
            else:
                logger.info("Request succeeded", extra=log_data)

            return response

        except Exception as e:
            # Calculate duration
            duration = time.time() - start_time

            # Log exception
            log_data.update({
                "duration_ms": round(duration * 1000, 2),
                "error": str(e),
                "error_type": type(e).__name__,
            })

            logger.exception("Request raised exception", extra=log_data)
            raise
