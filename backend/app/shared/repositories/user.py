"""
User repositories for independent domain authentication systems.
"""

from typing import Optional, List
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.shared.repositories.base import BaseRepository
from app.shared.models.user import (
    AdminUser, ProviderUser, CustomerUser,
    AdminAuditLog, ProviderAuditLog, CustomerAuditLog
)
from app.shared.schemas.user import (
    AdminUserCreate, AdminUserUpdate,
    ProviderUserCreate, ProviderUserUpdate, 
    CustomerUserCreate, CustomerUserUpdate
)
from app.shared.exceptions import NotFoundError, ConflictError
from app.core.security import get_password_hash, verify_password


class AdminUserRepository(BaseRepository[AdminUser, AdminUserCreate, AdminUserUpdate]):
    """Repository for admin user operations - independent admin domain."""
    
    def __init__(self, db: Session):
        super().__init__(AdminUser, db)
    
    def get_by_email(self, email: str) -> Optional[AdminUser]:
        """Get admin user by email."""
        return self.get_by_field("email", email)
    
    def get_by_username(self, username: str) -> Optional[AdminUser]:
        """Get admin user by username."""
        return self.get_by_field("username", username)
    
    def get_by_email_or_username(self, identifier: str) -> Optional[AdminUser]:
        """Get admin user by email or username."""
        return self.db.query(AdminUser).filter(
            or_(AdminUser.email == identifier, AdminUser.username == identifier)
        ).first()
    
    def get_by_employee_id(self, employee_id: str) -> Optional[AdminUser]:
        """Get admin user by employee ID."""
        return self.get_by_field("employee_id", employee_id)
    
    def create_admin_user(self, user_in: AdminUserCreate) -> AdminUser:
        """Create admin user with password hashing."""
        # Check for existing user
        if self.get_by_email(user_in.email):
            raise ConflictError(f"Admin user with email {user_in.email} already exists")
        
        if self.get_by_username(user_in.username):
            raise ConflictError(f"Admin user with username {user_in.username} already exists")
        
        if user_in.employee_id and self.get_by_employee_id(user_in.employee_id):
            raise ConflictError(f"Admin user with employee ID {user_in.employee_id} already exists")
        
        # Hash password and create user
        user_dict = user_in.model_dump()
        user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
        
        return self.create(AdminUserCreate(**user_dict))
    
    def authenticate(self, identifier: str, password: str) -> Optional[AdminUser]:
        """Authenticate admin user by email/username and password."""
        user = self.get_by_email_or_username(identifier)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        if not user.is_active:
            return None
        return user
    
    def get_superusers(self) -> List[AdminUser]:
        """Get all superuser admin accounts."""
        return self.filter_by(is_superuser=True)
    
    def get_by_permissions(self, permission: str) -> List[AdminUser]:
        """Get admin users with specific permission."""
        permission_map = {
            "manage_users": "can_manage_users",
            "manage_system": "can_manage_system", 
            "view_reports": "can_view_reports",
            "manage_providers": "can_manage_providers",
            "manage_customers": "can_manage_customers"
        }
        
        if permission in permission_map:
            return self.filter_by(**{permission_map[permission]: True})
        return []


