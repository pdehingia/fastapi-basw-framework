"""Initial core migration - Extensions, Users, Roles, Sessions, OTP

Revision ID: 001_initial_core
Revises: 
Create Date: 2025-11-12 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_initial_core'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create core tables: extensions, users, roles, permissions, sessions, otp."""
    
    # Enable PostgreSQL extensions
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')
    op.execute('CREATE EXTENSION IF NOT EXISTS "citext"')
    op.execute('CREATE EXTENSION IF NOT EXISTS "postgis"')
    op.execute('CREATE EXTENSION IF NOT EXISTS "pg_trgm"')
    
    # Create roles table
    op.create_table('roles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('role_name', sa.VARCHAR(length=100), nullable=False),
        sa.Column('role_slug', sa.VARCHAR(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('parent_role_id', sa.Integer(), nullable=True),
        sa.Column('level', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('is_system_role', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['parent_role_id'], ['roles.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('role_name'),
        sa.UniqueConstraint('role_slug')
    )
    
    # Create permissions table
    op.create_table('permissions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('permission_name', sa.VARCHAR(length=120), nullable=False),
        sa.Column('permission_slug', sa.VARCHAR(length=120), nullable=False),
        sa.Column('category', sa.VARCHAR(length=60), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('permission_name'),
        sa.UniqueConstraint('permission_slug')
    )
    
    # Create role_permissions table
    op.create_table('role_permissions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('role_id', sa.Integer(), nullable=False),
        sa.Column('permission_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['permission_id'], ['permissions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['role_id'], ['roles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('role_id', 'permission_id')
    )
    
    # Create independent admin_users table
    op.create_table('admin_users',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        
        # Authentication (independent)
        sa.Column('email', sa.VARCHAR(length=255), nullable=False),
        sa.Column('username', sa.VARCHAR(length=100), nullable=False),
        sa.Column('hashed_password', sa.Text(), nullable=False),
        
        # Personal information
        sa.Column('full_name', sa.VARCHAR(length=150), nullable=True),
        sa.Column('phone', sa.VARCHAR(length=20), nullable=True),
        
        # Status flags
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('is_verified', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('email_verified_at', sa.TIMESTAMP(timezone=True), nullable=True),
        
        # Security
        sa.Column('last_login', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('failed_login_attempts', sa.Integer(), server_default='0', nullable=False),
        sa.Column('locked_until', sa.TIMESTAMP(timezone=True), nullable=True),
        
        # Admin-specific fields
        sa.Column('is_superuser', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('permissions', sa.Text(), nullable=True),
        sa.Column('department', sa.VARCHAR(length=100), nullable=True),
        sa.Column('employee_id', sa.VARCHAR(length=50), nullable=True),
        
        # Admin capabilities
        sa.Column('can_manage_users', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('can_manage_system', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('can_view_reports', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('can_manage_providers', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('can_manage_customers', sa.Boolean(), server_default='false', nullable=False),
        
        # Timestamps
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        
        # Constraints
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('username'),
        sa.UniqueConstraint('employee_id')
    )
    op.create_index('idx_admin_users_email', 'admin_users', ['email'], unique=True)
    op.create_index('idx_admin_users_active', 'admin_users', ['is_active'], unique=False)
    op.create_index('idx_admin_users_superuser', 'admin_users', ['is_superuser'], unique=False)
    
    # Create independent provider_users table
    op.create_table('provider_users',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        
        # Authentication (independent)
        sa.Column('email', sa.VARCHAR(length=255), nullable=False),
        sa.Column('username', sa.VARCHAR(length=100), nullable=False),
        sa.Column('hashed_password', sa.Text(), nullable=False),
        
        # Personal information
        sa.Column('full_name', sa.VARCHAR(length=150), nullable=True),
        sa.Column('phone', sa.VARCHAR(length=20), nullable=True),
        
        # Status flags
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('is_verified', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('email_verified_at', sa.TIMESTAMP(timezone=True), nullable=True),
        
        # Security
        sa.Column('last_login', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('failed_login_attempts', sa.Integer(), server_default='0', nullable=False),
        sa.Column('locked_until', sa.TIMESTAMP(timezone=True), nullable=True),
        
        # Provider-specific fields
        sa.Column('business_name', sa.VARCHAR(length=200), nullable=True),
        sa.Column('business_type', sa.VARCHAR(length=100), nullable=True),
        sa.Column('business_registration_number', sa.VARCHAR(length=100), nullable=True),
        sa.Column('tax_id', sa.VARCHAR(length=50), nullable=True),
        
        # Provider status
        sa.Column('verification_status', sa.VARCHAR(length=50), server_default='pending', nullable=False),
        sa.Column('verified_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('verification_documents', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        
        # Business operations
        sa.Column('is_accepting_bookings', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('business_hours', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('service_area', sa.Text(), nullable=True),
        
        # Timestamps
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        
        # Constraints
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('username'),
        sa.UniqueConstraint('business_registration_number')
    )
    op.create_index('idx_provider_users_email', 'provider_users', ['email'], unique=True)
    op.create_index('idx_provider_users_active', 'provider_users', ['is_active'], unique=False)
    op.create_index('idx_provider_users_verification', 'provider_users', ['verification_status'], unique=False)
    
    # Create independent customer_users table
    op.create_table('customer_users',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        
        # Authentication (independent)
        sa.Column('email', sa.VARCHAR(length=255), nullable=True),
        sa.Column('phone', sa.VARCHAR(length=20), nullable=False),
        sa.Column('hashed_password', sa.Text(), nullable=True),
        
        # OAuth authentication
        sa.Column('oauth_google_id', sa.Text(), nullable=True),
        sa.Column('oauth_facebook_id', sa.Text(), nullable=True),
        sa.Column('oauth_apple_id', sa.Text(), nullable=True),
        
        # Personal information
        sa.Column('full_name', sa.VARCHAR(length=150), nullable=True),
        sa.Column('date_of_birth', sa.Date(), nullable=True),
        sa.Column('gender', sa.VARCHAR(length=20), nullable=True),
        sa.Column('profile_image_url', sa.Text(), nullable=True),
        
        # Status flags
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('is_verified', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('phone_verified_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('email_verified_at', sa.TIMESTAMP(timezone=True), nullable=True),
        
        # Security and preferences
        sa.Column('last_login', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('two_factor_enabled', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('preferences', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('favorite_services', postgresql.ARRAY(sa.Text()), nullable=True),
        
        # Customer behavior
        sa.Column('total_bookings', sa.Integer(), server_default='0', nullable=False),
        sa.Column('total_spent', sa.DECIMAL(precision=10, scale=2), server_default='0.00', nullable=False),
        sa.Column('loyalty_points', sa.Integer(), server_default='0', nullable=False),
        
        # Timestamps
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        
        # Constraints
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('phone'),
        sa.UniqueConstraint('oauth_google_id'),
        sa.UniqueConstraint('oauth_facebook_id'),
        sa.UniqueConstraint('oauth_apple_id')
    )
    op.create_index('idx_customer_users_email', 'customer_users', ['email'], unique=False)
    op.create_index('idx_customer_users_phone', 'customer_users', ['phone'], unique=True)
    op.create_index('idx_customer_users_active', 'customer_users', ['is_active'], unique=False)
    
    # Create admin_user_sessions table
    op.create_table('admin_user_sessions',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('session_token', sa.Text(), nullable=False),
        sa.Column('refresh_token', sa.Text(), nullable=True),
        sa.Column('device_id', sa.Text(), nullable=True),
        sa.Column('device_type', sa.VARCHAR(length=30), nullable=True),
        sa.Column('device_name', sa.Text(), nullable=True),
        sa.Column('os_version', sa.VARCHAR(length=50), nullable=True),
        sa.Column('app_version', sa.VARCHAR(length=50), nullable=True),
        sa.Column('ip_address', postgresql.INET(), nullable=True),
        sa.Column('city', sa.VARCHAR(length=100), nullable=True),
        sa.Column('country', sa.VARCHAR(length=100), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('last_active_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('expires_at', sa.TIMESTAMP(timezone=True), server_default=sa.text("now() + interval '30 days'"), nullable=True),
        sa.Column('logged_out_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['admin_users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('refresh_token'),
        sa.UniqueConstraint('session_token')
    )
    op.create_index('idx_admin_sessions_user_id', 'admin_user_sessions', ['user_id'], unique=False)
    op.create_index('idx_admin_sessions_expires', 'admin_user_sessions', ['expires_at'], unique=False)
    op.create_index('idx_admin_sessions_active', 'admin_user_sessions', ['user_id', 'is_active'], unique=False)
    
    # Create provider_user_sessions table
    op.create_table('provider_user_sessions',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('session_token', sa.Text(), nullable=False),
        sa.Column('refresh_token', sa.Text(), nullable=True),
        sa.Column('device_id', sa.Text(), nullable=True),
        sa.Column('device_type', sa.VARCHAR(length=30), nullable=True),
        sa.Column('device_name', sa.Text(), nullable=True),
        sa.Column('os_version', sa.VARCHAR(length=50), nullable=True),
        sa.Column('app_version', sa.VARCHAR(length=50), nullable=True),
        sa.Column('ip_address', postgresql.INET(), nullable=True),
        sa.Column('city', sa.VARCHAR(length=100), nullable=True),
        sa.Column('country', sa.VARCHAR(length=100), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('last_active_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('expires_at', sa.TIMESTAMP(timezone=True), server_default=sa.text("now() + interval '30 days'"), nullable=True),
        sa.Column('logged_out_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['provider_users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('refresh_token'),
        sa.UniqueConstraint('session_token')
    )
    op.create_index('idx_provider_sessions_user_id', 'provider_user_sessions', ['user_id'], unique=False)
    op.create_index('idx_provider_sessions_expires', 'provider_user_sessions', ['expires_at'], unique=False)
    op.create_index('idx_provider_sessions_active', 'provider_user_sessions', ['user_id', 'is_active'], unique=False)
    
    # Create customer_user_sessions table
    op.create_table('customer_user_sessions',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('session_token', sa.Text(), nullable=False),
        sa.Column('refresh_token', sa.Text(), nullable=True),
        sa.Column('device_id', sa.Text(), nullable=True),
        sa.Column('device_type', sa.VARCHAR(length=30), nullable=True),
        sa.Column('device_name', sa.Text(), nullable=True),
        sa.Column('os_version', sa.VARCHAR(length=50), nullable=True),
        sa.Column('app_version', sa.VARCHAR(length=50), nullable=True),
        sa.Column('ip_address', postgresql.INET(), nullable=True),
        sa.Column('city', sa.VARCHAR(length=100), nullable=True),
        sa.Column('country', sa.VARCHAR(length=100), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('last_active_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('expires_at', sa.TIMESTAMP(timezone=True), server_default=sa.text("now() + interval '30 days'"), nullable=True),
        sa.Column('logged_out_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['customer_users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('refresh_token'),
        sa.UniqueConstraint('session_token')
    )
    op.create_index('idx_customer_sessions_user_id', 'customer_user_sessions', ['user_id'], unique=False)
    op.create_index('idx_customer_sessions_expires', 'customer_user_sessions', ['expires_at'], unique=False)
    op.create_index('idx_customer_sessions_active', 'customer_user_sessions', ['user_id', 'is_active'], unique=False)
    
    # Create OTP verifications table (can reference any domain user)
    op.create_table('otp_verifications',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('phone_number', sa.VARCHAR(length=20), nullable=False),
        sa.Column('country_code', sa.VARCHAR(length=5), nullable=False, server_default='+91'),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('user_type', sa.VARCHAR(length=20), nullable=True),  # 'admin', 'provider', 'customer'
        sa.Column('otp_code', sa.VARCHAR(length=6), nullable=False),
        sa.Column('otp_hash', sa.VARCHAR(length=255), nullable=False),
        sa.Column('purpose', sa.VARCHAR(length=50), nullable=False),
        sa.Column('attempts_count', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('max_attempts', sa.Integer(), nullable=True, server_default='3'),
        sa.Column('is_verified', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('is_blocked', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('blocked_until', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('ip_address', postgresql.INET(), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('expires_at', sa.TIMESTAMP(timezone=True), server_default=sa.text("now() + interval '5 minutes'"), nullable=True),
        sa.Column('verified_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_otp_phone_purpose', 'otp_verifications', ['phone_number', 'purpose'], unique=False)
    op.create_index('idx_otp_expires_at', 'otp_verifications', ['expires_at'], unique=False)
    op.create_index('idx_otp_user_id_type', 'otp_verifications', ['user_id', 'user_type'], unique=False)
    
    # Add partial unique index for unverified OTPs
    op.execute("""
        CREATE UNIQUE INDEX uq_otp_phone_purpose_unverified 
        ON otp_verifications (phone_number, purpose) 
        WHERE is_verified = FALSE
    """)


def downgrade() -> None:
    """Drop all core tables."""
    op.drop_table('otp_verifications')
    op.drop_table('customer_user_sessions')
    op.drop_table('provider_user_sessions')
    op.drop_table('admin_user_sessions')
    op.drop_table('customer_users')
    op.drop_table('provider_users')
    op.drop_table('admin_users')
    op.drop_table('role_permissions')
    op.drop_table('permissions')
    op.drop_table('roles')
    
    # Drop extensions (optional, might be used by other schemas)
    # op.execute('DROP EXTENSION IF EXISTS "pg_trgm"')
    # op.execute('DROP EXTENSION IF EXISTS "postgis"')
    # op.execute('DROP EXTENSION IF EXISTS "pgcrypto"')
    # op.execute('DROP EXTENSION IF EXISTS "uuid-ossp"')