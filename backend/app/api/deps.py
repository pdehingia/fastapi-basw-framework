"""
Common API dependencies.
Reusable dependencies for FastAPI endpoints.
"""

from typing import Optional
from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.features.users.models import User
from app.features.users.repository import UserRepository
from app.core.exceptions import UnauthorizedException


def get_current_user(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user.

    Args:
        user_id: User ID from JWT token
        db: Database session

    Returns:
        Current user model

    Raises:
        UnauthorizedException: If user not found or inactive
    """
    user_repo = UserRepository(db)
    user = user_repo.get_by_id(user_id)

    if not user:
        raise UnauthorizedException("User not found")

    if not user.is_active:
        raise UnauthorizedException("User account is inactive")

    return user


def get_current_active_superuser(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current user and verify they are a superuser.

    Args:
        current_user: Current authenticated user

    Returns:
        Current user if superuser

    Raises:
        ForbiddenException: If user is not a superuser
    """
    from app.core.exceptions import ForbiddenException

    if not current_user.is_superuser:
        raise ForbiddenException(
            message="Superuser access required",
            required_permission="superuser"
        )

    return current_user


def get_optional_current_user(
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
) -> Optional[User]:
    """
    Get current user if authenticated, None otherwise.

    Args:
        db: Database session
        authorization: Authorization header

    Returns:
        Current user or None
    """
    if not authorization:
        return None

    try:
        user_id = get_current_user_id(authorization)
        user_repo = UserRepository(db)
        user = user_repo.get_by_id(user_id)

        if user and user.is_active:
            return user
    except Exception:
        pass

    return None
