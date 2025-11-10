"""
Controller decorators - Define REST API endpoints with ease.

Better than NestJS:
- Automatic OpenAPI documentation
- Built-in validation with Pydantic
- Async by default
- Python type hints
"""

from typing import Callable, Optional, Any, List, Type
from functools import wraps


CONTROLLER_METADATA = "__controller__"
ROUTE_METADATA = "__routes__"


def Controller(prefix: str = "", tags: Optional[List[str]] = None):
    """
    Mark a class as a controller.

    Args:
        prefix: Base path for all routes in this controller
        tags: OpenAPI tags for grouping endpoints

    Example:
        @Controller("/users")
        class UserController:
            @Get()
            async def get_all(self):
                return []
    """

    def decorator(cls: Type) -> Type:
        setattr(cls, CONTROLLER_METADATA, {
            "prefix": prefix,
            "tags": tags or [],
        })

        # Ensure routes metadata exists
        if not hasattr(cls, ROUTE_METADATA):
            setattr(cls, ROUTE_METADATA, [])

        return cls

    return decorator


def _create_route_decorator(method: str):
    """Factory for creating route decorators."""

    def route_decorator(
        path: str = "",
        status_code: int = 200,
        response_model: Optional[Type] = None,
        summary: Optional[str] = None,
        description: Optional[str] = None,
        tags: Optional[List[str]] = None,
        **kwargs: Any,
    ):
        """
        Route decorator for HTTP methods.

        Args:
            path: URL path for this route
            status_code: HTTP status code for successful response
            response_model: Pydantic model for response validation
            summary: Short description for OpenAPI
            description: Long description for OpenAPI
            tags: Additional tags for this specific route
            **kwargs: Additional FastAPI route parameters
        """

        def decorator(func: Callable) -> Callable:
            # Store route metadata
            route_meta = {
                "method": method,
                "path": path,
                "function": func,
                "status_code": status_code,
                "response_model": response_model,
                "summary": summary or func.__name__.replace("_", " ").title(),
                "description": description or func.__doc__,
                "tags": tags or [],
                "extra": kwargs,
            }

            # Add to function metadata
            if not hasattr(func, ROUTE_METADATA):
                setattr(func, ROUTE_METADATA, [])

            getattr(func, ROUTE_METADATA).append(route_meta)

            @wraps(func)
            async def wrapper(*args, **kwargs):
                return await func(*args, **kwargs)

            # Copy metadata to wrapper
            setattr(wrapper, ROUTE_METADATA, getattr(func, ROUTE_METADATA))

            return wrapper

        return decorator

    return route_decorator


# HTTP Method Decorators
Get = _create_route_decorator("GET")
Post = _create_route_decorator("POST")
Put = _create_route_decorator("PUT")
Delete = _create_route_decorator("DELETE")
Patch = _create_route_decorator("PATCH")
Options = _create_route_decorator("OPTIONS")
Head = _create_route_decorator("HEAD")


def is_controller(cls: Type) -> bool:
    """Check if a class is a controller."""
    return hasattr(cls, CONTROLLER_METADATA)


def get_controller_metadata(cls: Type) -> Optional[dict]:
    """Get controller metadata from a class."""
    return getattr(cls, CONTROLLER_METADATA, None)


def get_routes(cls: Type) -> List[dict]:
    """Get all routes from a controller class."""
    routes = []

    for attr_name in dir(cls):
        if attr_name.startswith("_"):
            continue

        attr = getattr(cls, attr_name)
        if hasattr(attr, ROUTE_METADATA):
            routes.extend(getattr(attr, ROUTE_METADATA))

    return routes
