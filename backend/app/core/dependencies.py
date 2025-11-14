"""
Global dependencies for FastAPI dependency injection.
Common dependencies that can be used across the application.
"""

import uuid
from typing import Optional, Union
from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_token
from app.core.exceptions import UnauthorizedException
from app.shared.models.user import AdminUser
from app.shared.repositories.user import AdminUserRepository


async def get_correlation_id(
    x_correlation_id: Optional[str] = Header(None)
) -> Optional[str]:
    """
    Extract correlation ID from request header.

    Args:
        x_correlation_id: Correlation ID from header

    Returns:
        Correlation ID string
    """
    return x_correlation_id


async def get_current_user_id(
    authorization: Optional[str] = Header(None)
) -> str:
    """
    Extract user ID from JWT token.

    Args:
        authorization: Authorization header with Bearer token

    Returns:
        User ID as UUID string

    Raises:
        UnauthorizedException: If token is invalid or missing
    """
    if not authorization:
        raise UnauthorizedException("Missing authorization header")

    # Extract token from "Bearer <token>"
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise UnauthorizedException("Invalid authentication scheme")
    except ValueError:
        raise UnauthorizedException("Invalid authorization header format")

    # Decode token
    payload = decode_token(token)
    if not payload:
        raise UnauthorizedException("Invalid or expired token")

    # Extract user ID
    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedException("Invalid token payload")

    # Validate UUID format
    try:
        uuid.UUID(user_id)  # This will raise ValueError if not a valid UUID
        return user_id
    except (ValueError, TypeError):
        raise UnauthorizedException("Invalid user ID in token")


async def get_optional_current_user_id(
    authorization: Optional[str] = Header(None)
) -> Optional[str]:
    """
    Extract user ID from JWT token (optional).
    Returns None if no token provided.

    Args:
        authorization: Authorization header with Bearer token

    Returns:
        User ID as UUID string or None
    """
    if not authorization:
        return None

    try:
        return await get_current_user_id(authorization)
    except UnauthorizedException:
        return None


def require_admin(
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> str:
    """
    Dependency that requires admin privileges.

    Args:
        current_user_id: Current user ID from token
        db: Database session

    Returns:
        User ID

    Raises:
        HTTPException: If user is not admin
    """
    # This is a placeholder - implement based on your User model
    # Example:
    # user = db.query(User).filter(User.id == current_user_id).first()
    # if not user or not user.is_admin:
    #     raise HTTPException(status_code=403, detail="Admin access required")

    return current_user_id


def require_superuser(
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> str:
    """
    Dependency that requires superuser privileges.

    Args:
        current_user_id: Current user ID from token
        db: Database session

    Returns:
        User ID

    Raises:
        HTTPException: If user is not superuser
    """
    # This is a placeholder - implement based on your User model
    return current_user_id


async def get_current_admin_user(
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> AdminUser:
    """
    Get current admin user from token.

    Args:
        current_user_id: Current user ID from token as UUID string
        db: Database session

    Returns:
        AdminUser object

    Raises:
        HTTPException: If user is not found or not an admin
    """
    admin_repo = AdminUserRepository(db)
    admin_user = admin_repo.get(current_user_id)
    
    if not admin_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in token"
        )
    
    if not admin_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin account is deactivated"
        )
    
    return admin_user
