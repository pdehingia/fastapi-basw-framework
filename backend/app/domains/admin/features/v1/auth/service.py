"""Admin authentication service."""

from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, Tuple
from uuid import UUID, uuid4
import secrets
import logging

from sqlalchemy.orm import Session
from sqlalchemy import and_, desc, text

from app.core.security import get_password_hash, verify_password
from .schemas import AdminRegisterRequest, AdminUserUpdateRequest
from app.shared.exceptions import ValidationException
from app.shared.models.user import AdminUser, AdminAuditLog, AdminUserSession
from app.shared.repositories.user import AdminUserRepository

logger = logging.getLogger(__name__)


class AdminAuthService:
    """Admin authentication service."""
    
    def __init__(self, db: Session):
        self.db = db
        self.user_repository = AdminUserRepository(db)
    
    def authenticate_user(self, email: str, password: str, client_info: dict = None) -> Optional[AdminUser]:
        """Authenticate admin user by email and password."""
        user = self.get_user_by_email(email)
        
        if not user:
            return None
            
        if not verify_password(password, user.hashed_password):
            # Log failed login attempt
            self._log_activity(
                user_id=user.id,
                action="login_failed",
                details={
                    "reason": "invalid_password",
                    **(client_info or {})
                }
            )
            return None
        
        # Update last login
        user.last_login_at = datetime.now(timezone.utc)
        self.db.commit()
        
        # Try to create session record with error handling
        session_token = None
        try:
            session_token = self.create_session(user.id, client_info or {})
            logger.info(f"Session created successfully: {session_token[:8]}...")
        except Exception as e:
            logger.error(f"Failed to create session: {e}")
            # Continue without session tracking for now
        
        # Log successful login with client information
        self._log_activity(
            user_id=user.id,
            action="login_success",
            details=client_info or {"ip_address": "unknown"}
        )
        
        return user
    
    def create_session(self, user_id: UUID, client_info: dict) -> str:
        """Create a new user session."""
        session_token = secrets.token_urlsafe(32)
        
        # Extract client information with proper mapping
        user_agent = client_info.get("user_agent", "Unknown Device")
        browser = client_info.get("browser", "Unknown Browser")
        os_info = client_info.get("operating_system", "Unknown OS")
        
        # Determine device type based on client info
        if client_info.get("is_mobile"):
            device_type = "Mobile"
        elif client_info.get("is_tablet"):
            device_type = "Tablet"
        elif client_info.get("is_pc"):
            device_type = "PC"
        else:
            device_type = "Other"
        
        # Generate device ID based on user agent and IP (simplified)
        import hashlib
        device_id = hashlib.md5(f"{user_agent}{client_info.get('ip_address', '')}".encode()).hexdigest()[:16]
        
        # Extract device name (browser + OS)
        device_name = f"{browser} on {os_info}"
        
        # Extract location
        ip_address = client_info.get("ip_address", "Unknown")
        if ip_address == "Unknown":
            ip_address = None
        city = client_info.get("city")
        country = client_info.get("country")
        
        # Extract OS version and app version
        os_version = os_info if os_info != "Unknown OS" else None
        app_version = "Admin Panel v1.0.0"  # Static for now, can be dynamic later
        
        # Create session record
        session = AdminUserSession(
            user_id=user_id,
            session_token=session_token,
            device_id=device_id,
            device_type=device_type,
            device_name=device_name,
            os_version=os_version,
            app_version=app_version,
            ip_address=ip_address,
            city=city,
            country=country,
            expires_at=datetime.now(timezone.utc) + timedelta(hours=24),  # 24-hour session
            is_active=True
        )
        
        self.db.add(session)
        self.db.commit()
        
        return session_token
    
    async def get_session_by_token(self, session_token: str) -> Optional[AdminUserSession]:
        """Get session by token."""
        return self.db.query(AdminUserSession).filter(
            AdminUserSession.session_token == session_token,
            AdminUserSession.is_active == True
        ).first()
    
    async def update_session_activity(self, session_token: str) -> bool:
        """Update session activity timestamp."""
        session = await self.get_session_by_token(session_token)
        if session and not session.is_expired():
            session.update_activity()
            self.db.commit()
            return True
        return False
    
    async def logout_session(self, session_token: str) -> bool:
        """Logout and deactivate session."""
        session = await self.get_session_by_token(session_token)
        if session:
            session.mark_logout()
            self.db.commit()
            
            # Log logout activity
            self._log_activity(
                user_id=session.user_id,
                action="logout",
                details={
                    "session_token": session_token[:8] + "...",  # Only log partial token
                    "device_type": session.device_type,
                    "ip_address": session.ip_address
                }
            )
            return True
        return False
    
    async def logout_all_sessions(self, user_id: UUID) -> int:
        """Logout all active sessions for a user."""
        sessions = self.db.query(AdminUserSession).filter(
            AdminUserSession.user_id == user_id,
            AdminUserSession.is_active == True
        ).all()
        
        count = 0
        for session in sessions:
            session.mark_logout()
            count += 1
        
        if count > 0:
            self.db.commit()
            self._log_activity(
                user_id=user_id,
                action="logout_all_sessions",
                details={"sessions_count": count}
            )
        
        return count
    
    async def cleanup_expired_sessions(self) -> int:
        """Clean up expired sessions."""
        expired_sessions = self.db.query(AdminUserSession).filter(
            AdminUserSession.is_active == True,
            AdminUserSession.expires_at < datetime.now(timezone.utc)
        ).all()
        
        count = 0
        for session in expired_sessions:
            session.is_active = False
            count += 1
        
        if count > 0:
            self.db.commit()
        
        return count

    def get_user_by_email(self, email: str) -> Optional[AdminUser]:
        """Get admin user by email."""
        return self.user_repository.get_by_email(email)
    
    def get_user_by_id(self, user_id: UUID) -> Optional[AdminUser]:
        """Get admin user by ID."""
        return self.user_repository.get(user_id)
    
    async def create_admin_user(self, user_data: AdminRegisterRequest) -> AdminUser:
        """Create new admin user."""
        # Check if email already exists
        existing_user = self.get_user_by_email(user_data.email)
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
        self._log_activity(
            user_id=user.id,
            action="user_created",
            details={"email": user.email, "is_superuser": user.is_superuser}
        )
        
        return user
    
    async def update_admin_user(self, user_id: UUID, user_data: AdminUserUpdateRequest) -> AdminUser:
        """Update admin user."""
        user = self.get_user_by_id(user_id)
        if not user:
            raise ValidationException("User not found")
        
        # Check email uniqueness if email is being updated
        if user_data.email and user_data.email != user.email:
            existing_user = self.get_user_by_email(user_data.email)
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
        self._log_activity(
            user_id=user_id,
            action="user_updated",
            details={"updated_fields": list(update_data.keys())}
        )
        
        return updated_user
    
    async def change_password(self, user_id: UUID, current_password: str, new_password: str) -> bool:
        """Change admin user password."""
        user = self.get_user_by_id(user_id)
        if not user:
            raise ValidationException("User not found")
        
        # Verify current password
        if not verify_password(current_password, user.hashed_password):
            raise ValidationException("Current password is incorrect")
        
        # Update password
        hashed_password = get_password_hash(new_password)
        self.user_repository.update(user_id, {"hashed_password": hashed_password})
        
        # Log password change
        self._log_activity(
            user_id=user_id,
            action="password_changed",
            details={}
        )
        
        return True
    
    async def deactivate_user(self, user_id: UUID) -> AdminUser:
        """Deactivate admin user."""
        user = self.user_repository.update(user_id, {"is_active": False})
        
        # Log deactivation
        self._log_activity(
            user_id=user_id,
            action="user_deactivated",
            details={}
        )
        
        return user
    
    async def activate_user(self, user_id: UUID) -> AdminUser:
        """Activate admin user."""
        user = self.user_repository.update(user_id, {"is_active": True})
        
        # Log activation
        self._log_activity(
            user_id=user_id,
            action="user_activated",
            details={}
        )
        
        return user
    
    def get_user_sessions(self, user_id: UUID, limit: int = 10) -> list:
        """Get admin user active sessions."""
        sessions = self.db.query(AdminUserSession).filter(
            AdminUserSession.user_id == user_id,
            AdminUserSession.is_active == True,
            AdminUserSession.expires_at > datetime.now(timezone.utc)
        ).order_by(desc(AdminUserSession.last_active_at)).limit(limit).all()
        
        return [
            {
                "id": str(session.id),
                "session_token": session.session_token[:8] + "...",  # Partial token for security
                "device_name": session.device_name,
                "device_type": session.device_type,
                "ip_address": session.ip_address,
                "city": session.city,
                "country": session.country,
                "is_active": session.is_active,
                "created_at": session.created_at.isoformat(),
                "last_active_at": session.last_active_at.isoformat(),
                "expires_at": session.expires_at.isoformat() if session.expires_at else None
            }
            for session in sessions
        ]
    
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
    
    def _log_activity(self, user_id: UUID, action: str, details: dict = None):
        """Log admin user activity."""
        activity_log = AdminAuditLog(
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
        existing_user = self.get_user_by_email(register_data.email)
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
        self._log_activity(
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
        user = self.get_user_by_id(user_id)
        if not user:
            return False
        
        # Log user deletion before deleting
        self._log_activity(
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
    
    def get_dashboard_stats(self) -> dict:
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
        
        total_users = admin_users_count + provider_users_count + customer_users_count
        verified_users = admin_users_count  # Placeholder until verification tracking implemented
        new_users_this_month = 0  # TODO: Calculate actual value from user creation timestamps

        return {
            "total_admin_users": admin_users_count,
            "total_provider_users": provider_users_count, 
            "total_customers": customer_users_count,
            "active_sessions": active_sessions_count,
            "recent_logins": recent_logins_count,
            "system_alerts": 0,  # TODO: Implement system alerts
            "total_users": total_users,
            "active_users": admin_users_count,  # Placeholder until activity tracking is available
            "new_users_this_month": new_users_this_month,
            "verified_users": verified_users,
        }