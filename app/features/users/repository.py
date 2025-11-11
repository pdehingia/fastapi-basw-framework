"""
User repository for database operations.
"""

from typing import Optional
from sqlalchemy.orm import Session

from app.shared.base_repository import BaseRepository
from app.features.users.models import User


class UserRepository(BaseRepository[User]):
    """Repository for User model operations."""

    def __init__(self, db: Session):
        super().__init__(User, db)

    def get_by_email(self, email: str) -> Optional[User]:
        """
        Get user by email address.

        Args:
            email: Email address

        Returns:
            User or None if not found
        """
        return self.db.query(User).filter(
            User.email == email.lower(),
            User.is_deleted == False
        ).first()

    def get_by_username(self, username: str) -> Optional[User]:
        """
        Get user by username.

        Args:
            username: Username

        Returns:
            User or None if not found
        """
        return self.db.query(User).filter(
            User.username == username.lower(),
            User.is_deleted == False
        ).first()

    def email_exists(self, email: str, exclude_id: Optional[int] = None) -> bool:
        """
        Check if email already exists.

        Args:
            email: Email to check
            exclude_id: Optional user ID to exclude (for updates)

        Returns:
            True if email exists, False otherwise
        """
        query = self.db.query(User).filter(
            User.email == email.lower(),
            User.is_deleted == False
        )

        if exclude_id:
            query = query.filter(User.id != exclude_id)

        return query.first() is not None

    def username_exists(self, username: str, exclude_id: Optional[int] = None) -> bool:
        """
        Check if username already exists.

        Args:
            username: Username to check
            exclude_id: Optional user ID to exclude (for updates)

        Returns:
            True if username exists, False otherwise
        """
        query = self.db.query(User).filter(
            User.username == username.lower(),
            User.is_deleted == False
        )

        if exclude_id:
            query = query.filter(User.id != exclude_id)

        return query.first() is not None

    def get_active_users(self, skip: int = 0, limit: int = 100):
        """
        Get all active users.

        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of active users
        """
        return self.db.query(User).filter(
            User.is_active == True,
            User.is_deleted == False
        ).offset(skip).limit(limit).all()
