"""Admin user management service layer."""

import io
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from .schemas import (
    AdminUserCreate, AdminUserUpdate, AdminUser, AdminUserFilters, AdminUsersList,
    AdminUserDetail, AdminUserSession, AuditLogEntry, RolePermissions, Permission,
    RolePermissionsList, SessionsList, AuditTrail, PasswordChangeRequest,
    BulkAdminAction, PermissionAssignment, AdminRole, AdminStatus, PermissionCategory,
    AuditAction
)


class AdminUserManagementService:
    """Service class for admin user management operations."""

    def __init__(self, db: Session, admin_user_id: str):
        self.db = db
        self.admin_user_id = admin_user_id

    def get_admin_users(self, filters: AdminUserFilters, skip: int = 0, limit: int = 20) -> AdminUsersList:
        """Get paginated list of admin users with filters."""
        
        # Mock admin users data
        mock_users = [
            AdminUser(
                id="admin_001",
                email="john.doe@maya-platform.com",
                first_name="John",
                last_name="Doe",
                role=AdminRole.SUPER_ADMIN,
                status=AdminStatus.ACTIVE,
                department="Engineering",
                phone="+1-555-0001",
                created_at=datetime.utcnow() - timedelta(days=365),
                last_login=datetime.utcnow() - timedelta(hours=2),
                login_count=1247,
                failed_login_attempts=0,
                account_locked_until=None,
                password_changed_at=datetime.utcnow() - timedelta(days=45),
                must_change_password=False,
                two_factor_enabled=True,
                created_by="system",
                last_updated_by="admin_001",
                permissions=["admin.*", "system.*"]
            ),
            AdminUser(
                id="admin_002",
                email="jane.smith@maya-platform.com",
                first_name="Jane",
                last_name="Smith",
                role=AdminRole.ADMIN,
                status=AdminStatus.ACTIVE,
                department="Operations",
                phone="+1-555-0002",
                created_at=datetime.utcnow() - timedelta(days=200),
                last_login=datetime.utcnow() - timedelta(hours=5),
                login_count=856,
                failed_login_attempts=0,
                account_locked_until=None,
                password_changed_at=datetime.utcnow() - timedelta(days=30),
                must_change_password=False,
                two_factor_enabled=True,
                created_by="admin_001",
                last_updated_by="admin_001",
                permissions=["user_management.*", "booking_management.*", "support_management.*"]
            ),
            AdminUser(
                id="admin_003",
                email="mike.wilson@maya-platform.com",
                first_name="Mike",
                last_name="Wilson",
                role=AdminRole.MODERATOR,
                status=AdminStatus.ACTIVE,
                department="Content",
                phone="+1-555-0003",
                created_at=datetime.utcnow() - timedelta(days=120),
                last_login=datetime.utcnow() - timedelta(days=1),
                login_count=324,
                failed_login_attempts=0,
                account_locked_until=None,
                password_changed_at=datetime.utcnow() - timedelta(days=15),
                must_change_password=False,
                two_factor_enabled=False,
                created_by="admin_002",
                last_updated_by="admin_002",
                permissions=["content_moderation.*", "artist_verification.read"]
            ),
            AdminUser(
                id="admin_004",
                email="sarah.johnson@maya-platform.com",
                first_name="Sarah",
                last_name="Johnson",
                role=AdminRole.SUPPORT_AGENT,
                status=AdminStatus.ACTIVE,
                department="Customer Support",
                phone="+1-555-0004",
                created_at=datetime.utcnow() - timedelta(days=90),
                last_login=datetime.utcnow() - timedelta(minutes=30),
                login_count=567,
                failed_login_attempts=0,
                account_locked_until=None,
                password_changed_at=datetime.utcnow() - timedelta(days=60),
                must_change_password=False,
                two_factor_enabled=True,
                created_by="admin_002",
                last_updated_by="admin_002",
                permissions=["support_management.*", "user_management.read"]
            ),
            AdminUser(
                id="admin_005",
                email="david.chen@maya-platform.com",
                first_name="David",
                last_name="Chen",
                role=AdminRole.ANALYST,
                status=AdminStatus.PENDING,
                department="Analytics",
                phone="+1-555-0005",
                created_at=datetime.utcnow() - timedelta(days=5),
                last_login=None,
                login_count=0,
                failed_login_attempts=0,
                account_locked_until=None,
                password_changed_at=None,
                must_change_password=True,
                two_factor_enabled=False,
                created_by="admin_001",
                last_updated_by=None,
                permissions=["analytics_reporting.read"]
            )
        ]
        
        # Apply filters (simplified for mock)
        filtered_users = mock_users
        if filters.role:
            filtered_users = [u for u in filtered_users if u.role == filters.role]
        if filters.status:
            filtered_users = [u for u in filtered_users if u.status == filters.status]
        if filters.search:
            search_term = filters.search.lower()
            filtered_users = [u for u in filtered_users if 
                            search_term in u.email.lower() or 
                            search_term in f"{u.first_name} {u.last_name}".lower()]
        
        # Pagination
        paginated_users = filtered_users[skip:skip + limit]
        
        # Calculate statistics
        role_distribution = {
            "super_admin": len([u for u in mock_users if u.role == AdminRole.SUPER_ADMIN]),
            "admin": len([u for u in mock_users if u.role == AdminRole.ADMIN]),
            "moderator": len([u for u in mock_users if u.role == AdminRole.MODERATOR]),
            "support_agent": len([u for u in mock_users if u.role == AdminRole.SUPPORT_AGENT]),
            "analyst": len([u for u in mock_users if u.role == AdminRole.ANALYST])
        }
        
        recent_registrations = len([u for u in mock_users if 
                                  u.created_at > datetime.utcnow() - timedelta(days=30)])
        
        return AdminUsersList(
            users=paginated_users,
            total_count=len(filtered_users),
            active_count=len([u for u in mock_users if u.status == AdminStatus.ACTIVE]),
            role_distribution=role_distribution,
            recent_registrations=recent_registrations
        )

    def get_admin_user(self, admin_user_id: str) -> Optional[AdminUserDetail]:
        """Get detailed information about a specific admin user."""
        
        # Mock detailed user data
        user = AdminUser(
            id=admin_user_id,
            email="jane.smith@maya-platform.com",
            first_name="Jane",
            last_name="Smith",
            role=AdminRole.ADMIN,
            status=AdminStatus.ACTIVE,
            department="Operations",
            phone="+1-555-0002",
            created_at=datetime.utcnow() - timedelta(days=200),
            last_login=datetime.utcnow() - timedelta(hours=5),
            login_count=856,
            failed_login_attempts=0,
            account_locked_until=None,
            password_changed_at=datetime.utcnow() - timedelta(days=30),
            must_change_password=False,
            two_factor_enabled=True,
            created_by="admin_001",
            last_updated_by="admin_001",
            permissions=["user_management.*", "booking_management.*", "support_management.*"]
        )
        
        # Mock recent sessions
        recent_sessions = [
            AdminUserSession(
                session_id="sess_001",
                admin_user_id=admin_user_id,
                ip_address="192.168.1.100",
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                location="New York, NY",
                started_at=datetime.utcnow() - timedelta(hours=8),
                last_activity=datetime.utcnow() - timedelta(minutes=15),
                expires_at=datetime.utcnow() + timedelta(hours=16),
                is_current=True
            ),
            AdminUserSession(
                session_id="sess_002",
                admin_user_id=admin_user_id,
                ip_address="10.0.0.50",
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
                location="San Francisco, CA",
                started_at=datetime.utcnow() - timedelta(days=1),
                last_activity=datetime.utcnow() - timedelta(days=1),
                expires_at=datetime.utcnow() - timedelta(hours=8),
                is_current=False
            )
        ]
        
        # Mock recent audit entries
        recent_audit_entries = [
            AuditLogEntry(
                id="audit_001",
                admin_user_id=admin_user_id,
                admin_email="jane.smith@maya-platform.com",
                action=AuditAction.LOGIN,
                resource_type="session",
                resource_id="sess_001",
                details={"ip_address": "192.168.1.100", "location": "New York, NY"},
                ip_address="192.168.1.100",
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                timestamp=datetime.utcnow() - timedelta(hours=8),
                success=True,
                error_message=None
            ),
            AuditLogEntry(
                id="audit_002",
                admin_user_id=admin_user_id,
                admin_email="jane.smith@maya-platform.com",
                action=AuditAction.UPDATE,
                resource_type="user",
                resource_id="user_12345",
                details={"field_changed": "status", "old_value": "pending", "new_value": "active"},
                ip_address="192.168.1.100",
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                timestamp=datetime.utcnow() - timedelta(hours=6),
                success=True,
                error_message=None
            )
        ]
        
        # Mock detailed permissions
        permissions_detailed = [
            Permission(
                id="user_management_read",
                name="User Management Read",
                description="View user accounts and information",
                category=PermissionCategory.USER_MANAGEMENT,
                is_dangerous=False
            ),
            Permission(
                id="user_management_write",
                name="User Management Write",
                description="Create, update, and delete user accounts",
                category=PermissionCategory.USER_MANAGEMENT,
                is_dangerous=True
            ),
            Permission(
                id="booking_management_read",
                name="Booking Management Read",
                description="View booking information",
                category=PermissionCategory.BOOKING_MANAGEMENT,
                is_dangerous=False
            )
        ]
        
        return AdminUserDetail(
            **user.dict(),
            recent_sessions=recent_sessions,
            recent_audit_entries=recent_audit_entries,
            permissions_detailed=permissions_detailed
        )

    def create_admin_user(self, user_data: AdminUserCreate) -> AdminUser:
        """Create a new admin user."""
        
        # Mock user creation
        new_user = AdminUser(
            id=f"admin_{datetime.utcnow().timestamp():.0f}",
            email=user_data.email,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            role=user_data.role,
            status=AdminStatus.PENDING,
            department=user_data.department,
            phone=user_data.phone,
            created_at=datetime.utcnow(),
            last_login=None,
            login_count=0,
            failed_login_attempts=0,
            account_locked_until=None,
            password_changed_at=None,
            must_change_password=True,
            two_factor_enabled=False,
            created_by=self.admin_user_id,
            last_updated_by=None,
            permissions=self._get_role_permissions(user_data.role)
        )
        
        return new_user

    def update_admin_user(self, admin_user_id: str, update_data: AdminUserUpdate) -> AdminUser:
        """Update an existing admin user."""
        
        # Mock user update
        updated_user = AdminUser(
            id=admin_user_id,
            email="jane.smith@maya-platform.com",  # Email is immutable
            first_name=update_data.first_name or "Jane",
            last_name=update_data.last_name or "Smith",
            role=update_data.role or AdminRole.ADMIN,
            status=update_data.status or AdminStatus.ACTIVE,
            department=update_data.department or "Operations",
            phone=update_data.phone or "+1-555-0002",
            created_at=datetime.utcnow() - timedelta(days=200),
            last_login=datetime.utcnow() - timedelta(hours=5),
            login_count=856,
            failed_login_attempts=0,
            account_locked_until=None,
            password_changed_at=datetime.utcnow() - timedelta(days=30),
            must_change_password=False,
            two_factor_enabled=True,
            created_by="admin_001",
            last_updated_by=self.admin_user_id,
            permissions=self._get_role_permissions(update_data.role or AdminRole.ADMIN)
        )
        
        return updated_user

    def delete_admin_user(self, admin_user_id: str) -> bool:
        """Delete an admin user (soft delete)."""
        
        # In production, this would perform a soft delete or archive
        return True

    def get_role_permissions(self) -> RolePermissionsList:
        """Get all roles and their associated permissions."""
        
        # Mock all available permissions
        all_permissions = [
            Permission(
                id="user_management_read",
                name="User Management Read",
                description="View user accounts and profiles",
                category=PermissionCategory.USER_MANAGEMENT,
                is_dangerous=False
            ),
            Permission(
                id="user_management_write",
                name="User Management Write",
                description="Create, update, and delete user accounts",
                category=PermissionCategory.USER_MANAGEMENT,
                is_dangerous=True
            ),
            Permission(
                id="booking_management_read",
                name="Booking Management Read",
                description="View booking information and history",
                category=PermissionCategory.BOOKING_MANAGEMENT,
                is_dangerous=False
            ),
            Permission(
                id="booking_management_write",
                name="Booking Management Write",
                description="Manage bookings and resolve disputes",
                category=PermissionCategory.BOOKING_MANAGEMENT,
                is_dangerous=True
            ),
            Permission(
                id="payment_management_read",
                name="Payment Management Read",
                description="View payment transactions and financial data",
                category=PermissionCategory.PAYMENT_MANAGEMENT,
                is_dangerous=False
            ),
            Permission(
                id="payment_management_write",
                name="Payment Management Write",
                description="Process refunds and adjust financial records",
                category=PermissionCategory.PAYMENT_MANAGEMENT,
                is_dangerous=True
            ),
            Permission(
                id="system_config_write",
                name="System Configuration Write",
                description="Modify system settings and configuration",
                category=PermissionCategory.SYSTEM_CONFIG,
                is_dangerous=True
            ),
            Permission(
                id="admin_management_write",
                name="Admin Management Write",
                description="Create and manage admin user accounts",
                category=PermissionCategory.ADMIN_MANAGEMENT,
                is_dangerous=True
            )
        ]
        
        # Mock role definitions
        roles = [
            RolePermissions(
                role=AdminRole.SUPER_ADMIN,
                description="Full system access with all permissions",
                permissions=all_permissions,
                can_grant_permissions=[p.id for p in all_permissions],
                user_count=1
            ),
            RolePermissions(
                role=AdminRole.ADMIN,
                description="Administrative access to most features",
                permissions=[p for p in all_permissions if p.category != PermissionCategory.SYSTEM_CONFIG],
                can_grant_permissions=[p.id for p in all_permissions if not p.is_dangerous],
                user_count=3
            ),
            RolePermissions(
                role=AdminRole.MODERATOR,
                description="Content moderation and user management",
                permissions=[p for p in all_permissions if p.category in [
                    PermissionCategory.CONTENT_MODERATION, 
                    PermissionCategory.USER_MANAGEMENT
                ] and "read" in p.id],
                can_grant_permissions=[],
                user_count=5
            ),
            RolePermissions(
                role=AdminRole.SUPPORT_AGENT,
                description="Customer support and basic user management",
                permissions=[p for p in all_permissions if p.category in [
                    PermissionCategory.SUPPORT_MANAGEMENT,
                    PermissionCategory.USER_MANAGEMENT
                ] and "read" in p.id],
                can_grant_permissions=[],
                user_count=8
            ),
            RolePermissions(
                role=AdminRole.ANALYST,
                description="Analytics and reporting access",
                permissions=[p for p in all_permissions if p.category == PermissionCategory.ANALYTICS_REPORTING],
                can_grant_permissions=[],
                user_count=2
            )
        ]
        
        return RolePermissionsList(
            roles=roles,
            available_permissions=all_permissions,
            total_admins=19
        )

    def get_active_sessions(self) -> SessionsList:
        """Get all active admin sessions."""
        
        # Mock active sessions
        sessions = [
            AdminUserSession(
                session_id="sess_001",
                admin_user_id="admin_001",
                ip_address="192.168.1.100",
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                location="New York, NY",
                started_at=datetime.utcnow() - timedelta(hours=8),
                last_activity=datetime.utcnow() - timedelta(minutes=5),
                expires_at=datetime.utcnow() + timedelta(hours=16),
                is_current=False
            ),
            AdminUserSession(
                session_id="sess_002",
                admin_user_id="admin_002",
                ip_address="10.0.0.25",
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
                location="San Francisco, CA",
                started_at=datetime.utcnow() - timedelta(hours=3),
                last_activity=datetime.utcnow() - timedelta(minutes=2),
                expires_at=datetime.utcnow() + timedelta(hours=21),
                is_current=False
            ),
            AdminUserSession(
                session_id="sess_003",
                admin_user_id="admin_004",
                ip_address="172.16.0.10",
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                location="Chicago, IL",
                started_at=datetime.utcnow() - timedelta(minutes=30),
                last_activity=datetime.utcnow() - timedelta(minutes=1),
                expires_at=datetime.utcnow() + timedelta(hours=23, minutes=30),
                is_current=False
            )
        ]
        
        return SessionsList(
            sessions=sessions,
            total_active_sessions=len(sessions),
            unique_users_active=len(set(s.admin_user_id for s in sessions))
        )

    def get_audit_trail(self, 
                       admin_user_id: Optional[str] = None,
                       action: Optional[AuditAction] = None,
                       start_date: Optional[datetime] = None,
                       end_date: Optional[datetime] = None,
                       skip: int = 0,
                       limit: int = 50) -> AuditTrail:
        """Get audit trail with filters."""
        
        # Mock audit entries
        entries = [
            AuditLogEntry(
                id="audit_001",
                admin_user_id="admin_001",
                admin_email="john.doe@maya-platform.com",
                action=AuditAction.LOGIN,
                resource_type="session",
                resource_id="sess_001",
                details={"ip_address": "192.168.1.100", "location": "New York, NY"},
                ip_address="192.168.1.100",
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                timestamp=datetime.utcnow() - timedelta(minutes=30),
                success=True,
                error_message=None
            ),
            AuditLogEntry(
                id="audit_002",
                admin_user_id="admin_002",
                admin_email="jane.smith@maya-platform.com",
                action=AuditAction.UPDATE,
                resource_type="user",
                resource_id="user_12345",
                details={"field_changed": "status", "old_value": "pending", "new_value": "active"},
                ip_address="10.0.0.25",
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
                timestamp=datetime.utcnow() - timedelta(hours=1),
                success=True,
                error_message=None
            ),
            AuditLogEntry(
                id="audit_003",
                admin_user_id="admin_003",
                admin_email="mike.wilson@maya-platform.com",
                action=AuditAction.CREATE,
                resource_type="admin_user",
                resource_id="admin_005",
                details={"role": "analyst", "department": "Analytics"},
                ip_address="172.16.0.15",
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                timestamp=datetime.utcnow() - timedelta(hours=2),
                success=True,
                error_message=None
            )
        ]
        
        # Apply filters (simplified for mock)
        filtered_entries = entries
        if admin_user_id:
            filtered_entries = [e for e in filtered_entries if e.admin_user_id == admin_user_id]
        if action:
            filtered_entries = [e for e in filtered_entries if e.action == action]
        
        # Pagination
        paginated_entries = filtered_entries[skip:skip + limit]
        
        # Calculate statistics
        action_summary = {
            "login": 45,
            "logout": 38,
            "create": 12,
            "update": 67,
            "delete": 3,
            "password_change": 8,
            "role_change": 5
        }
        
        top_active_admins = [
            {"admin_id": "admin_001", "admin_email": "john.doe@maya-platform.com", "action_count": 89},
            {"admin_id": "admin_002", "admin_email": "jane.smith@maya-platform.com", "action_count": 67},
            {"admin_id": "admin_004", "admin_email": "sarah.johnson@maya-platform.com", "action_count": 45}
        ]
        
        return AuditTrail(
            entries=paginated_entries,
            total_entries=len(filtered_entries),
            date_range={
                "earliest": datetime.utcnow() - timedelta(days=30),
                "latest": datetime.utcnow()
            },
            action_summary=action_summary,
            top_active_admins=top_active_admins
        )

    def change_password(self, admin_user_id: str, password_request: PasswordChangeRequest) -> bool:
        """Change admin user password."""
        
        # In production, this would verify the current password and update it
        return True

    def assign_permissions(self, assignment: PermissionAssignment) -> bool:
        """Assign or revoke permissions for an admin user."""
        
        # In production, this would update the user's permissions
        return True

    def bulk_admin_action(self, bulk_action: BulkAdminAction) -> Dict[str, Any]:
        """Perform bulk action on multiple admin users."""
        
        # Mock bulk action results
        return {
            "action": bulk_action.action,
            "processed_count": len(bulk_action.admin_user_ids),
            "successful_count": len(bulk_action.admin_user_ids),
            "failed_count": 0,
            "errors": []
        }

    def export_admin_users(self) -> io.BytesIO:
        """Export admin users list to Excel file."""
        
        # Mock Excel export
        content = """Admin Users Export
        
Generated: {timestamp}
Exported by: {admin}

Admin Users:
- john.doe@maya-platform.com | Super Admin | Active | Engineering
- jane.smith@maya-platform.com | Admin | Active | Operations  
- mike.wilson@maya-platform.com | Moderator | Active | Content
- sarah.johnson@maya-platform.com | Support Agent | Active | Customer Support
- david.chen@maya-platform.com | Analyst | Pending | Analytics

Summary:
- Total Admin Users: 5
- Active Users: 4
- Pending Users: 1
- Super Admins: 1
- Regular Admins: 1
- Moderators: 1
- Support Agents: 1
- Analysts: 1
""".format(
            timestamp=datetime.utcnow().isoformat(),
            admin=self.admin_user_id
        )
        
        return io.BytesIO(content.encode('utf-8'))

    def _get_role_permissions(self, role: AdminRole) -> List[str]:
        """Get permissions for a specific role."""
        
        role_permissions = {
            AdminRole.SUPER_ADMIN: ["admin.*", "system.*"],
            AdminRole.ADMIN: ["user_management.*", "booking_management.*", "payment_management.*"],
            AdminRole.MODERATOR: ["content_moderation.*", "user_management.read"],
            AdminRole.SUPPORT_AGENT: ["support_management.*", "user_management.read"],
            AdminRole.ANALYST: ["analytics_reporting.read"]
        }
        
        return role_permissions.get(role, [])