"""
Independent user models for complete domain separation.
Each domain has its own login system and user table.
"""

from sqlalchemy import Column, String, Boolean, Text, DateTime, Integer, BigInteger, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime, timezone
import uuid

from app.shared.models.base import BaseModel, Base


class AdminUser(BaseModel):
    """
    Admin user table - completely independent admin authentication.
    Domain: admin.maya.com
    """
    
    __tablename__ = "admin_users"
    
    # Authentication (independent)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # Personal information
    full_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    
    # Status flags
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    email_verified_at = Column(DateTime, nullable=True)
    
    # Security
    last_login = Column(DateTime, nullable=True)
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)
    
    # Admin-specific fields
    is_superuser = Column(Boolean, default=False)
    permissions = Column(Text, nullable=True)  # JSON string of permissions
    department = Column(String, nullable=True)
    employee_id = Column(String, unique=True, nullable=True)
    
    # Admin capabilities
    can_manage_users = Column(Boolean, default=False)
    can_manage_system = Column(Boolean, default=False)
    can_view_reports = Column(Boolean, default=False)
    can_manage_providers = Column(Boolean, default=False)
    can_manage_customers = Column(Boolean, default=False)
    
    def __repr__(self):
        return f"<AdminUser(id={self.id}, email={self.email}, superuser={self.is_superuser})>"


class ProviderUser(BaseModel):
    """
    Provider user table - completely independent provider authentication.
    Domain: provider.maya.com
    """
    
    __tablename__ = "provider_users"
    
    # Authentication (independent)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # Personal information
    full_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    
    # Status flags
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    email_verified_at = Column(DateTime, nullable=True)
    
    # Security
    last_login = Column(DateTime, nullable=True)
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)
    
    # Business information
    business_name = Column(String, nullable=True)
    business_type = Column(String, nullable=True)
    business_registration_number = Column(String, nullable=True)  # Renamed from business_license to match DB
    tax_id = Column(String, nullable=True)
    
    # Provider status - matches actual DB schema
    verification_status = Column(String, default="pending")  # 'pending', 'verified', 'rejected'
    verified_at = Column(DateTime, nullable=True)
    verification_documents = Column(Text, nullable=True)  # JSONB in DB
    
    # Business operations
    is_accepting_bookings = Column(Boolean, default=True)
    business_hours = Column(Text, nullable=True)  # JSONB in DB
    service_area = Column(Text, nullable=True)
    
    def __repr__(self):
        return f"<ProviderUser(id={self.id}, email={self.email}, business={self.business_name})>"


class CustomerUser(BaseModel):
    """
    Customer user table - completely independent customer authentication.
    Domain: app.maya.com
    """
    
    __tablename__ = "customer_users"
    
    # Authentication (independent)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # Personal information
    full_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    
    # Status flags
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    email_verified_at = Column(DateTime, nullable=True)
    
    # Security
    last_login = Column(DateTime, nullable=True)
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)
    
    # Customer preferences
    preferred_language = Column(String, default="en")
    preferred_currency = Column(String, default="USD")
    timezone = Column(String, nullable=True)
    
    # Address information
    address_line1 = Column(String, nullable=True)
    address_line2 = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    postal_code = Column(String, nullable=True)
    country = Column(String, nullable=True)
    
    # Customer metrics
    total_bookings = Column(Integer, default=0)
    total_spent = Column(String, default="0.00")
    loyalty_points = Column(Integer, default=0)
    preferred_providers = Column(Text, nullable=True)  # JSON array of provider emails
    
    # Marketing preferences
    email_notifications = Column(Boolean, default=True)
    sms_notifications = Column(Boolean, default=False)
    marketing_emails = Column(Boolean, default=False)
    
    def __repr__(self):
        return f"<CustomerUser(id={self.id}, email={self.email}, bookings={self.total_bookings})>"


