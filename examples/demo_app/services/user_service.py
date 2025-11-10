"""
User Service - Business logic for user management.

Demonstrates:
- Injectable decorator
- Dependency injection
- Event emission
- Caching
"""

from basw import Injectable
from basw.decorators.events import get_event_emitter, OnEvent, Event
from basw.decorators.cache import Cacheable, CacheEvict
from basw.common.exceptions import NotFoundException, ConflictException
from examples.demo_app.models.user import CreateUserDto, UpdateUserDto, UserResponse
from examples.demo_app.services.notification_service import NotificationService
from typing import List, Optional
from datetime import datetime


@Injectable()
class UserService:
    """
    User service managing user operations.

    This demonstrates the power of dependency injection.
    """

    def __init__(self, notification_service: NotificationService):
        self.notification_service = notification_service
        self.users: dict[int, dict] = {}
        self.next_id = 1

    @Cacheable(ttl=300, key_prefix="users")
    async def get_all(self) -> List[UserResponse]:
        """
        Get all users.

        This method is cached for 5 minutes.
        """
        return [
            UserResponse(**user)
            for user in self.users.values()
        ]

    @Cacheable(ttl=300, key_prefix="user")
    async def get_by_id(self, user_id: int) -> UserResponse:
        """
        Get user by ID.

        Cached for 5 minutes.
        """
        if user_id not in self.users:
            raise NotFoundException(f"User with ID {user_id} not found")

        return UserResponse(**self.users[user_id])

    @CacheEvict(key_prefix="users", all_entries=True)
    async def create(self, dto: CreateUserDto) -> UserResponse:
        """
        Create a new user.

        This method:
        1. Validates input (via Pydantic)
        2. Creates the user
        3. Emits an event
        4. Invalidates cache
        """
        # Check if username already exists
        for user in self.users.values():
            if user["username"] == dto.username:
                raise ConflictException(f"Username '{dto.username}' already exists")

        # Create user
        user = {
            "id": self.next_id,
            "username": dto.username,
            "email": dto.email,
            "roles": dto.roles,
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
        }

        self.users[self.next_id] = user
        self.next_id += 1

        # Emit event
        emitter = get_event_emitter()
        await emitter.emit("user.created", user)

        return UserResponse(**user)

    @CacheEvict(key_prefix="users", all_entries=True)
    async def update(self, user_id: int, dto: UpdateUserDto) -> UserResponse:
        """Update a user."""
        if user_id not in self.users:
            raise NotFoundException(f"User with ID {user_id} not found")

        user = self.users[user_id]

        if dto.username:
            user["username"] = dto.username
        if dto.email:
            user["email"] = dto.email
        if dto.roles:
            user["roles"] = dto.roles

        user["updated_at"] = datetime.now()

        # Emit event
        emitter = get_event_emitter()
        await emitter.emit("user.updated", user)

        return UserResponse(**user)

    @CacheEvict(key_prefix="users", all_entries=True)
    async def delete(self, user_id: int) -> None:
        """Delete a user."""
        if user_id not in self.users:
            raise NotFoundException(f"User with ID {user_id} not found")

        user = self.users.pop(user_id)

        # Emit event
        emitter = get_event_emitter()
        await emitter.emit("user.deleted", user)

    @OnEvent("user.created", priority=10)
    async def handle_user_created(self, event: Event):
        """
        Handle user created event.

        This demonstrates event-driven architecture.
        """
        user = event.data
        print(f"🎉 New user created: {user['username']} ({user['email']})")

        # Send notification
        await self.notification_service.send_welcome_email(user)
