"""
User service containing business logic.
"""

from typing import List, Optional
from sqlalchemy.orm import Session

from app.features.users.repository import UserRepository
from app.features.users.models import User
from app.features.users.schemas import UserCreate, UserUpdate, UserPasswordUpdate
from app.core.security import hash_password, verify_password
from app.core.exceptions import (
    NotFoundException,
    ConflictException,
    ValidationException
)


class UserService:
    """Service for user business logic."""

    def __init__(self, db: Session):
        self.db = db
        self.repository = UserRepository(db)

    def get_user_by_id(self, user_id: int) -> User:
        """
        Get user by ID.

        Args:
            user_id: User ID

        Returns:
            User model

        Raises:
            NotFoundException: If user not found
        """
        user = self.repository.get_by_id(user_id)
        if not user:
            raise NotFoundException(
                message=f"User with ID {user_id} not found",
                resource_type="User",
                resource_id=user_id
            )
        return user

    def get_user_by_email(self, email: str) -> User:
        """
        Get user by email.

        Args:
            email: Email address

        Returns:
            User model

        Raises:
            NotFoundException: If user not found
        """
        user = self.repository.get_by_email(email)
        if not user:
            raise NotFoundException(
                message=f"User with email {email} not found",
                resource_type="User"
            )
        return user

    def get_user_by_username(self, username: str) -> User:
        """
        Get user by username.

        Args:
            username: Username

        Returns:
            User model

        Raises:
            NotFoundException: If user not found
        """
        user = self.repository.get_by_username(username)
        if not user:
            raise NotFoundException(
                message=f"User with username {username} not found",
                resource_type="User"
            )
        return user

    def get_all_users(
        self,
        skip: int = 0,
        limit: int = 100,
        active_only: bool = False
    ) -> List[User]:
        """
        Get all users.

        Args:
            skip: Number of records to skip
            limit: Maximum number of records
            active_only: Only return active users

        Returns:
            List of users
        """
        if active_only:
            return self.repository.get_active_users(skip, limit)
        return self.repository.get_all(skip, limit)

    def create_user(self, user_data: UserCreate) -> User:
        """
        Create a new user.

        Args:
            user_data: User creation data

        Returns:
            Created user

        Raises:
            ConflictException: If email or username already exists
        """
        # Check if email exists
        if self.repository.email_exists(user_data.email):
            raise ConflictException(
                message=f"Email {user_data.email} is already registered",
                field="email"
            )

        # Check if username exists
        if self.repository.username_exists(user_data.username):
            raise ConflictException(
                message=f"Username {user_data.username} is already taken",
                field="username"
            )

        # Create user
        user = User(
            email=user_data.email.lower(),
            username=user_data.username.lower(),
            full_name=user_data.full_name,
            hashed_password=hash_password(user_data.password),
            is_active=True,
            is_superuser=False
        )

        return self.repository.create(user)

    def update_user(self, user_id: int, user_data: UserUpdate) -> User:
        """
        Update user information.

        Args:
            user_id: User ID
            user_data: Update data

        Returns:
            Updated user

        Raises:
            NotFoundException: If user not found
            ConflictException: If email or username already exists
        """
        user = self.get_user_by_id(user_id)

        # Check email uniqueness if being updated
        if user_data.email and user_data.email != user.email:
            if self.repository.email_exists(user_data.email, exclude_id=user_id):
                raise ConflictException(
                    message=f"Email {user_data.email} is already in use",
                    field="email"
                )
            user.email = user_data.email.lower()

        # Check username uniqueness if being updated
        if user_data.username and user_data.username != user.username:
            if self.repository.username_exists(user_data.username, exclude_id=user_id):
                raise ConflictException(
                    message=f"Username {user_data.username} is already taken",
                    field="username"
                )
            user.username = user_data.username.lower()

        # Update other fields
        if user_data.full_name is not None:
            user.full_name = user_data.full_name

        if user_data.is_active is not None:
            user.is_active = user_data.is_active

        return self.repository.update(user)

    def update_password(
        self,
        user_id: int,
        password_data: UserPasswordUpdate
    ) -> User:
        """
        Update user password.

        Args:
            user_id: User ID
            password_data: Password update data

        Returns:
            Updated user

        Raises:
            NotFoundException: If user not found
            ValidationException: If current password is incorrect
        """
        user = self.get_user_by_id(user_id)

        # Verify current password
        if not verify_password(password_data.current_password, user.hashed_password):
            raise ValidationException(
                message="Current password is incorrect",
                field="current_password"
            )

        # Update password
        user.hashed_password = hash_password(password_data.new_password)

        return self.repository.update(user)

    def delete_user(self, user_id: int, soft: bool = True) -> bool:
        """
        Delete user.

        Args:
            user_id: User ID
            soft: Use soft delete if True

        Returns:
            True if deleted

        Raises:
            NotFoundException: If user not found
        """
        if not self.repository.exists(user_id):
            raise NotFoundException(
                message=f"User with ID {user_id} not found",
                resource_type="User",
                resource_id=user_id
            )

        return self.repository.delete(user_id, soft=soft)

    def deactivate_user(self, user_id: int) -> User:
        """
        Deactivate a user.

        Args:
            user_id: User ID

        Returns:
            Updated user

        Raises:
            NotFoundException: If user not found
        """
        user = self.get_user_by_id(user_id)
        user.is_active = False
        return self.repository.update(user)

    def activate_user(self, user_id: int) -> User:
        """
        Activate a user.

        Args:
            user_id: User ID

        Returns:
            Updated user

        Raises:
            NotFoundException: If user not found
        """
        user = self.get_user_by_id(user_id)
        user.is_active = True
        return self.repository.update(user)