# Separate audit logs for each domain (no cross-domain references)
class AdminUserSession(Base):
    """
    Admin user session tracking - maps to admin_user_sessions table.
    Tracks login sessions with device and location information.
    Note: This table doesn't have updated_at column, so it doesn't inherit from BaseModel.
    """
    
    __tablename__ = "admin_user_sessions"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Session management
    user_id = Column(UUID(as_uuid=True), ForeignKey("admin_users.id", ondelete="CASCADE"), nullable=False, index=True)
    session_token = Column(Text, nullable=False, unique=True)  # Unique session identifier
    refresh_token = Column(Text, nullable=True, unique=True)    # For token refresh (optional)
    
    # Device information
    device_id = Column(Text, nullable=True)                     # Unique device identifier
    device_type = Column(String(30), nullable=True)            # "PC", "Mobile", "Tablet"
    device_name = Column(Text, nullable=True)                  # "Chrome Browser", "Windows PC"
    os_version = Column(String(50), nullable=True)             # "Windows 10", "macOS 12.0"
    app_version = Column(String(50), nullable=True)            # "Admin Panel v1.0.0"
    
    # Location and security (Note: ip_address is INET type in DB, but String works)
    ip_address = Column(String, nullable=True)                 # Client IP address
    city = Column(String(100), nullable=True)                  # Derived from IP
    country = Column(String(100), nullable=True)               # Derived from IP
    
    # Session status
    is_active = Column(Boolean, default=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)
    last_active_at = Column(DateTime, default=datetime.utcnow, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    logged_out_at = Column(DateTime, nullable=True)
    
    def __repr__(self):
        return f"<AdminUserSession(user_id={self.user_id}, device_type={self.device_type}, active={self.is_active})>"

    def is_expired(self) -> bool:
        """Check if session is expired."""
        if not self.expires_at:
            return False
        # Use timezone-aware datetime for comparison
        now = datetime.now(timezone.utc)
        # If expires_at is naive, assume it's UTC
        if self.expires_at.tzinfo is None:
            expires_at = self.expires_at.replace(tzinfo=timezone.utc)
        else:
            expires_at = self.expires_at
        return now > expires_at

    def mark_logout(self):
        """Mark session as logged out."""
        self.is_active = False
        self.logged_out_at = datetime.now(timezone.utc)

    def update_activity(self):
        """Update last activity timestamp."""
        self.last_active_at = datetime.now(timezone.utc)


class AdminAuditLog(BaseModel):
    """
    Admin audit log - tracks admin actions only.
    """
    
    __tablename__ = "admin_audit_logs"
    
    # Primary key override (BigInteger instead of UUID)
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    
    # Admin reference (by UUID FK to admin_users)
    admin_user_id = Column(UUID(as_uuid=True), ForeignKey("admin_users.id", ondelete="SET NULL"), nullable=True)
    
    # Action details
    action = Column(String(120), nullable=False)
    entity = Column(String(120), nullable=True)
    entity_id = Column(UUID(as_uuid=True), nullable=True)
    
    # Audit data - what changed
    before = Column(JSONB, nullable=True)  # Data before change
    after = Column(JSONB, nullable=True)   # Data after change
    
    # No updated_at column in the actual table - only created_at
    updated_at = None
    
    def __repr__(self):
        return f"<AdminAuditLog(admin_user_id={self.admin_user_id}, action={self.action})>"


class ProviderAuditLog(BaseModel):
    """
    Provider audit log - tracks provider actions only.
    """
    
    __tablename__ = "provider_audit_logs"
    
    # Provider reference (by email, not FK)
    provider_email = Column(String, nullable=False)
    provider_name = Column(String, nullable=True)
    
    # Action details
    action = Column(String, nullable=False)
    resource = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(Text, nullable=True)
    
    # Additional context
    details = Column(Text, nullable=True)  # JSON string
    status = Column(String, nullable=False)  # 'success', 'failed'
    
    def __repr__(self):
        return f"<ProviderAuditLog(provider={self.provider_email}, action={self.action})>"


class CustomerAuditLog(BaseModel):
    """
    Customer audit log - tracks customer actions only.
    """
    
    __tablename__ = "customer_audit_logs"
    
    # Customer reference (by email, not FK)
    customer_email = Column(String, nullable=False)
    customer_name = Column(String, nullable=True)
    
    # Action details
    action = Column(String, nullable=False)
    resource = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(Text, nullable=True)
    
    # Additional context
    details = Column(Text, nullable=True)  # JSON string
    status = Column(String, nullable=False)  # 'success', 'failed'
    
    def __repr__(self):
        return f"<CustomerAuditLog(customer={self.customer_email}, action={self.action})>"


class AdminSession(BaseModel):
    """Admin user session tracking."""
    
    __tablename__ = "admin_sessions"
    
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    session_token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(Text, nullable=True)
    
    def __repr__(self):
        return f"<AdminSession(user_id={self.user_id}, active={self.is_active})>"


class ProviderSession(BaseModel):
    """Provider user session tracking."""
    
    __tablename__ = "provider_sessions"
    
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    session_token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(Text, nullable=True)
    
    def __repr__(self):
        return f"<ProviderSession(user_id={self.user_id}, active={self.is_active})>"


class CustomerSession(BaseModel):
    """Customer user session tracking."""
    
    __tablename__ = "customer_sessions"
    
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    session_token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(Text, nullable=True)
    
    def __repr__(self):
        return f"<CustomerSession(user_id={self.user_id}, active={self.is_active})>"


# Aliases for compatibility
AdminActivityLog = AdminAuditLog
ProviderActivityLog = ProviderAuditLog
CustomerActivityLog = CustomerAuditLog