"""Admin user management API endpoints."""

from typing import List, Optional, Any, Dict
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from .dependencies import require_user_management_access, require_system_admin_access
from app.domains.admin.features.v1.auth.schemas import AdminUserResponse
from app.domains.admin.features.v1.auth.schemas import AdminUserUpdateRequest
from app.domains.admin.features.v1.auth.schemas import AdminRegisterRequest
from app.domains.admin.features.v1.auth.schemas import ChangePasswordRequest
from app.domains.admin.features.v1.auth.schemas import AdminDashboardStats
from app.domains.admin.features.v1.auth.service import AdminAuthService
from app.shared.exceptions import ValidationException
from app.shared.schemas.base import BaseResponse
from app.shared.pagination import PaginationParams, PaginatedResponse
from app.shared.responses import success_response

router = APIRouter(prefix="/users", tags=["admin-users"])


@router.get("/dashboard")
async def get_dashboard_stats(
    current_user: dict = Depends(require_user_management_access),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get admin dashboard statistics."""
    auth_service = AdminAuthService(db)
    stats = await auth_service.get_dashboard_stats()
    
    return success_response(
        data=stats,
        message="Dashboard statistics retrieved successfully"
    )


@router.get("/")
async def list_admin_users(
    current_user: dict = Depends(require_user_management_access),
    pagination: PaginationParams = Depends(),
    role: Optional[str] = Query(None, description="Filter by role"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search by email, first_name, or last_name"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """List admin users with pagination and filtering."""
    # Check permissions - use is_superuser instead of role
    if not current_user.get("is_superuser", False):
        # Allow users with user management permission
        permissions = current_user.get("permissions", {})
        if not permissions.get("can_manage_users", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
    
    from app.shared.repositories.user import AdminUserRepository
    repo = AdminUserRepository(db)
    
    # Calculate skip and limit for pagination
    skip = (pagination.page - 1) * pagination.page_size
    
    # Get users with basic pagination
    # For now, just get all active users (we'll improve filtering later)
    if is_active is not None:
        if is_active:
            all_users = repo.filter_by(is_active=True)
        else:
            all_users = repo.filter_by(is_active=False)
    else:
        all_users = repo.get_all()
    
    # Simple search filter if provided
    if search:
        search_lower = search.lower()
        all_users = [
            user for user in all_users 
            if (user.email and search_lower in user.email.lower()) or 
               (user.full_name and search_lower in user.full_name.lower())
        ]
    
    # Apply pagination
    total = len(all_users)
    users = all_users[skip:skip + pagination.page_size]
    total_pages = (total + pagination.page_size - 1) // pagination.page_size
    
    # Create page metadata
    from app.shared.pagination import PageMetadata
    metadata = PageMetadata(
        page=pagination.page,
        page_size=pagination.page_size,
        total_items=total,
        total_pages=total_pages,
        has_next=pagination.page < total_pages,
        has_previous=pagination.page > 1
    )
    
    paginated_data = PaginatedResponse[AdminUserResponse](
        items=[AdminUserResponse.from_orm(user) for user in users],
        metadata=metadata
    )
    
    return success_response(
        data=paginated_data.dict(),
        message="Users retrieved successfully"
    )


@router.get("/{user_id}")
async def get_admin_user(
    user_id: UUID,
    current_user: dict = Depends(require_user_management_access),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get admin user by ID."""
    # Users can view their own profile, superusers can view any profile
    if str(current_user["id"]) != str(user_id) and not current_user.get("is_superuser", False):
        # Check if they have user management permission
        permissions = current_user.get("permissions", {})
        if not permissions.get("can_manage_users", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
    
    auth_service = AdminAuthService(db)
    user = await auth_service.get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return success_response(
        data=AdminUserResponse.from_orm(user).dict(),
        message="User retrieved successfully"
    )


@router.put("/{user_id}")
async def update_admin_user(
    user_id: UUID,
    user_data: AdminUserUpdateRequest,
    current_user: dict = Depends(require_user_management_access),
    db: Session = Depends(get_db)
):
    """Update admin user."""
    # Users can update their own profile (except role), superusers can update any profile
    if str(current_user["id"]) != str(user_id) and not current_user.get("is_superuser", False):
        # Check if they have user management permission
        permissions = current_user.get("permissions", {})
        if not permissions.get("can_manage_users", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
    
    # Non-superusers cannot change role or is_active
    if str(current_user["id"]) == str(user_id) and not current_user.get("is_superuser", False):
        if user_data.role is not None or user_data.is_active is not None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot modify role or active status"
            )
    
    try:
        auth_service = AdminAuthService(db)
        updated_user = await auth_service.update_admin_user(user_id, user_data)
        
        return success_response(
            data=AdminUserResponse.from_orm(updated_user).dict(),
            message="User updated successfully"
        )
        
    except ValidationException as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{user_id}/change-password")
async def change_user_password(
    user_id: UUID,
    password_data: ChangePasswordRequest,
    current_user: dict = Depends(require_user_management_access),
    db: Session = Depends(get_db)
):
    """Change user password."""
    # Users can change their own password
    if str(current_user["id"]) != str(user_id):
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
        
        return success_response(
            data={},
            message="Password changed successfully"
        )
        
    except ValidationException as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{user_id}/deactivate")
async def deactivate_user(
    user_id: UUID,
    current_user: dict = Depends(require_user_management_access),
    db: Session = Depends(get_db)
):
    """Deactivate admin user."""
    # Only superuser can deactivate users
    if not current_user.get("is_superuser", False):
        # Check if they have user management permission
        permissions = current_user.get("permissions", {})
        if not permissions.get("can_manage_users", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
    
    # Cannot deactivate yourself
    if str(current_user["id"]) == str(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )
    
    try:
        auth_service = AdminAuthService(db)
        user = await auth_service.deactivate_user(user_id)
        
        return success_response(
            data=AdminUserResponse.from_orm(user).dict(),
            message="User deactivated successfully"
        )
        
    except ValidationException as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{user_id}/activate")
async def activate_user(
    user_id: UUID,
    current_user: dict = Depends(require_user_management_access),
    db: Session = Depends(get_db)
):
    """Activate admin user."""
    # Only superuser can activate users
    if not current_user.get("is_superuser", False):
        # Check if they have user management permission
        permissions = current_user.get("permissions", {})
        if not permissions.get("can_manage_users", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
    
    try:
        auth_service = AdminAuthService(db)
        user = await auth_service.activate_user(user_id)
        
        return success_response(
            data=AdminUserResponse.from_orm(user).dict(),
            message="User activated successfully"
        )
        
    except ValidationException as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{user_id}/sessions")
async def get_user_sessions(
    user_id: UUID,
    current_user: dict = Depends(require_user_management_access),
    db: Session = Depends(get_db)
):
    """Get user active sessions."""
    # Users can view their own sessions, superusers can view any sessions
    if str(current_user["id"]) != str(user_id) and not current_user.get("is_superuser", False):
        # Check if they have user management permission
        permissions = current_user.get("permissions", {})
        if not permissions.get("can_manage_users", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
    
    auth_service = AdminAuthService(db)
    sessions = await auth_service.get_user_sessions(user_id)
    
    return success_response(
        data={"sessions": sessions},
        message="User sessions retrieved successfully"
    )


@router.get("/{user_id}/activity")
async def get_user_activity(
    user_id: UUID,
    current_user: dict = Depends(require_user_management_access),
    db: Session = Depends(get_db)
):
    """Get user activity logs."""
    # Users can view their own activity, superusers can view any activity
    if str(current_user["id"]) != str(user_id) and not current_user.get("is_superuser", False):
        # Check if they have user management permission
        permissions = current_user.get("permissions", {})
        if not permissions.get("can_manage_users", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
    
    auth_service = AdminAuthService(db)
    activity_logs = await auth_service.get_user_activity_logs(user_id)
    
    return success_response(
        data={"activity_logs": activity_logs},
        message="User activity retrieved successfully"
    )


@router.post("/")
async def create_admin_user(
    user_data: AdminRegisterRequest,
    current_user: dict = Depends(require_user_management_access),
    db: Session = Depends(get_db)
):
    """Create a new admin user."""
    # Only superusers can create users
    if not current_user.get("is_superuser", False):
        # Check if they have user management permission
        permissions = current_user.get("permissions", {})
        if not permissions.get("can_manage_users", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to create users"
            )
    
    try:
        auth_service = AdminAuthService(db)
        new_user = await auth_service.register_admin_user(user_data)
        
        return success_response(
            data=AdminUserResponse.from_orm(new_user).dict(),
            message="User created successfully"
        )
        
    except ValidationException as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{user_id}")
async def delete_admin_user(
    user_id: UUID,
    current_user: dict = Depends(require_user_management_access),
    db: Session = Depends(get_db)
):
    """Delete admin user."""
    # Only superusers can delete users
    if not current_user.get("is_superuser", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to delete users"
        )
    
    # Cannot delete yourself
    if str(current_user["id"]) == str(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    try:
        auth_service = AdminAuthService(db)
        success = await auth_service.delete_admin_user(user_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="User not found")
        
        return success_response(
            data={"deleted_user_id": str(user_id)},
            message="User deleted successfully"
        )
        
    except ValidationException as e:
        raise HTTPException(status_code=400, detail=str(e))
