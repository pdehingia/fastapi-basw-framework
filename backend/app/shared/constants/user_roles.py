"""
User Roles and Permission Constants

All user roles, permissions, and access control definitions.
"""

from enum import Enum
from typing import Dict, List, Set


# ===== USER ROLES =====
class UserRoles:
    """User role constants for role-based access control."""
    
    # Administrative roles
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    MODERATOR = "moderator"
    
    # Business roles
    PROVIDER = "provider"
    SALON_OWNER = "salon_owner"
    SALON_MANAGER = "salon_manager"
    SALON_STAFF = "salon_staff"
    ACADEMY_OWNER = "academy_owner"
    ACADEMY_INSTRUCTOR = "academy_instructor"
    
    # Customer roles
    CUSTOMER = "customer"
    PREMIUM_CUSTOMER = "premium_customer"
    VIP_CUSTOMER = "vip_customer"
    
    # Support roles
    SUPPORT_AGENT = "support_agent"
    SUPPORT_MANAGER = "support_manager"
    
    # Special roles
    GUEST = "guest"
    API_CLIENT = "api_client"

    @classmethod
    def get_all(cls) -> List[str]:
        """Get all available roles."""
        return [
            cls.SUPER_ADMIN, cls.ADMIN, cls.MODERATOR,
            cls.PROVIDER, cls.SALON_OWNER, cls.SALON_MANAGER, cls.SALON_STAFF,
            cls.ACADEMY_OWNER, cls.ACADEMY_INSTRUCTOR,
            cls.CUSTOMER, cls.PREMIUM_CUSTOMER, cls.VIP_CUSTOMER,
            cls.SUPPORT_AGENT, cls.SUPPORT_MANAGER,
            cls.GUEST, cls.API_CLIENT
        ]

    @classmethod
    def get_admin_roles(cls) -> List[str]:
        """Get administrative roles."""
        return [cls.SUPER_ADMIN, cls.ADMIN, cls.MODERATOR]

    @classmethod
    def get_business_roles(cls) -> List[str]:
        """Get business/provider roles."""
        return [
            cls.PROVIDER, cls.SALON_OWNER, cls.SALON_MANAGER, 
            cls.SALON_STAFF, cls.ACADEMY_OWNER, cls.ACADEMY_INSTRUCTOR
        ]

    @classmethod
    def get_customer_roles(cls) -> List[str]:
        """Get customer roles."""
        return [cls.CUSTOMER, cls.PREMIUM_CUSTOMER, cls.VIP_CUSTOMER]

    @classmethod
    def get_support_roles(cls) -> List[str]:
        """Get support roles."""
        return [cls.SUPPORT_AGENT, cls.SUPPORT_MANAGER]


# ===== PERMISSION LEVELS =====
class PermissionLevels:
    """Permission level constants."""
    
    NONE = 0
    READ = 1
    WRITE = 2
    DELETE = 4
    ADMIN = 8
    SUPER_ADMIN = 16

    @classmethod
    def get_combined(cls, *permissions) -> int:
        """Combine multiple permissions using bitwise OR."""
        return sum(permissions)

    @classmethod
    def has_permission(cls, user_permissions: int, required_permission: int) -> bool:
        """Check if user has required permission."""
        return (user_permissions & required_permission) == required_permission


# ===== ROLE PERMISSIONS =====
class RolePermissions:
    """Define permissions for each role."""
    
    ROLE_PERMISSION_MAP: Dict[str, int] = {
        # Administrative roles
        UserRoles.SUPER_ADMIN: PermissionLevels.get_combined(
            PermissionLevels.READ, PermissionLevels.WRITE, 
            PermissionLevels.DELETE, PermissionLevels.ADMIN, 
            PermissionLevels.SUPER_ADMIN
        ),
        UserRoles.ADMIN: PermissionLevels.get_combined(
            PermissionLevels.READ, PermissionLevels.WRITE, 
            PermissionLevels.DELETE, PermissionLevels.ADMIN
        ),
        UserRoles.MODERATOR: PermissionLevels.get_combined(
            PermissionLevels.READ, PermissionLevels.WRITE
        ),
        
        # Business roles
        UserRoles.PROVIDER: PermissionLevels.get_combined(
            PermissionLevels.READ, PermissionLevels.WRITE
        ),
        UserRoles.SALON_OWNER: PermissionLevels.get_combined(
            PermissionLevels.READ, PermissionLevels.WRITE, PermissionLevels.DELETE
        ),
        UserRoles.SALON_MANAGER: PermissionLevels.get_combined(
            PermissionLevels.READ, PermissionLevels.WRITE
        ),
        UserRoles.SALON_STAFF: PermissionLevels.READ,
        UserRoles.ACADEMY_OWNER: PermissionLevels.get_combined(
            PermissionLevels.READ, PermissionLevels.WRITE, PermissionLevels.DELETE
        ),
        UserRoles.ACADEMY_INSTRUCTOR: PermissionLevels.get_combined(
            PermissionLevels.READ, PermissionLevels.WRITE
        ),
        
        # Customer roles
        UserRoles.CUSTOMER: PermissionLevels.READ,
        UserRoles.PREMIUM_CUSTOMER: PermissionLevels.READ,
        UserRoles.VIP_CUSTOMER: PermissionLevels.READ,
        
        # Support roles
        UserRoles.SUPPORT_AGENT: PermissionLevels.get_combined(
            PermissionLevels.READ, PermissionLevels.WRITE
        ),
        UserRoles.SUPPORT_MANAGER: PermissionLevels.get_combined(
            PermissionLevels.READ, PermissionLevels.WRITE, PermissionLevels.DELETE
        ),
        
        # Special roles
        UserRoles.GUEST: PermissionLevels.NONE,
        UserRoles.API_CLIENT: PermissionLevels.READ
    }

    @classmethod
    def get_permissions(cls, role: str) -> int:
        """Get permissions for a specific role."""
        return cls.ROLE_PERMISSION_MAP.get(role, PermissionLevels.NONE)

    @classmethod
    def can_access(cls, user_role: str, required_permission: int) -> bool:
        """Check if user role can access required permission."""
        user_permissions = cls.get_permissions(user_role)
        return PermissionLevels.has_permission(user_permissions, required_permission)


