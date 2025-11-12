"""
Main FastAPI application.
Entry point for the application with all configurations.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
import logging

from app.core.config import settings
from app.core.logging import setup_logging
from app.core.database import init_db
from app.api.v1.router import api_router
from app.middleware.error_handler import add_exception_handlers
from app.middleware.correlation_id import CorrelationIdMiddleware
from app.middleware.request_logging import RequestLoggingMiddleware
from app.middleware.security_headers import SecurityHeadersMiddleware

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)


def create_application() -> FastAPI:
    """
    Create and configure FastAPI application.

    Returns:
        Configured FastAPI app
    """
    # Create FastAPI app
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.PROJECT_VERSION,
        description="Maya Platform - Advanced Business Management System",
        docs_url="/docs" if settings.ENABLE_DOCS else None,
        redoc_url="/redoc" if settings.ENABLE_DOCS else None,
        openapi_url="/openapi.json" if settings.ENABLE_DOCS else None,
    )

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Add custom middleware
    app.add_middleware(
        SecurityHeadersMiddleware,
        enable_hsts=settings.is_production
    )
    app.add_middleware(RequestLoggingMiddleware, log_headers=settings.DEBUG)
    app.add_middleware(CorrelationIdMiddleware)

    # Add exception handlers
    add_exception_handlers(app)

    # Include API router
    app.include_router(api_router, prefix=settings.API_V1_STR)

    # Root endpoint
    @app.get("/", include_in_schema=False)
    async def root():
        """Redirect root to API docs."""
        if settings.ENABLE_DOCS:
            return RedirectResponse(url="/docs")
        return {
            "message": f"Welcome to {settings.PROJECT_NAME}",
            "version": settings.VERSION,
            "status": "running"
        }

    # Startup event
    @app.on_event("startup")
    async def startup_event():
        """Run on application startup."""
        logger.info(f"Starting {settings.PROJECT_NAME} v{settings.PROJECT_VERSION}")
        logger.info(f"Environment: {settings.ENVIRONMENT}")
        logger.info(f"Debug mode: {settings.DEBUG}")

        # Initialize database (in development only)
        # In production, use Alembic migrations
        # Temporarily disabled to use Alembic migrations instead
        # if settings.is_development:
        #     try:
        #         init_db()
        #         logger.info("Database initialized")
        #     except Exception as e:
        #         logger.error(f"Database initialization failed: {e}")

    # Shutdown event
    @app.on_event("shutdown")
    async def shutdown_event():
        """Run on application shutdown."""
        logger.info(f"Shutting down {settings.PROJECT_NAME}")

    return app


# Create app instance
app = create_application()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
