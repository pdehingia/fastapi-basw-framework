"""
Exception Filters - Handle exceptions gracefully.

Better than NestJS:
- Python exception handling (more pythonic)
- Async support
- Type-safe
- Automatic error formatting
"""

from typing import Callable, Type, List, Optional, Any
from functools import wraps
from abc import ABC, abstractmethod
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from basw.common.exceptions import HttpException


EXCEPTION_FILTER_METADATA = "__exception_filters__"


class ExceptionFilter(ABC):
    """
    Base class for exception filters.

    Example:
        @Catch(ValueError)
        class ValidationExceptionFilter(ExceptionFilter):
            async def catch(self, exception: ValueError, request: Request) -> Response:
                return JSONResponse(
                    status_code=400,
                    content={"message": str(exception), "error": "ValidationError"}
                )
    """

    @abstractmethod
    async def catch(self, exception: Exception, request: Request) -> Response:
        """
        Handle the exception.

        Args:
            exception: The caught exception
            request: The FastAPI request

        Returns:
            Response to send to client
        """
        pass


def Catch(*exceptions: Type[Exception]):
    """
    Specify which exceptions this filter catches.

    Example:
        @Catch(ValueError, TypeError)
        class MyExceptionFilter(ExceptionFilter):
            async def catch(self, exception: Exception, request: Request) -> Response:
                return JSONResponse(status_code=400, content={"error": str(exception)})
    """

    def decorator(cls: Type[ExceptionFilter]) -> Type[ExceptionFilter]:
        setattr(cls, "__catch_exceptions__", list(exceptions))
        return cls

    return decorator


def UseFilters(*filters: Type[ExceptionFilter]):
    """
    Apply exception filters to a route or controller.

    Example:
        @Controller("/api")
        @UseFilters(CustomExceptionFilter)
        class MyController:
            pass
    """

    def decorator(target: Callable | Type) -> Callable | Type:
        if isinstance(target, type):
            setattr(target, EXCEPTION_FILTER_METADATA, list(filters))
            return target
        else:
            if not hasattr(target, EXCEPTION_FILTER_METADATA):
                setattr(target, EXCEPTION_FILTER_METADATA, [])

            existing = getattr(target, EXCEPTION_FILTER_METADATA)
            setattr(target, EXCEPTION_FILTER_METADATA, existing + list(filters))

            @wraps(target)
            async def wrapper(*args, **kwargs):
                return await target(*args, **kwargs)

            setattr(wrapper, EXCEPTION_FILTER_METADATA, getattr(target, EXCEPTION_FILTER_METADATA))
            return wrapper

    return decorator


def get_exception_filters(target: Callable | Type) -> List[Type[ExceptionFilter]]:
    """Get exception filters from a target."""
    return getattr(target, EXCEPTION_FILTER_METADATA, [])


def get_caught_exceptions(filter_cls: Type[ExceptionFilter]) -> List[Type[Exception]]:
    """Get exceptions caught by a filter."""
    return getattr(filter_cls, "__catch_exceptions__", [])


# Built-in Exception Filters


@Catch(HttpException)
class HttpExceptionFilter(ExceptionFilter):
    """Handle HttpException and its subclasses."""

    async def catch(self, exception: HttpException, request: Request) -> Response:
        return JSONResponse(
            status_code=exception.status_code,
            content=exception.detail,
        )


@Catch(Exception)
class AllExceptionsFilter(ExceptionFilter):
    """Catch-all filter for unhandled exceptions."""

    async def catch(self, exception: Exception, request: Request) -> Response:
        # Log the exception (in production, use proper logging)
        print(f"Unhandled exception: {type(exception).__name__}: {str(exception)}")

        return JSONResponse(
            status_code=500,
            content={
                "message": "Internal server error",
                "error": "InternalServerError",
                "statusCode": 500,
            },
        )
