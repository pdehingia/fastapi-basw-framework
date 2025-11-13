"""
Independent user models for complete domain separation.
Each domain has its own login system and user table.
"""

from sqlalchemy import Column, String, Boolean, Text, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.shared.models.base import BaseModel


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
    business_license = Column(String, nullable=True)
    tax_id = Column(String, nullable=True)
    
    # Provider status
    is_approved = Column(Boolean, default=False)
    approval_date = Column(DateTime, nullable=True)
    approved_by_admin_email = Column(String, nullable=True)  # Admin email who approved (no FK)
    
    # Service capabilities
    service_categories = Column(Text, nullable=True)  # JSON array of service types
    service_areas = Column(Text, nullable=True)       # JSON array of service locations
    
    # Business metrics
    rating = Column(String, default="0.0")
    total_bookings = Column(Integer, default=0)
    is_featured = Column(Boolean, default=False)
    
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
class AdminAuditLog(BaseModel):
    """
    Admin audit log - tracks admin actions only.
    """
    
    __tablename__ = "admin_audit_logs"
    
    # Admin reference (by email, not FK)
    admin_email = Column(String, nullable=False)
    admin_name = Column(String, nullable=True)
    
    # Action details
    action = Column(String, nullable=False)
    resource = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(Text, nullable=True)
    
    # Additional context
    details = Column(Text, nullable=True)  # JSON string
    status = Column(String, nullable=False)  # 'success', 'failed'
    
    def __repr__(self):
        return f"<AdminAuditLog(admin={self.admin_email}, action={self.action})>"


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