"""Consolidated Admin user management API endpoints."""

import io
from datetime import datetime
from typing import Annotated, Optional, Dict, Any, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.shared.constants import HTTP_STATUS_CODES, ERROR_MESSAGES, API_TAGS
from app.shared.responses import SuccessResponse, success_response
from app.shared.pagination import PaginationParams, PaginatedResponse, PageMetadata
from app.core.database import get_db
from .dependencies import get_admin_user_management_service
from .service import AdminUserManagementService
from .schemas import (
    AdminUserCreate, AdminUserUpdate, AdminUser, AdminUserFilters, AdminUsersList,
    AdminUserDetail, RolePermissionsList, SessionsList, AuditTrail, PasswordChangeRequest,
    BulkAdminAction, PermissionAssignment, AuditAction
)

# Import from the old user_management module that we're consolidating
from app.domains.admin.features.v1.auth.schemas import AdminUserResponse, AdminUserUpdateRequest, AdminDashboardStats
from app.domains.admin.features.v1.auth.service import AdminAuthService
from .dependencies import require_user_management_access, require_system_admin_access

router = APIRouter(prefix="/admin-users", tags=[API_TAGS.USER_MANAGEMENT])


# ========================================
# CONSOLIDATED ADMIN USER ENDPOINTS
# Merged from user_management and admin_user_management modules
# ========================================

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


@router.get("/", response_model=SuccessResponse[AdminUsersList])
async def get_admin_users(
    service: Annotated[AdminUserManagementService, Depends(get_admin_user_management_service)],
    pagination: Annotated[PaginationParams, Depends()],
    filters: Annotated[AdminUserFilters, Depends()],
    # Additional filters from old user_management module
    role: Optional[str] = Query(None, description="Filter by role"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search by email, first_name, or last_name"),
    current_user: dict = Depends(require_user_management_access),
    db: Session = Depends(get_db)
) -> SuccessResponse[AdminUsersList]:
    """
    Get paginated list of admin users with filtering options.
    
    Consolidated endpoint that supports filtering by role, status, department, 
    creation date, last login date, and search in name/email fields.
    """
    # Check permissions
    if not current_user.get("is_superuser", False):
        permissions = current_user.get("permissions", {})
        if not permissions.get("can_manage_users", False):
            raise HTTPException(
                status_code=HTTP_STATUS_CODES.FORBIDDEN,
                detail=ERROR_MESSAGES.ACCESS_DENIED
            )
    
    # Use the service from admin_user_management
    admin_users = service.get_admin_users(
        filters=filters,
        skip=pagination.skip,
        limit=pagination.limit
    )
    
    return SuccessResponse(
        data=admin_users,
        message=f"Retrieved {len(admin_users.users)} admin users"
    )


@router.get("/{admin_user_id}", response_model=SuccessResponse[AdminUserDetail])
async def get_admin_user(
    admin_user_id: str,
    service: Annotated[AdminUserManagementService, Depends(get_admin_user_management_service)]
) -> SuccessResponse[AdminUserDetail]:
    """
    Get detailed information about a specific admin user.
    
    Returns user profile, recent sessions, audit trail entries,
    and detailed permission information.
    """
    admin_user = service.get_admin_user(admin_user_id)
    
    if not admin_user:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.NOT_FOUND, 
            detail=ERROR_MESSAGES.ADMIN_USER_NOT_FOUND
        )
    
    return SuccessResponse(
        data=admin_user,
        message="Admin user details retrieved successfully"
    )


@router.post("/", response_model=SuccessResponse[AdminUser])
async def create_admin_user(
    user_data: AdminUserCreate,
    service: Annotated[AdminUserManagementService, Depends(get_admin_user_management_service)]
) -> SuccessResponse[AdminUser]:
    """
    Create a new admin user account.
    
    Creates a new admin user with specified role and permissions.
    User will receive a welcome email with temporary credentials
    if send_welcome_email is true.
    """
    new_admin = service.create_admin_user(user_data)
    
    return SuccessResponse(
        data=new_admin,
        message=f"Admin user created successfully. Welcome email {'sent' if user_data.send_welcome_email else 'not sent'}."
    )


@router.put("/{admin_user_id}", response_model=SuccessResponse[AdminUser])
async def update_admin_user(
    admin_user_id: str,
    update_data: AdminUserUpdate,
    service: Annotated[AdminUserManagementService, Depends(get_admin_user_management_service)]
) -> SuccessResponse[AdminUser]:
    """
    Update an existing admin user's information.
    
    Updates user profile, role, status, and other modifiable fields.
    Role changes will automatically update permissions.
    """
    updated_admin = service.update_admin_user(admin_user_id, update_data)
    
    return SuccessResponse(
        data=updated_admin,
        message="Admin user updated successfully"
    )