class ProviderUserRepository(BaseRepository[ProviderUser, ProviderUserCreate, ProviderUserUpdate]):
    """Repository for provider user operations - independent provider domain."""
    
    def __init__(self, db: Session):
        super().__init__(ProviderUser, db)
    
    def get_by_email(self, email: str) -> Optional[ProviderUser]:
        """Get provider user by email."""
        return self.get_by_field("email", email)
    
    def get_by_username(self, username: str) -> Optional[ProviderUser]:
        """Get provider user by username.""" 
        return self.get_by_field("username", username)
    
    def get_by_email_or_username(self, identifier: str) -> Optional[ProviderUser]:
        """Get provider user by email or username."""
        return self.db.query(ProviderUser).filter(
            or_(ProviderUser.email == identifier, ProviderUser.username == identifier)
        ).first()
    
    def get_by_business_license(self, license_number: str) -> Optional[ProviderUser]:
        """Get provider by business license."""
        return self.get_by_field("business_license", license_number)
    
    def create_provider_user(self, user_in: ProviderUserCreate) -> ProviderUser:
        """Create provider user with password hashing."""
        # Check for existing user
        if self.get_by_email(user_in.email):
            raise ConflictError(f"Provider user with email {user_in.email} already exists")
        
        if self.get_by_username(user_in.username):
            raise ConflictError(f"Provider user with username {user_in.username} already exists")
        
        if user_in.business_license and self.get_by_business_license(user_in.business_license):
            raise ConflictError(f"Provider with business license {user_in.business_license} already exists")
        
        # Hash password and create user
        user_dict = user_in.model_dump()
        user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
        
        return self.create(ProviderUserCreate(**user_dict))
    
    def authenticate(self, identifier: str, password: str) -> Optional[ProviderUser]:
        """Authenticate provider user by email/username and password."""
        user = self.get_by_email_or_username(identifier)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        if not user.is_active:
            return None
        return user
    
    def get_approved_providers(self) -> List[ProviderUser]:
        """Get all approved provider accounts."""
        return self.filter_by(is_approved=True)
    
    def get_pending_approval(self) -> List[ProviderUser]:
        """Get provider accounts pending approval."""
        return self.filter_by(is_approved=False)
    
    def get_featured_providers(self) -> List[ProviderUser]:
        """Get featured provider accounts."""
        return self.filter_by(is_featured=True, is_approved=True)
    
    def approve_provider(self, provider_id: UUID, approved_by_email: str) -> ProviderUser:
        """Approve a provider account."""
        provider = self.get_or_404(provider_id)
        from datetime import datetime
        
        provider.is_approved = True
        provider.approval_date = datetime.utcnow()
        provider.approved_by_admin_email = approved_by_email
        
        self.db.commit()
        self.db.refresh(provider)
        return provider


class CustomerUserRepository(BaseRepository[CustomerUser, CustomerUserCreate, CustomerUserUpdate]):
    """Repository for customer user operations - independent customer domain."""
    
    def __init__(self, db: Session):
        super().__init__(CustomerUser, db)
    
    def get_by_email(self, email: str) -> Optional[CustomerUser]:
        """Get customer user by email."""
        return self.get_by_field("email", email)
    
    def get_by_username(self, username: str) -> Optional[CustomerUser]:
        """Get customer user by username."""
        return self.get_by_field("username", username)
    
    def get_by_email_or_username(self, identifier: str) -> Optional[CustomerUser]:
        """Get customer user by email or username."""
        return self.db.query(CustomerUser).filter(
            or_(CustomerUser.email == identifier, CustomerUser.username == identifier)
        ).first()
    
    def create_customer_user(self, user_in: CustomerUserCreate) -> CustomerUser:
        """Create customer user with password hashing."""
        # Check for existing user
        if self.get_by_email(user_in.email):
            raise ConflictError(f"Customer user with email {user_in.email} already exists")
        
        if self.get_by_username(user_in.username):
            raise ConflictError(f"Customer user with username {user_in.username} already exists")
        
        # Hash password and create user
        user_dict = user_in.model_dump()
        user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
        
        return self.create(CustomerUserCreate(**user_dict))
    
    def authenticate(self, identifier: str, password: str) -> Optional[CustomerUser]:
        """Authenticate customer user by email/username and password."""
        user = self.get_by_email_or_username(identifier)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        if not user.is_active:
            return None
        return user
    
    def get_by_location(self, city: str = None, state: str = None, country: str = None) -> List[CustomerUser]:
        """Get customers by location."""
        filters = {}
        if city:
            filters["city"] = city
        if state:
            filters["state"] = state  
        if country:
            filters["country"] = country
        
        return self.filter_by(**filters)
    
    def get_high_value_customers(self, min_spent: float = 1000.0) -> List[CustomerUser]:
        """Get customers who have spent above threshold."""
        return self.db.query(CustomerUser).filter(
            CustomerUser.total_spent.cast(float) >= min_spent
        ).all()
    
    def get_frequent_customers(self, min_bookings: int = 10) -> List[CustomerUser]:
        """Get customers with high booking count."""
        return self.db.query(CustomerUser).filter(
            CustomerUser.total_bookings >= min_bookings
        ).all()


