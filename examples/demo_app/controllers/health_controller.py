"""
Health Controller - Health check endpoints.

Demonstrates:
- Health check system
- Custom health indicators
"""

from basw import Controller, Get
from basw.modules.health import (
    HealthService,
    HealthCheckResult,
    DiskHealthIndicator,
    MemoryHealthIndicator,
)


@Controller("/health")
class HealthController:
    """Health check controller."""

    def __init__(self):
        self.health_service = HealthService()

        # Add health indicators
        self.health_service.add_indicator("disk", DiskHealthIndicator())
        # Uncomment if psutil is installed:
        # self.health_service.add_indicator("memory", MemoryHealthIndicator())

    @Get()
    async def check(self) -> HealthCheckResult:
        """
        Perform health check.

        Returns overall application health status.
        """
        return await self.health_service.check()

    @Get("/ping")
    async def ping(self):
        """Simple ping endpoint."""
        return {"status": "ok", "message": "pong"}
