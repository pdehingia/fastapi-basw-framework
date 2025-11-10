"""
Health Check Module - Monitor application health.

Better than NestJS:
- Built-in health checks
- Custom health indicators
- Async support
- Detailed health reports
"""

from typing import Dict, List, Callable, Any, Optional
from datetime import datetime
from pydantic import BaseModel
from enum import Enum
import asyncio


class HealthStatus(str, Enum):
    """Health status enumeration."""

    UP = "up"
    DOWN = "down"
    DEGRADED = "degraded"


class HealthIndicatorResult(BaseModel):
    """Result from a health indicator."""

    status: HealthStatus
    message: Optional[str] = None
    details: Optional[Dict[str, Any]] = None


class HealthCheckResult(BaseModel):
    """Overall health check result."""

    status: HealthStatus
    timestamp: datetime
    checks: Dict[str, HealthIndicatorResult]
    uptime: Optional[float] = None


class HealthIndicator:
    """
    Base class for health indicators.

    Example:
        class DatabaseHealthIndicator(HealthIndicator):
            def __init__(self, db):
                self.db = db

            async def check(self) -> HealthIndicatorResult:
                try:
                    await self.db.execute("SELECT 1")
                    return HealthIndicatorResult(
                        status=HealthStatus.UP,
                        message="Database is healthy"
                    )
                except Exception as e:
                    return HealthIndicatorResult(
                        status=HealthStatus.DOWN,
                        message=f"Database error: {str(e)}"
                    )
    """

    async def check(self) -> HealthIndicatorResult:
        """Perform health check."""
        raise NotImplementedError


class HealthService:
    """
    Health check service.

    Manages multiple health indicators and provides overall health status.
    """

    def __init__(self):
        self._indicators: Dict[str, HealthIndicator] = {}
        self._start_time = datetime.now()

    def add_indicator(self, name: str, indicator: HealthIndicator):
        """Add a health indicator."""
        self._indicators[name] = indicator

    async def check(self) -> HealthCheckResult:
        """
        Perform all health checks.

        Returns:
            HealthCheckResult with overall status and individual check results
        """
        checks = {}
        overall_status = HealthStatus.UP

        # Run all checks in parallel
        check_tasks = [
            self._run_check(name, indicator)
            for name, indicator in self._indicators.items()
        ]

        results = await asyncio.gather(*check_tasks, return_exceptions=True)

        for (name, _), result in zip(self._indicators.items(), results):
            if isinstance(result, Exception):
                checks[name] = HealthIndicatorResult(
                    status=HealthStatus.DOWN,
                    message=f"Check failed: {str(result)}",
                )
                overall_status = HealthStatus.DOWN
            else:
                checks[name] = result

                # Update overall status
                if result.status == HealthStatus.DOWN:
                    overall_status = HealthStatus.DOWN
                elif result.status == HealthStatus.DEGRADED and overall_status == HealthStatus.UP:
                    overall_status = HealthStatus.DEGRADED

        # Calculate uptime
        uptime = (datetime.now() - self._start_time).total_seconds()

        return HealthCheckResult(
            status=overall_status,
            timestamp=datetime.now(),
            checks=checks,
            uptime=uptime,
        )

    async def _run_check(
        self, name: str, indicator: HealthIndicator
    ) -> HealthIndicatorResult:
        """Run a single health check."""
        return await indicator.check()


# Built-in health indicators


class DiskHealthIndicator(HealthIndicator):
    """Check disk space."""

    def __init__(self, path: str = "/", threshold: float = 0.9):
        self.path = path
        self.threshold = threshold

    async def check(self) -> HealthIndicatorResult:
        import shutil

        try:
            usage = shutil.disk_usage(self.path)
            used_percent = usage.used / usage.total

            if used_percent > self.threshold:
                return HealthIndicatorResult(
                    status=HealthStatus.DEGRADED,
                    message=f"Disk usage is high: {used_percent * 100:.1f}%",
                    details={
                        "total": usage.total,
                        "used": usage.used,
                        "free": usage.free,
                        "percent": used_percent * 100,
                    },
                )

            return HealthIndicatorResult(
                status=HealthStatus.UP,
                message="Disk space is healthy",
                details={
                    "total": usage.total,
                    "used": usage.used,
                    "free": usage.free,
                    "percent": used_percent * 100,
                },
            )

        except Exception as e:
            return HealthIndicatorResult(
                status=HealthStatus.DOWN, message=f"Disk check failed: {str(e)}"
            )


class MemoryHealthIndicator(HealthIndicator):
    """Check memory usage."""

    def __init__(self, threshold: float = 0.9):
        self.threshold = threshold

    async def check(self) -> HealthIndicatorResult:
        import psutil

        try:
            memory = psutil.virtual_memory()
            used_percent = memory.percent / 100

            if used_percent > self.threshold:
                return HealthIndicatorResult(
                    status=HealthStatus.DEGRADED,
                    message=f"Memory usage is high: {memory.percent:.1f}%",
                    details={
                        "total": memory.total,
                        "available": memory.available,
                        "percent": memory.percent,
                    },
                )

            return HealthIndicatorResult(
                status=HealthStatus.UP,
                message="Memory is healthy",
                details={
                    "total": memory.total,
                    "available": memory.available,
                    "percent": memory.percent,
                },
            )

        except Exception as e:
            return HealthIndicatorResult(
                status=HealthStatus.DOWN, message=f"Memory check failed: {str(e)}"
            )