# Separate audit log repositories for each domain
class AdminAuditLogRepository(BaseRepository[AdminAuditLog, None, None]):
    """Repository for admin audit log operations."""
    
    def __init__(self, db: Session):
        super().__init__(AdminAuditLog, db)
    
    def log_admin_action(self, admin_email: str, admin_name: str, action: str, 
                        resource: str = None, ip_address: str = None, 
                        user_agent: str = None, details: str = None, 
                        status: str = "success") -> AdminAuditLog:
        """Create an admin audit log entry."""
        log_data = {
            "admin_email": admin_email,
            "admin_name": admin_name,
            "action": action,
            "resource": resource,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "details": details,
            "status": status
        }
        
        log_entry = AdminAuditLog(**log_data)
        self.db.add(log_entry)
        self.db.commit()
        self.db.refresh(log_entry)
        return log_entry
    
    def get_admin_logs(self, admin_email: str, limit: int = 50) -> List[AdminAuditLog]:
        """Get audit logs for specific admin."""
        return self.db.query(AdminAuditLog).filter(
            AdminAuditLog.admin_email == admin_email
        ).order_by(AdminAuditLog.created_at.desc()).limit(limit).all()
    
    def get_failed_logins(self, hours: int = 24) -> List[AdminAuditLog]:
        """Get failed admin login attempts within time period."""
        from datetime import datetime, timedelta
        since = datetime.utcnow() - timedelta(hours=hours)
        
        return self.db.query(AdminAuditLog).filter(
            AdminAuditLog.action == "login",
            AdminAuditLog.status == "failed",
            AdminAuditLog.created_at >= since
        ).order_by(AdminAuditLog.created_at.desc()).all()


class ProviderAuditLogRepository(BaseRepository[ProviderAuditLog, None, None]):
    """Repository for provider audit log operations."""
    
    def __init__(self, db: Session):
        super().__init__(ProviderAuditLog, db)
    
    def log_provider_action(self, provider_email: str, provider_name: str, action: str,
                           resource: str = None, ip_address: str = None,
                           user_agent: str = None, details: str = None,
                           status: str = "success") -> ProviderAuditLog:
        """Create a provider audit log entry."""
        log_data = {
            "provider_email": provider_email,
            "provider_name": provider_name,
            "action": action,
            "resource": resource,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "details": details,
            "status": status
        }
        
        log_entry = ProviderAuditLog(**log_data)
        self.db.add(log_entry)
        self.db.commit()
        self.db.refresh(log_entry)
        return log_entry


class CustomerAuditLogRepository(BaseRepository[CustomerAuditLog, None, None]):
    """Repository for customer audit log operations."""
    
    def __init__(self, db: Session):
        super().__init__(CustomerAuditLog, db)
    
    def log_customer_action(self, customer_email: str, customer_name: str, action: str,
                           resource: str = None, ip_address: str = None,
                           user_agent: str = None, details: str = None,
                           status: str = "success") -> CustomerAuditLog:
        """Create a customer audit log entry."""
        log_data = {
            "customer_email": customer_email,
            "customer_name": customer_name,
            "action": action,
            "resource": resource,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "details": details,
            "status": status
        }
        
        log_entry = CustomerAuditLog(**log_data)
        self.db.add(log_entry)
        self.db.commit()
        self.db.refresh(log_entry)
        return log_entry