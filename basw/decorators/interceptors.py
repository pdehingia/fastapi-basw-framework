"""
Interceptors - Transform requests and responses.

Better than NestJS:
- Async/await native
- Composable
- Type-safe
- Performance monitoring built-in
"""

from typing import Callable, Any, List, Type
from functools import wraps
from abc import ABC, abstractmethod
from fastapi import Request, Response
import time
import asyncio


INTERCEPTORS_METADATA = "__interceptors__"


class ExecutionContext:
    """Context for interceptors."""

    def __init__(self, request: Request, handler: Callable):
        self.request = request
        self.handler = handler
        self.metadata = {}

    def get_request(self) -> Request:
        return self.request

    def get_handler(self) -> Callable:
        return self.handler


class Interceptor(ABC):
    """
    Base class for interceptors.

    Example:
        class LoggingInterceptor(Interceptor):
            async def intercept(self, context: ExecutionContext, next_handler: Callable):
                print(f"Before: {context.get_request().url}")
                result = await next_handler()
                print(f"After: {result}")
                return result
    """

    @abstractmethod
    async def intercept(
        self, context: ExecutionContext, next_handler: Callable
    ) -> Any:
        """
        Intercept the request/response.

        Args:
            context: Execution context
            next_handler: Call this to continue the chain

        Returns:
            The response (possibly modified)
        """
        pass


def UseInterceptors(*interceptors: Type[Interceptor]):
    """
    Apply interceptors to a route or controller.

    Example:
        @Get()
        @UseInterceptors(LoggingInterceptor, CacheInterceptor)
        async def get_data(self):
            return {"data": "value"}
    """

    def decorator(target: Callable | Type) -> Callable | Type:
        if isinstance(target, type):
            setattr(target, INTERCEPTORS_METADATA, list(interceptors))
            return target
        else:
            if not hasattr(target, INTERCEPTORS_METADATA):
                setattr(target, INTERCEPTORS_METADATA, [])

            existing = getattr(target, INTERCEPTORS_METADATA)
            setattr(target, INTERCEPTORS_METADATA, existing + list(interceptors))

            @wraps(target)
            async def wrapper(*args, **kwargs):
                return await target(*args, **kwargs)

            setattr(wrapper, INTERCEPTORS_METADATA, getattr(target, INTERCEPTORS_METADATA))
            return wrapper

    return decorator


def get_interceptors(target: Callable | Type) -> List[Type[Interceptor]]:
    """Get interceptors from a target."""
    return getattr(target, INTERCEPTORS_METADATA, [])


# Built-in Interceptors


class LoggingInterceptor(Interceptor):
    """Log request and response information."""

    async def intercept(self, context: ExecutionContext, next_handler: Callable) -> Any:
        request = context.get_request()
        start_time = time.time()

        print(f"→ {request.method} {request.url.path}")

        result = await next_handler()

        duration = (time.time() - start_time) * 1000
        print(f"← {request.method} {request.url.path} ({duration:.2f}ms)")

        return result


class PerformanceInterceptor(Interceptor):
    """Add performance headers to responses."""

    async def intercept(self, context: ExecutionContext, next_handler: Callable) -> Any:
        start_time = time.time()
        result = await next_handler()
        duration = (time.time() - start_time) * 1000

        # Add performance header (if result is a Response object)
        if isinstance(result, Response):
            result.headers["X-Response-Time"] = f"{duration:.2f}ms"

        return result


class TransformInterceptor(Interceptor):
    """
    Transform response data.

    Example:
        class WrapResponseInterceptor(TransformInterceptor):
            async def transform(self, data: Any) -> Any:
                return {"data": data, "success": True}
    """

    async def intercept(self, context: ExecutionContext, next_handler: Callable) -> Any:
        result = await next_handler()
        return await self.transform(result)

    async def transform(self, data: Any) -> Any:
        """Override this method to transform the response."""
        return data
