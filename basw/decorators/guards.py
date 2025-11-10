"""
Guards - Protect routes with authentication and authorization.

Better than NestJS:
- Async by default
- Type-safe
- Easy to compose
- Built-in JWT support
"""

from typing import Callable, List, Type, Optional
from functools import wraps
from abc import ABC, abstractmethod
from fastapi import Request


GUARDS_METADATA = "__guards__"


class ExecutionContext:
    """Context passed to guards containing request information."""

    def __init__(self, request: Request, handler: Callable):
        self.request = request
        self.handler = handler

    def get_request(self) -> Request:
        """Get the FastAPI request object."""
        return self.request

    def get_handler(self) -> Callable:
        """Get the route handler function."""
        return self.handler


class Guard(ABC):
    """
    Base class for guards.

    Example:
        class AuthGuard(Guard):
            async def can_activate(self, context: ExecutionContext) -> bool:
                request = context.get_request()
                token = request.headers.get("Authorization")
                return await self.validate_token(token)
    """

    @abstractmethod
    async def can_activate(self, context: ExecutionContext) -> bool:
        """
        Determine if the request should be allowed.

        Args:
            context: Execution context with request info

        Returns:
            True if allowed, False otherwise
        """
        pass


def UseGuards(*guards: Type[Guard]):
    """
    Apply guards to a route or controller.

    Args:
        *guards: Guard classes to apply

    Example:
        @Controller("/admin")
        @UseGuards(AuthGuard, RoleGuard)
        class AdminController:
            @Get()
            async def get_data(self):
                return {"data": "secret"}
    """

    def decorator(target: Callable | Type) -> Callable | Type:
        if isinstance(target, type):
            # Applied to class (controller)
            setattr(target, GUARDS_METADATA, list(guards))
            return target
        else:
            # Applied to method (route)
            if not hasattr(target, GUARDS_METADATA):
                setattr(target, GUARDS_METADATA, [])

            existing_guards = getattr(target, GUARDS_METADATA)
            setattr(target, GUARDS_METADATA, existing_guards + list(guards))

            @wraps(target)
            async def wrapper(*args, **kwargs):
                return await target(*args, **kwargs)

            setattr(wrapper, GUARDS_METADATA, getattr(target, GUARDS_METADATA))
            return wrapper

    return decorator


def get_guards(target: Callable | Type) -> List[Type[Guard]]:
    """Get guards from a target."""
    return getattr(target, GUARDS_METADATA, [])


# Built-in guards


class RoleGuard(Guard):
    """Guard that checks user roles."""

    def __init__(self, required_roles: List[str]):
        self.required_roles = required_roles

    async def can_activate(self, context: ExecutionContext) -> bool:
        request = context.get_request()

        # Get user from request state (set by auth middleware)
        user = getattr(request.state, "user", None)

        if not user:
            return False

        user_roles = getattr(user, "roles", [])
        return any(role in user_roles for role in self.required_roles)


def Roles(*roles: str):
    """
    Shortcut decorator for role-based access control.

    Example:
        @Get("/admin")
        @Roles("admin", "superuser")
        async def admin_route(self):
            return {"message": "Admin only"}
    """
    return UseGuards(RoleGuard(list(roles)))
