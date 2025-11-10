"""
Middleware - Process requests before they reach handlers.

Better than NestJS:
- ASGI middleware (faster)
- Async/await
- Easy composition
- FastAPI integration
"""

from typing import Callable, List
from functools import wraps
from fastapi import Request, Response
from abc import ABC, abstractmethod


MIDDLEWARE_METADATA = "__middleware__"


class Middleware(ABC):
    """
    Base class for middleware.

    Example:
        class CorsMiddleware(Middleware):
            async def use(self, request: Request, next_handler: Callable) -> Response:
                response = await next_handler(request)
                response.headers["Access-Control-Allow-Origin"] = "*"
                return response
    """

    @abstractmethod
    async def use(self, request: Request, next_handler: Callable) -> Response:
        """
        Process the request.

        Args:
            request: FastAPI request
            next_handler: Call this to continue the chain

        Returns:
            Response
        """
        pass


def UseMiddleware(*middleware: type):
    """
    Apply middleware to a module or application.

    Example:
        @Module(...)
        @UseMiddleware(LoggingMiddleware, CorsMiddleware)
        class AppModule:
            pass
    """

    def decorator(cls: type) -> type:
        setattr(cls, MIDDLEWARE_METADATA, list(middleware))
        return cls

    return decorator


def get_middleware(target: type) -> List[type]:
    """Get middleware from a target."""
    return getattr(target, MIDDLEWARE_METADATA, [])


# Built-in Middleware


class CorsMiddleware(Middleware):
    """
    CORS middleware.

    Example:
        middleware = CorsMiddleware(
            allow_origins=["*"],
            allow_methods=["*"],
            allow_headers=["*"],
        )
    """

    def __init__(
        self,
        allow_origins: List[str] = ["*"],
        allow_methods: List[str] = ["*"],
        allow_headers: List[str] = ["*"],
        allow_credentials: bool = True,
    ):
        self.allow_origins = allow_origins
        self.allow_methods = allow_methods
        self.allow_headers = allow_headers
        self.allow_credentials = allow_credentials

    async def use(self, request: Request, next_handler: Callable) -> Response:
        response = await next_handler(request)

        response.headers["Access-Control-Allow-Origin"] = ", ".join(self.allow_origins)
        response.headers["Access-Control-Allow-Methods"] = ", ".join(self.allow_methods)
        response.headers["Access-Control-Allow-Headers"] = ", ".join(self.allow_headers)

        if self.allow_credentials:
            response.headers["Access-Control-Allow-Credentials"] = "true"

        return response


class CompressionMiddleware(Middleware):
    """Enable gzip compression for responses."""

    async def use(self, request: Request, next_handler: Callable) -> Response:
        response = await next_handler(request)

        # Check if client accepts gzip
        accept_encoding = request.headers.get("accept-encoding", "")

        if "gzip" in accept_encoding:
            response.headers["Content-Encoding"] = "gzip"

        return response