@router.delete("/{admin_user_id}", response_model=SuccessResponse[dict])
async def delete_admin_user(
    admin_user_id: str,
    service: Annotated[AdminUserManagementService, Depends(get_admin_user_management_service)]
) -> SuccessResponse[dict]:
    """
    Delete an admin user account (soft delete).
    
    Performs a soft delete, preserving audit trail and data integrity.
    The account is deactivated and marked for deletion.
    """
    success = service.delete_admin_user(admin_user_id)
    
    if not success:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST, 
            detail=ERROR_MESSAGES.ADMIN_USER_DELETE_FAILED
        )
    
    return SuccessResponse(
        data={"admin_user_id": admin_user_id, "deleted": True},
        message="Admin user deleted successfully"
    )


@router.get("/roles/permissions", response_model=SuccessResponse[RolePermissionsList])
async def get_role_permissions(
    service: Annotated[AdminUserManagementService, Depends(get_admin_user_management_service)]
) -> SuccessResponse[RolePermissionsList]:
    """
    Get all admin roles and their associated permissions.
    
    Returns comprehensive list of roles, their permissions,
    and available permissions for assignment.
    """
    roles_permissions = service.get_role_permissions()
    
    return SuccessResponse(
        data=roles_permissions,
        message="Roles and permissions retrieved successfully"
    )


@router.get("/sessions/active", response_model=SuccessResponse[SessionsList])
async def get_active_sessions(
    service: Annotated[AdminUserManagementService, Depends(get_admin_user_management_service)]
) -> SuccessResponse[SessionsList]:
    """
    Get all active admin user sessions.
    
    Returns list of currently active sessions with user information,
    IP addresses, locations, and session timing details.
    """
    sessions = service.get_active_sessions()
    
    return SuccessResponse(
        data=sessions,
        message="Active sessions retrieved successfully"
    )


@router.get("/audit/trail", response_model=SuccessResponse[AuditTrail])
async def get_audit_trail(
    service: Annotated[AdminUserManagementService, Depends(get_admin_user_management_service)],
    pagination: Annotated[PaginationParams, Depends()],
    admin_user_id: Optional[str] = Query(None, description="Filter by specific admin user"),
    action: Optional[AuditAction] = Query(None, description="Filter by action type"),
    start_date: Optional[datetime] = Query(None, description="Filter by start date"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date")
) -> SuccessResponse[AuditTrail]:
    """
    Get audit trail of admin user actions.
    
    Returns paginated audit log with filtering options.
    Includes action summaries and top active admin statistics.
    """
    audit_trail = service.get_audit_trail(
        admin_user_id=admin_user_id,
        action=action,
        start_date=start_date,
        end_date=end_date,
        skip=pagination.skip,
        limit=pagination.limit
    )
    
    return SuccessResponse(
        data=audit_trail,
        message="Audit trail retrieved successfully"
    )


@router.post("/{admin_user_id}/change-password", response_model=SuccessResponse[dict])
async def change_admin_password(
    admin_user_id: str,
    password_request: PasswordChangeRequest,
    service: Annotated[AdminUserManagementService, Depends(get_admin_user_management_service)]
) -> SuccessResponse[dict]:
    """
    Change an admin user's password.
    
    Requires current password verification and enforces
    password policy requirements for new password.
    """
    success = service.change_password(admin_user_id, password_request)
    
    if not success:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST, 
            detail=ERROR_MESSAGES.PASSWORD_CHANGE_FAILED
        )
    
    return SuccessResponse(
        data={"admin_user_id": admin_user_id, "password_changed": True},
        message="Password changed successfully"
    )


@router.post("/permissions/assign", response_model=SuccessResponse[dict])
async def assign_permissions(
    assignment: PermissionAssignment,
    service: Annotated[AdminUserManagementService, Depends(get_admin_user_management_service)]
) -> SuccessResponse[dict]:
    """
    Assign or revoke permissions for an admin user.
    
    Allows granular permission management beyond role-based permissions.
    Requires appropriate permissions to grant/revoke specific permissions.
    """
    success = service.assign_permissions(assignment)
    
    if not success:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST, 
            detail=ERROR_MESSAGES.PERMISSION_ASSIGNMENT_FAILED
        )
    
    return SuccessResponse(
        data={
            "admin_user_id": assignment.admin_user_id,
            "permissions_added": len(assignment.permissions_to_add),
            "permissions_removed": len(assignment.permissions_to_remove)
        },
        message="Permissions updated successfully"
    )