# ===== ROLE HIERARCHY =====
class RoleHierarchy:
    """Define role hierarchy for access control."""
    
    HIERARCHY: Dict[str, Set[str]] = {
        UserRoles.SUPER_ADMIN: {
            UserRoles.ADMIN, UserRoles.MODERATOR,
            UserRoles.SUPPORT_MANAGER, UserRoles.SUPPORT_AGENT,
            UserRoles.SALON_OWNER, UserRoles.SALON_MANAGER, UserRoles.SALON_STAFF,
            UserRoles.ACADEMY_OWNER, UserRoles.ACADEMY_INSTRUCTOR,
            UserRoles.PROVIDER, UserRoles.VIP_CUSTOMER, 
            UserRoles.PREMIUM_CUSTOMER, UserRoles.CUSTOMER,
            UserRoles.API_CLIENT, UserRoles.GUEST
        },
        UserRoles.ADMIN: {
            UserRoles.MODERATOR, UserRoles.SUPPORT_AGENT,
            UserRoles.SALON_MANAGER, UserRoles.SALON_STAFF,
            UserRoles.ACADEMY_INSTRUCTOR, UserRoles.PROVIDER,
            UserRoles.CUSTOMER, UserRoles.GUEST
        },
        UserRoles.MODERATOR: {
            UserRoles.SUPPORT_AGENT, UserRoles.SALON_STAFF,
            UserRoles.CUSTOMER, UserRoles.GUEST
        },
        UserRoles.SALON_OWNER: {
            UserRoles.SALON_MANAGER, UserRoles.SALON_STAFF
        },
        UserRoles.SALON_MANAGER: {
            UserRoles.SALON_STAFF
        },
        UserRoles.ACADEMY_OWNER: {
            UserRoles.ACADEMY_INSTRUCTOR
        },
        UserRoles.SUPPORT_MANAGER: {
            UserRoles.SUPPORT_AGENT
        },
        UserRoles.VIP_CUSTOMER: {
            UserRoles.PREMIUM_CUSTOMER, UserRoles.CUSTOMER
        },
        UserRoles.PREMIUM_CUSTOMER: {
            UserRoles.CUSTOMER
        }
    }

    @classmethod
    def can_manage(cls, manager_role: str, target_role: str) -> bool:
        """Check if manager role can manage target role."""
        return target_role in cls.HIERARCHY.get(manager_role, set())

    @classmethod
    def get_subordinates(cls, role: str) -> Set[str]:
        """Get all roles that can be managed by the given role."""
        return cls.HIERARCHY.get(role, set())


# ===== ROLE DESCRIPTIONS =====
ROLE_DESCRIPTIONS: Dict[str, str] = {
    UserRoles.SUPER_ADMIN: "Full system access with all administrative privileges",
    UserRoles.ADMIN: "Administrative access to platform management",
    UserRoles.MODERATOR: "Content moderation and user management",
    
    UserRoles.PROVIDER: "Beauty service provider",
    UserRoles.SALON_OWNER: "Salon business owner with full salon management",
    UserRoles.SALON_MANAGER: "Salon manager with operational access",
    UserRoles.SALON_STAFF: "Salon staff member with limited access",
    UserRoles.ACADEMY_OWNER: "Beauty academy owner",
    UserRoles.ACADEMY_INSTRUCTOR: "Academy instructor and course manager",
    
    UserRoles.CUSTOMER: "Regular customer with booking privileges",
    UserRoles.PREMIUM_CUSTOMER: "Premium customer with enhanced benefits",
    UserRoles.VIP_CUSTOMER: "VIP customer with exclusive access",
    
    UserRoles.SUPPORT_AGENT: "Customer support representative",
    UserRoles.SUPPORT_MANAGER: "Customer support manager",
    
    UserRoles.GUEST: "Guest user with limited access",
    UserRoles.API_CLIENT: "External API client with programmatic access"
}


# ===== EXPORTS =====
USER_ROLES = UserRoles()
PERMISSION_LEVELS = PermissionLevels()
ROLE_PERMISSIONS = RolePermissions()
ROLE_HIERARCHIES = RoleHierarchy()