"""Admin user management schemas."""

from datetime import datetime
from typing import Dict, List, Optional, Any
from enum import Enum
from pydantic import BaseModel, Field, EmailStr, validator

from app.shared.pagination import PaginatedResponse


# Enums
class AdminRole(str, Enum):
    """Admin user roles with hierarchical permissions."""
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    MODERATOR = "moderator"
    SUPPORT_AGENT = "support_agent"
    ANALYST = "analyst"


class AdminStatus(str, Enum):
    """Admin user account status."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"


class PermissionCategory(str, Enum):
    """Permission categories for granular access control."""
    USER_MANAGEMENT = "user_management"
    BOOKING_MANAGEMENT = "booking_management"
    PAYMENT_MANAGEMENT = "payment_management"
    CONTENT_MODERATION = "content_moderation"
    ARTIST_VERIFICATION = "artist_verification"
    SUPPORT_MANAGEMENT = "support_management"
    ANALYTICS_REPORTING = "analytics_reporting"
    SYSTEM_CONFIG = "system_config"
    ADMIN_MANAGEMENT = "admin_management"


class AuditAction(str, Enum):
    """Audit trail action types."""
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    LOGIN = "login"
    LOGOUT = "logout"
    PASSWORD_CHANGE = "password_change"
    ROLE_CHANGE = "role_change"
    PERMISSION_CHANGE = "permission_change"
    ACCOUNT_LOCK = "account_lock"
    ACCOUNT_UNLOCK = "account_unlock"


# Core Models
class AdminUserBase(BaseModel):
    """Base admin user model."""
    email: EmailStr = Field(description="Admin email address")
    first_name: str = Field(min_length=1, max_length=50, description="First name")
    last_name: str = Field(min_length=1, max_length=50, description="Last name")
    role: AdminRole = Field(description="Admin role")
    department: Optional[str] = Field(None, max_length=100, description="Department")
    phone: Optional[str] = Field(None, pattern="^\\+?[1-9]\\d{1,14}$", description="Phone number")


class AdminUserCreate(AdminUserBase):
    """Schema for creating a new admin user."""
    password: str = Field(min_length=8, description="Temporary password (must be changed on first login)")
    send_welcome_email: bool = Field(True, description="Send welcome email with login instructions")


class AdminUserUpdate(BaseModel):
    """Schema for updating admin user information."""
    first_name: Optional[str] = Field(None, min_length=1, max_length=50, description="First name")
    last_name: Optional[str] = Field(None, min_length=1, max_length=50, description="Last name")
    role: Optional[AdminRole] = Field(None, description="Admin role")
    status: Optional[AdminStatus] = Field(None, description="Account status")
    department: Optional[str] = Field(None, max_length=100, description="Department")
    phone: Optional[str] = Field(None, pattern="^\\+?[1-9]\\d{1,14}$", description="Phone number")


class AdminUser(AdminUserBase):
    """Complete admin user information."""
    id: str = Field(description="Unique admin user ID")
    status: AdminStatus = Field(description="Account status")
    created_at: datetime = Field(description="Account creation date")
    last_login: Optional[datetime] = Field(None, description="Last login timestamp")
    login_count: int = Field(description="Total login count")
    failed_login_attempts: int = Field(description="Failed login attempts since last success")
    account_locked_until: Optional[datetime] = Field(None, description="Account lock expiry time")
    password_changed_at: Optional[datetime] = Field(None, description="Last password change")
    must_change_password: bool = Field(description="Must change password on next login")
    two_factor_enabled: bool = Field(description="Two-factor authentication enabled")
    created_by: str = Field(description="Admin who created this account")
    last_updated_by: Optional[str] = Field(None, description="Admin who last updated this account")
    permissions: List[str] = Field(description="Granted permissions")

    class Config:
        from_attributes = True


class Permission(BaseModel):
    """Permission definition."""
    id: str = Field(description="Unique permission identifier")
    name: str = Field(description="Permission name")
    description: str = Field(description="Permission description")
    category: PermissionCategory = Field(description="Permission category")
    is_dangerous: bool = Field(description="Whether this permission requires extra caution")


class RolePermissions(BaseModel):
    """Role with associated permissions."""
    role: AdminRole = Field(description="Admin role")
    description: str = Field(description="Role description")
    permissions: List[Permission] = Field(description="Permissions granted to this role")
    can_grant_permissions: List[str] = Field(description="Permissions this role can grant to others")
    user_count: int = Field(description="Number of users with this role")


class AdminUserSession(BaseModel):
    """Admin user active session."""
    session_id: str = Field(description="Session identifier")
    admin_user_id: str = Field(description="Admin user ID")
    ip_address: str = Field(description="IP address")
    user_agent: str = Field(description="Browser user agent")
    location: Optional[str] = Field(None, description="Approximate location")
    started_at: datetime = Field(description="Session start time")
    last_activity: datetime = Field(description="Last activity timestamp")
    expires_at: datetime = Field(description="Session expiry time")
    is_current: bool = Field(description="Whether this is the current session")


class AuditLogEntry(BaseModel):
    """Audit trail entry."""
    id: str = Field(description="Unique audit entry ID")
    admin_user_id: str = Field(description="Admin who performed the action")
    admin_email: str = Field(description="Admin email for reference")
    action: AuditAction = Field(description="Action performed")
    resource_type: str = Field(description="Type of resource affected")
    resource_id: Optional[str] = Field(None, description="ID of affected resource")
    details: Dict[str, Any] = Field(description="Additional action details")
    ip_address: str = Field(description="IP address of admin")
    user_agent: Optional[str] = Field(None, description="Browser user agent")
    timestamp: datetime = Field(description="When the action occurred")
    success: bool = Field(description="Whether the action succeeded")
    error_message: Optional[str] = Field(None, description="Error message if action failed")


class PasswordChangeRequest(BaseModel):
    """Password change request."""
    current_password: str = Field(description="Current password")
    new_password: str = Field(min_length=8, description="New password")
    confirm_password: str = Field(description="Password confirmation")

    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v


class AdminUserFilters(BaseModel):
    """Filters for admin user listing."""
    role: Optional[AdminRole] = Field(None, description="Filter by role")
    status: Optional[AdminStatus] = Field(None, description="Filter by status")
    department: Optional[str] = Field(None, description="Filter by department")
    created_after: Optional[datetime] = Field(None, description="Filter by creation date (after)")
    created_before: Optional[datetime] = Field(None, description="Filter by creation date (before)")
    last_login_after: Optional[datetime] = Field(None, description="Filter by last login (after)")
    search: Optional[str] = Field(None, description="Search in name or email")


# Response Models
class AdminUsersList(BaseModel):
    """Paginated admin users list response."""
    users: List[AdminUser] = Field(description="List of admin users")
    total_count: int = Field(description="Total number of admin users")
    active_count: int = Field(description="Number of active admin users")
    role_distribution: Dict[str, int] = Field(description="Count of users per role")
    recent_registrations: int = Field(description="New registrations in last 30 days")


class AdminUserDetail(AdminUser):
    """Detailed admin user information."""
    recent_sessions: List[AdminUserSession] = Field(description="Recent login sessions")
    recent_audit_entries: List[AuditLogEntry] = Field(description="Recent audit trail entries")
    permissions_detailed: List[Permission] = Field(description="Detailed permission information")


class RolePermissionsList(BaseModel):
    """List of all roles and their permissions."""
    roles: List[RolePermissions] = Field(description="All admin roles with permissions")
    available_permissions: List[Permission] = Field(description="All available permissions")
    total_admins: int = Field(description="Total number of admin users")


class SessionsList(BaseModel):
    """Admin user sessions list."""
    sessions: List[AdminUserSession] = Field(description="Active sessions")
    total_active_sessions: int = Field(description="Total active sessions")
    unique_users_active: int = Field(description="Number of unique users with active sessions")


class AuditTrail(BaseModel):
    """Audit trail response."""
    entries: List[AuditLogEntry] = Field(description="Audit log entries")
    total_entries: int = Field(description="Total number of audit entries")
    date_range: Dict[str, datetime] = Field(description="Date range of entries")
    action_summary: Dict[str, int] = Field(description="Count of actions by type")
    top_active_admins: List[Dict[str, Any]] = Field(description="Most active admin users")


# Request Models
class BulkAdminAction(BaseModel):
    """Bulk action on admin users."""
    admin_user_ids: List[str] = Field(description="List of admin user IDs")
    action: str = Field(description="Action to perform (activate, deactivate, suspend)")
    reason: Optional[str] = Field(None, max_length=200, description="Reason for the action")


class PermissionAssignment(BaseModel):
    """Permission assignment request."""
    admin_user_id: str = Field(description="Admin user ID")
    permissions_to_add: List[str] = Field(default_factory=list, description="Permissions to grant")
    permissions_to_remove: List[str] = Field(default_factory=list, description="Permissions to revoke")
    reason: Optional[str] = Field(None, max_length=200, description="Reason for permission change")