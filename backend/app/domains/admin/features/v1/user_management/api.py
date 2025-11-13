"""Admin user management API endpoints."""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from .dependencies import require_user_management_access, require_system_admin_access
from app.domains.admin.features.v1.auth.schemas import (
    AdminUserResponse,
    AdminUserUpdateRequest,
    ChangePasswordRequest,
    AdminDashboardStats,
)
from app.domains.admin.features.v1.auth.service import AdminAuthService
from app.shared.exceptions import ValidationException
from app.shared.schemas.base import BaseResponse
from app.shared.pagination import PaginationParams, PaginatedResponse

router = APIRouter(prefix="/users", tags=["admin-users"])


@router.get("/dashboard", response_model=AdminDashboardStats)
async def get_dashboard_stats(
    current_user: dict = Depends(require_user_management_access),
    db: Session = Depends(get_db)
) -> AdminDashboardStats:
    """Get admin dashboard statistics."""
    auth_service = AdminAuthService(db)
    stats = await auth_service.get_dashboard_stats()
    
    return AdminDashboardStats(**stats)


@router.get("/", response_model=PaginatedResponse[AdminUserResponse])
async def list_admin_users(
    current_user: dict = Depends(require_user_management_access),
    pagination: PaginationParams = Depends(),
    role: Optional[str] = Query(None, description="Filter by role"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search by email, first_name, or last_name"),
    db: Session = Depends(get_db)
) -> PaginatedResponse[AdminUserResponse]:
    """List admin users with pagination and filtering."""
    # Only super_admin and admin can list users
    if current_user["role"] not in ["super_admin", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    from app.shared.repositories.user import AdminUserRepository
    repo = AdminUserRepository(db)
    
    # Build filters
    filters = {}
    if role:
        filters["role"] = role
    if is_active is not None:
        filters["is_active"] = is_active
    
    # Get paginated users
    users = repo.get_paginated(
        page=pagination.page,
        size=pagination.size,
        filters=filters,
        search_term=search,
        search_fields=["email", "first_name", "last_name"]
    )
    
    return PaginatedResponse[AdminUserResponse](
        items=[AdminUserResponse.from_orm(user) for user in users.items],
        total=users.total,
        page=users.page,
        size=users.size,
        pages=users.pages
    )


@router.get("/{user_id}", response_model=AdminUserResponse)
async def get_admin_user(
    user_id: UUID,
    current_user: dict = Depends(require_user_management_access),
    db: Session = Depends(get_db)
) -> AdminUserResponse:
    """Get admin user by ID."""
    # Users can view their own profile, admins can view any profile
    if current_user["id"] != user_id and current_user["role"] not in ["super_admin", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    auth_service = AdminAuthService(db)
    user = await auth_service.get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return AdminUserResponse.from_orm(user)


@router.put("/{user_id}", response_model=AdminUserResponse)
async def update_admin_user(
    user_id: UUID,
    user_data: AdminUserUpdateRequest,
    current_user: dict = Depends(require_user_management_access),
    db: Session = Depends(get_db)
) -> AdminUserResponse:
    """Update admin user."""
    # Users can update their own profile (except role), admins can update any profile
    if current_user["id"] != user_id and current_user["role"] not in ["super_admin", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    # Non-admins cannot change role or is_active
    if current_user["id"] == user_id and current_user["role"] not in ["super_admin", "admin"]:
        if user_data.role is not None or user_data.is_active is not None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot modify role or active status"
            )
    
    try:
        auth_service = AdminAuthService(db)
        updated_user = await auth_service.update_admin_user(user_id, user_data)
        
        return AdminUserResponse.from_orm(updated_user)
        
    except ValidationException as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{user_id}/change-password", response_model=BaseResponse)
async def change_user_password(
    user_id: UUID,
    password_data: ChangePasswordRequest,
    current_user: dict = Depends(require_user_management_access),
    db: Session = Depends(get_db)
) -> BaseResponse:
    """Change user password."""
    # Users can change their own password
    if current_user["id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only change your own password"
        )
    
    try:
        auth_service = AdminAuthService(db)
        await auth_service.change_password(
            user_id, 
            password_data.current_password, 
            password_data.new_password
        )
        
        return BaseResponse(message="Password changed successfully")
        
    except ValidationException as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{user_id}/deactivate", response_model=AdminUserResponse)
async def deactivate_user(
    user_id: UUID,
    current_user: dict = Depends(require_user_management_access),
    db: Session = Depends(get_db)
) -> AdminUserResponse:
    """Deactivate admin user."""
    # Only super_admin and admin can deactivate users
    if current_user["role"] not in ["super_admin", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    # Cannot deactivate yourself
    if current_user["id"] == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )
    
    try:
        auth_service = AdminAuthService(db)
        user = await auth_service.deactivate_user(user_id)
        
        return AdminUserResponse.from_orm(user)
        
    except ValidationException as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{user_id}/activate", response_model=AdminUserResponse)
async def activate_user(
    user_id: UUID,
    current_user: dict = Depends(require_user_management_access),
    db: Session = Depends(get_db)
) -> AdminUserResponse:
    """Activate admin user."""
    # Only super_admin and admin can activate users
    if current_user["role"] not in ["super_admin", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    try:
        auth_service = AdminAuthService(db)
        user = await auth_service.activate_user(user_id)
        
        return AdminUserResponse.from_orm(user)
        
    except ValidationException as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{user_id}/sessions")
async def get_user_sessions(
    user_id: UUID,
    current_user: dict = Depends(require_user_management_access),
    db: Session = Depends(get_db)
):
    """Get user active sessions."""
    # Users can view their own sessions, admins can view any sessions
    if current_user["id"] != user_id and current_user["role"] not in ["super_admin", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    auth_service = AdminAuthService(db)
    sessions = await auth_service.get_user_sessions(user_id)
    
    return {"sessions": sessions}


@router.get("/{user_id}/activity")
async def get_user_activity(
    user_id: UUID,
    current_user: dict = Depends(require_user_management_access),
    db: Session = Depends(get_db)
):
    """Get user activity logs."""
    # Users can view their own activity, admins can view any activity
    if current_user["id"] != user_id and current_user["role"] not in ["super_admin", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    auth_service = AdminAuthService(db)
    activity_logs = await auth_service.get_user_activity_logs(user_id)
    
    return {"activity_logs": activity_logs}
