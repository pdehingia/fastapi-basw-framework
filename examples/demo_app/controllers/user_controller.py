"""
User Controller - HTTP endpoints for user management.

Demonstrates:
- Controller decorator
- Route decorators (Get, Post, Put, Delete)
- Dependency injection
- Guards
- Interceptors
- Response models
"""

from basw import Controller, Get, Post, Put, Delete
from basw.decorators.guards import UseGuards, Guard, ExecutionContext, Roles
from basw.decorators.interceptors import UseInterceptors, LoggingInterceptor
from examples.demo_app.services.user_service import UserService
from examples.demo_app.models.user import CreateUserDto, UpdateUserDto, UserResponse
from typing import List
from fastapi import Request


# Custom guard example
class AuthGuard(Guard):
    """
    Simple authentication guard.

    In production, this would validate JWT tokens.
    """

    async def can_activate(self, context: ExecutionContext) -> bool:
        request = context.get_request()

        # Check for Authorization header
        auth_header = request.headers.get("authorization")

        if not auth_header:
            return False

        # Simple validation (in production, verify JWT)
        return auth_header.startswith("Bearer ")


@Controller("/users")
@UseInterceptors(LoggingInterceptor)
class UserController:
    """
    User management controller.

    This demonstrates NestJS-like patterns in FastAPI.
    """

    def __init__(self, user_service: UserService):
        """
        Constructor with dependency injection.

        UserService is automatically injected by the framework.
        """
        self.user_service = user_service

    @Get()
    async def get_all(self) -> List[UserResponse]:
        """
        Get all users.

        This endpoint:
        - Is public (no guards)
        - Returns a list of users
        - Has automatic OpenAPI documentation
        - Uses caching (implemented in service)
        """
        return await self.user_service.get_all()

    @Get("/{user_id}")
    async def get_by_id(self, user_id: int) -> UserResponse:
        """
        Get user by ID.

        Path parameters are automatically parsed and validated.
        """
        return await self.user_service.get_by_id(user_id)

    @Post()
    @UseGuards(AuthGuard)
    async def create(self, dto: CreateUserDto) -> UserResponse:
        """
        Create a new user.

        This endpoint:
        - Requires authentication (AuthGuard)
        - Validates input with Pydantic
        - Returns created user
        - Emits events
        - Invalidates cache
        """
        return await self.user_service.create(dto)

    @Put("/{user_id}")
    @UseGuards(AuthGuard)
    async def update(self, user_id: int, dto: UpdateUserDto) -> UserResponse:
        """Update an existing user."""
        return await self.user_service.update(user_id, dto)

    @Delete("/{user_id}")
    @UseGuards(AuthGuard)
    async def delete(self, user_id: int):
        """Delete a user."""
        await self.user_service.delete(user_id)
        return {"message": f"User {user_id} deleted successfully"}
