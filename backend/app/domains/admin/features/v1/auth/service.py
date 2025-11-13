"""Admin authentication service."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy import and_, desc

from app.core.security import get_password_hash, verify_password
from .schemas import AdminRegisterRequest, AdminUserUpdateRequest
from app.shared.exceptions import ValidationException
from app.shared.models.user import AdminUser, AdminSession, AdminActivityLog
from app.shared.repositories.user import AdminUserRepository


class AdminAuthService:
    """Admin authentication service."""
    
    def __init__(self, db: Session):
        self.db = db
        self.user_repository = AdminUserRepository(db)
    
    async def authenticate_user(self, email: str, password: str) -> Optional[AdminUser]:
        """Authenticate admin user by email and password."""
        user = await self.get_user_by_email(email)
        
        if not user:
            return None
            
        if not verify_password(password, user.hashed_password):
            # Log failed login attempt
            await self._log_activity(
                user_id=user.id,
                action="login_failed",
                details={"reason": "invalid_password"}
            )
            return None
        
        # Update last login
        user.last_login_at = datetime.utcnow()
        self.db.commit()
        
        # Log successful login
        await self._log_activity(
            user_id=user.id,
            action="login_success",
            details={"ip_address": "system"}  # TODO: Get real IP
        )
        
        return user
    
    async def get_user_by_email(self, email: str) -> Optional[AdminUser]:
        """Get admin user by email."""
        return self.user_repository.get_by_email(email)
    
    async def get_user_by_id(self, user_id: UUID) -> Optional[AdminUser]:
        """Get admin user by ID."""
        return self.user_repository.get_by_id(user_id)
    
    async def create_admin_user(self, user_data: AdminRegisterRequest) -> AdminUser:
        """Create new admin user."""
        # Check if email already exists
        existing_user = await self.get_user_by_email(user_data.email)
        if existing_user:
            raise ValidationException("Email already registered")
        
        # Create user data
        user_dict = {
            "email": user_data.email,
            "hashed_password": get_password_hash(user_data.password),
            "first_name": user_data.first_name,
            "last_name": user_data.last_name,
            "role": user_data.role,
            "is_active": True,
            "is_verified": True  # Admin users are verified by default
        }
        
        user = self.user_repository.create(user_dict)
        
        # Log user creation
        await self._log_activity(
            user_id=user.id,
            action="user_created",
            details={"role": user.role, "email": user.email}
        )
        
        return user
    
    async def update_admin_user(self, user_id: UUID, user_data: AdminUserUpdateRequest) -> AdminUser:
        """Update admin user."""
        user = await self.get_user_by_id(user_id)
        if not user:
            raise ValidationException("User not found")
        
        # Check email uniqueness if email is being updated
        if user_data.email and user_data.email != user.email:
            existing_user = await self.get_user_by_email(user_data.email)
            if existing_user:
                raise ValidationException("Email already in use")
        
        # Prepare update data
        update_data = {}
        for field, value in user_data.dict(exclude_unset=True).items():
            if value is not None:
                update_data[field] = value
        
        if not update_data:
            return user
        
        updated_user = self.user_repository.update(user_id, update_data)
        
        # Log user update
        await self._log_activity(
            user_id=user_id,
            action="user_updated",
            details={"updated_fields": list(update_data.keys())}
        )
        
        return updated_user
    
    async def change_password(self, user_id: UUID, current_password: str, new_password: str) -> bool:
        """Change admin user password."""
        user = await self.get_user_by_id(user_id)
        if not user:
            raise ValidationException("User not found")
        
        # Verify current password
        if not verify_password(current_password, user.hashed_password):
            raise ValidationException("Current password is incorrect")
        
        # Update password
        hashed_password = get_password_hash(new_password)
        self.user_repository.update(user_id, {"hashed_password": hashed_password})
        
        # Log password change
        await self._log_activity(
            user_id=user_id,
            action="password_changed",
            details={}
        )
        
        return True
    
    async def deactivate_user(self, user_id: UUID) -> AdminUser:
        """Deactivate admin user."""
        user = self.user_repository.update(user_id, {"is_active": False})
        
        # Log deactivation
        await self._log_activity(
            user_id=user_id,
            action="user_deactivated",
            details={}
        )
        
        return user
    
    async def activate_user(self, user_id: UUID) -> AdminUser:
        """Activate admin user."""
        user = self.user_repository.update(user_id, {"is_active": True})
        
        # Log activation
        await self._log_activity(
            user_id=user_id,
            action="user_activated",
            details={}
        )
        
        return user
    
    async def get_user_sessions(self, user_id: UUID, limit: int = 10) -> list[AdminSession]:
        """Get admin user active sessions."""
        return (
            self.db.query(AdminSession)
            .filter(
                and_(
                    AdminSession.user_id == user_id,
                    AdminSession.is_active == True,
                    AdminSession.expires_at > datetime.utcnow()
                )
            )
            .order_by(desc(AdminSession.created_at))
            .limit(limit)
            .all()
        )
    
    async def get_user_activity_logs(self, user_id: UUID, limit: int = 20) -> list[AdminActivityLog]:
        """Get admin user activity logs."""
        return (
            self.db.query(AdminActivityLog)
            .filter(AdminActivityLog.user_id == user_id)
            .order_by(desc(AdminActivityLog.created_at))
            .limit(limit)
            .all()
        )
    
    async def _log_activity(self, user_id: UUID, action: str, details: dict = None):
        """Log admin user activity."""
        activity_log = AdminActivityLog(
            user_id=user_id,
            action=action,
            details=details or {},
            ip_address="system",  # TODO: Get real IP
            user_agent="system"   # TODO: Get real user agent
        )
        
        self.db.add(activity_log)
        self.db.commit()
    
    async def get_dashboard_stats(self) -> dict:
        """Get admin dashboard statistics."""
        from app.shared.models.user import ProviderUser, CustomerUser
        from app.shared.repositories.user import ProviderUserRepository, CustomerUserRepository
        
        # Get admin users count
        admin_users_count = self.user_repository.count({"is_active": True})
        
        # Get provider users count
        provider_repo = ProviderUserRepository(self.db)
        provider_users_count = provider_repo.count({"is_active": True})
        
        # Get customer users count  
        customer_repo = CustomerUserRepository(self.db)
        customer_users_count = customer_repo.count({"is_active": True})
        
        # Get active sessions count
        active_sessions_count = (
            self.db.query(AdminSession)
            .filter(
                and_(
                    AdminSession.is_active == True,
                    AdminSession.expires_at > datetime.utcnow()
                )
            )
            .count()
        )
        
        # Get recent logins (last 24 hours)
        from datetime import timedelta
        yesterday = datetime.utcnow() - timedelta(days=1)
        recent_logins_count = (
            self.db.query(AdminActivityLog)
            .filter(
                and_(
                    AdminActivityLog.action == "login_success",
                    AdminActivityLog.created_at >= yesterday
                )
            )
            .count()
        )
        
        return {
            "total_admin_users": admin_users_count,
            "total_provider_users": provider_users_count, 
            "total_customers": customer_users_count,
            "active_sessions": active_sessions_count,
            "recent_logins": recent_logins_count,
            "system_alerts": 0  # TODO: Implement system alerts
        }