@router.post("/bulk-action", response_model=SuccessResponse[dict])
async def bulk_admin_action(
    bulk_action: BulkAdminAction,
    service: Annotated[AdminUserManagementService, Depends(get_admin_user_management_service)]
) -> SuccessResponse[dict]:
    """
    Perform bulk action on multiple admin users.
    
    Supports bulk activation, deactivation, suspension, and other
    administrative actions on multiple users simultaneously.
    """
    result = service.bulk_admin_action(bulk_action)
    
    return SuccessResponse(
        data=result,
        message=f"Bulk action '{bulk_action.action}' completed successfully"
    )


@router.get("/export/users")
async def export_admin_users(
    service: Annotated[AdminUserManagementService, Depends(get_admin_user_management_service)]
) -> StreamingResponse:
    """
    Export admin users list to Excel file.
    
    Generates a comprehensive Excel report containing all admin users
    with their roles, status, permissions, and activity information.
    """
    file_content = service.export_admin_users()
    
    headers = {
        "Content-Disposition": f"attachment; filename=admin_users_export_{int(datetime.utcnow().timestamp())}.txt"
    }
    
    return StreamingResponse(
        io.BytesIO(file_content.getvalue()),
        media_type="text/plain",
        headers=headers
    )


# ========================================
# ADDITIONAL ENDPOINTS FROM USER_MANAGEMENT MODULE
# ========================================

@router.get("/{admin_user_id}/sessions")
async def get_admin_user_sessions(
    admin_user_id: UUID,
    current_user: dict = Depends(require_user_management_access),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get admin user sessions."""
    # Users can view their own sessions, superusers can view any sessions
    if str(current_user["id"]) != str(admin_user_id) and not current_user.get("is_superuser", False):
        permissions = current_user.get("permissions", {})
        if not permissions.get("can_manage_users", False):
            raise HTTPException(
                status_code=HTTP_STATUS_CODES.FORBIDDEN,
                detail=ERROR_MESSAGES.ACCESS_DENIED
            )
    
    auth_service = AdminAuthService(db)
    sessions = await auth_service.get_user_sessions(admin_user_id)
    
    return success_response(
        data=sessions,
        message="User sessions retrieved successfully"
    )


@router.get("/{admin_user_id}/activity") 
async def get_admin_user_activity(
    admin_user_id: UUID,
    current_user: dict = Depends(require_user_management_access),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get admin user activity log."""
    # Users can view their own activity, superusers can view any activity
    if str(current_user["id"]) != str(admin_user_id) and not current_user.get("is_superuser", False):
        permissions = current_user.get("permissions", {})
        if not permissions.get("can_manage_users", False):
            raise HTTPException(
                status_code=HTTP_STATUS_CODES.FORBIDDEN,
                detail=ERROR_MESSAGES.ACCESS_DENIED
            )
    
    auth_service = AdminAuthService(db)
    activity = await auth_service.get_user_activity(admin_user_id)
    
    return success_response(
        data=activity,
        message="User activity retrieved successfully"
    )


@router.post("/{admin_user_id}/activate")
async def activate_admin_user(
    admin_user_id: UUID,
    current_user: dict = Depends(require_system_admin_access),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Activate admin user."""
    # Only superusers and users with system admin access can activate users
    if not current_user.get("is_superuser", False):
        permissions = current_user.get("permissions", {})
        if not permissions.get("can_manage_system", False):
            raise HTTPException(
                status_code=HTTP_STATUS_CODES.FORBIDDEN,
                detail=ERROR_MESSAGES.ACCESS_DENIED
            )
    
    auth_service = AdminAuthService(db)
    user = await auth_service.activate_user(admin_user_id)
    
    if not user:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.NOT_FOUND,
            detail=ERROR_MESSAGES.USER_NOT_FOUND
        )
    
    return success_response(
        data=AdminUserResponse.from_orm(user).dict(),
        message="User activated successfully"
    )


@router.post("/{admin_user_id}/deactivate")
async def deactivate_admin_user(
    admin_user_id: UUID,
    current_user: dict = Depends(require_system_admin_access),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Deactivate admin user."""
    # Only superusers and users with system admin access can deactivate users
    if not current_user.get("is_superuser", False):
        permissions = current_user.get("permissions", {})
        if not permissions.get("can_manage_system", False):
            raise HTTPException(
                status_code=HTTP_STATUS_CODES.FORBIDDEN,
                detail=ERROR_MESSAGES.ACCESS_DENIED
            )
    
    # Prevent self-deactivation
    if str(current_user["id"]) == str(admin_user_id):
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )
    
    auth_service = AdminAuthService(db)
    user = await auth_service.deactivate_user(admin_user_id)
    
    if not user:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.NOT_FOUND,
            detail=ERROR_MESSAGES.USER_NOT_FOUND
        )
    
    return success_response(
        data=AdminUserResponse.from_orm(user).dict(),
        message="User deactivated successfully"
    )