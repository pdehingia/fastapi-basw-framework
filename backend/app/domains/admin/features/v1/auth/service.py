"""Admin authentication service."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy import and_, desc, text

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
        return self.user_repository.get(user_id)
    
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
            "full_name": f"{user_data.first_name} {user_data.last_name}",
            "is_active": True,
            "is_verified": True,  # Admin users are verified by default
            "is_superuser": False  # Default to non-superuser
        }
        
        user = self.user_repository.create(user_dict)
        
        # Log user creation
        await self._log_activity(
            user_id=user.id,
            action="user_created",
            details={"email": user.email, "is_superuser": user.is_superuser}
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
                # Handle role to is_superuser conversion
                if field == "role":
                    update_data["is_superuser"] = (value == "super_admin")
                else:
                    update_data[field] = value
        
        if not update_data:
            return user
        
        # Update user directly using SQLAlchemy since repository pattern needs adjustment
        try:
            for field, value in update_data.items():
                if hasattr(user, field):
                    setattr(user, field, value)
            self.db.commit()
            self.db.refresh(user)
            updated_user = user
        except Exception as e:
            self.db.rollback()
            raise ValidationException(f"Failed to update user: {str(e)}")
        
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
    
    async def get_user_sessions(self, user_id: UUID, limit: int = 10) -> list:
        """Get admin user active sessions."""
        query = text("""
            SELECT id, session_token, device_name, device_type, ip_address, 
                   city, country, is_active, created_at, last_active_at, expires_at
            FROM admin_user_sessions 
            WHERE user_id = :user_id AND is_active = true AND expires_at > NOW()
            ORDER BY last_active_at DESC
            LIMIT :limit
        """)
        result = self.db.execute(query, {"user_id": str(user_id), "limit": limit})
        return [dict(row._mapping) for row in result]
    
    async def get_user_activity_logs(self, user_id: UUID, limit: int = 20) -> list:
        """Get admin user activity logs."""
        query = text("""
            SELECT id, user_id, user_type, activity_type, activity_category, 
                   description, metadata, ip_address, session_id, created_at
            FROM user_activity_logs 
            WHERE user_id = :user_id
            ORDER BY created_at DESC
            LIMIT :limit
        """)
        result = self.db.execute(query, {"user_id": str(user_id), "limit": limit})
        return [dict(row._mapping) for row in result]
    
    async def _log_activity(self, user_id: UUID, action: str, details: dict = None):
        """Log admin user activity."""
        activity_log = AdminActivityLog(
            admin_user_id=user_id,
            action=action,
            entity="auth",  # Entity being acted upon
            entity_id=user_id,  # Reference to the entity
            after=details or {}  # Store details in 'after' field as JSONB
        )
        
        self.db.add(activity_log)
        self.db.commit()
    
    async def register_admin_user(self, register_data: AdminRegisterRequest) -> AdminUser:
        """Register a new admin user."""
        # Check if user already exists
        existing_user = await self.get_user_by_email(register_data.email)
        if existing_user:
            raise ValidationException("User with this email already exists")
        
        # Generate username from email if not provided
        username = register_data.email.split("@")[0]
        
        # Check if username is taken and add suffix if needed
        base_username = username
        counter = 1
        while True:
            existing_username = self.db.query(AdminUser).filter(AdminUser.username == username).first()
            if not existing_username:
                break
            username = f"{base_username}{counter}"
            counter += 1
        
        # Create new user
        user = AdminUser(
            email=register_data.email,
            username=username,
            full_name=f"{register_data.first_name} {register_data.last_name}",
            hashed_password=get_password_hash(register_data.password),
            is_superuser=(register_data.role == "super_admin"),
            is_active=True,
            is_verified=True
        )
        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        
        # Log user creation
        await self._log_activity(
            user_id=user.id,
            action="user_created",
            details={
                "email": user.email,
                "username": user.username,
                "role": register_data.role,
                "created_by": "admin"
            }
        )
        
        return user
    
    async def delete_admin_user(self, user_id: UUID) -> bool:
        """Delete admin user."""
        user = await self.get_user_by_id(user_id)
        if not user:
            return False
        
        # Log user deletion before deleting
        await self._log_activity(
            user_id=user_id,
            action="user_deleted",
            details={
                "email": user.email,
                "username": user.username,
                "deleted_by": "admin"
            }
        )
        
        # Delete the user
        self.db.delete(user)
        self.db.commit()
        
        return True
    
    async def get_dashboard_stats(self) -> dict:
        """Get admin dashboard statistics."""
        from app.shared.models.user import AdminUser
        
        # Get admin users count (active only)
        admin_users_count = self.db.query(AdminUser).filter(AdminUser.is_active == True).count()
        
        # TODO: Fix provider and customer models to match DB schema
        # For now, return placeholder counts to avoid model mismatch errors
        provider_users_count = 0  # self.db.query(ProviderUser).filter(ProviderUser.is_active == True).count()
        customer_users_count = 0   # self.db.query(CustomerUser).filter(CustomerUser.is_active == True).count()
        
        # Get active sessions count
        # TODO: Implement sessions tracking
        active_sessions_count = 0
        
        # Get recent logins (last 24 hours)
        # TODO: Implement activity tracking
        recent_logins_count = 0
        
        return {
            "total_admin_users": admin_users_count,
            "total_provider_users": provider_users_count, 
            "total_customers": customer_users_count,
            "active_sessions": active_sessions_count,
            "recent_logins": recent_logins_count,
            "system_alerts": 0,  # TODO: Implement system alerts
        }