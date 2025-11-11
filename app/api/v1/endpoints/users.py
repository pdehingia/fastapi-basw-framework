"""
User management endpoints.
"""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user, get_current_active_superuser
from app.features.users.service import UserService
from app.features.users.models import User
from app.features.users.schemas import (
    UserResponse,
    UserListResponse,
    UserUpdate,
    UserPasswordUpdate
)
from app.shared.pagination import PaginationParams, paginate, PaginatedResponse
from app.shared.responses import MessageResponse, DeletedResponse

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Get current user profile.

    Args:
        current_user: Current authenticated user

    Returns:
        Current user data
    """
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user profile.

    Args:
        user_data: Update data
        current_user: Current authenticated user
        db: Database session

    Returns:
        Updated user data
    """
    service = UserService(db)
    updated_user = service.update_user(current_user.id, user_data)
    return updated_user


@router.put("/me/password", response_model=MessageResponse)
async def update_current_user_password(
    password_data: UserPasswordUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user password.

    Args:
        password_data: Password update data
        current_user: Current authenticated user
        db: Database session

    Returns:
        Success message
    """
    service = UserService(db)
    service.update_password(current_user.id, password_data)

    return MessageResponse(
        success=True,
        message="Password updated successfully"
    )


@router.get("", response_model=PaginatedResponse[UserListResponse])
async def get_users(
    pagination: PaginationParams = Depends(),
    active_only: bool = Query(False, description="Return only active users"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get list of users (paginated).

    Args:
        pagination: Pagination parameters
        active_only: Filter for active users only
        current_user: Current authenticated user
        db: Database session

    Returns:
        Paginated list of users
    """
    service = UserService(db)

    # Build query
    from app.features.users.models import User as UserModel
    query = db.query(UserModel).filter(UserModel.is_deleted == False)

    if active_only:
        query = query.filter(UserModel.is_active == True)

    # Paginate
    result = paginate(query, pagination, UserListResponse)
    return result


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user by ID.

    Args:
        user_id: User ID
        current_user: Current authenticated user
        db: Database session

    Returns:
        User data
    """
    service = UserService(db)
    user = service.get_user_by_id(user_id)
    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    current_user: User = Depends(get_current_active_superuser),
    db: Session = Depends(get_db)
):
    """
    Update user (admin only).

    Args:
        user_id: User ID
        user_data: Update data
        current_user: Current authenticated superuser
        db: Database session

    Returns:
        Updated user data
    """
    service = UserService(db)
    updated_user = service.update_user(user_id, user_data)
    return updated_user


@router.delete("/{user_id}", response_model=DeletedResponse)
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_active_superuser),
    db: Session = Depends(get_db)
):
    """
    Delete user (admin only).

    Args:
        user_id: User ID
        current_user: Current authenticated superuser
        db: Database session

    Returns:
        Success message
    """
    service = UserService(db)
    service.delete_user(user_id, soft=True)

    return DeletedResponse(
        success=True,
        message="User deleted successfully",
        id=user_id
    )


@router.post("/{user_id}/deactivate", response_model=UserResponse)
async def deactivate_user(
    user_id: int,
    current_user: User = Depends(get_current_active_superuser),
    db: Session = Depends(get_db)
):
    """
    Deactivate user (admin only).

    Args:
        user_id: User ID
        current_user: Current authenticated superuser
        db: Database session

    Returns:
        Updated user data
    """
    service = UserService(db)
    user = service.deactivate_user(user_id)
    return user


@router.post("/{user_id}/activate", response_model=UserResponse)
async def activate_user(
    user_id: int,
    current_user: User = Depends(get_current_active_superuser),
    db: Session = Depends(get_db)
):
    """
    Activate user (admin only).

    Args:
        user_id: User ID
        current_user: Current authenticated superuser
        db: Database session

    Returns:
        Updated user data
    """
    service = UserService(db)
    user = service.activate_user(user_id)
    return user
