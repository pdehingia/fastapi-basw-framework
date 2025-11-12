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
    
    # Create users table
    op.create_table('users',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('phone_e164', sa.VARCHAR(length=20), nullable=True),
        sa.Column('email', postgresql.CITEXT(), nullable=True),
        sa.Column('password_hash', sa.Text(), nullable=True),
        sa.Column('oauth_google_id', sa.Text(), nullable=True),
        sa.Column('oauth_facebook_id', sa.Text(), nullable=True),
        sa.Column('oauth_apple_id', sa.Text(), nullable=True),
        sa.Column('full_name', sa.VARCHAR(length=150), nullable=True),
        sa.Column('profile_image_url', sa.Text(), nullable=True),
        sa.Column('two_factor_enabled', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('is_verified', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('is_blocked', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('block_reason', sa.Text(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('deleted_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('oauth_apple_id'),
        sa.UniqueConstraint('oauth_facebook_id'),
        sa.UniqueConstraint('oauth_google_id'),
        sa.UniqueConstraint('phone_e164')
    )
    op.create_index('idx_users_active', 'users', ['is_active'], unique=False)
    
    # Create user_sessions table
    op.create_table('user_sessions',
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
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('refresh_token'),
        sa.UniqueConstraint('session_token')
    )
    op.create_index('idx_sessions_user_id', 'user_sessions', ['user_id'], unique=False)
    op.create_index('idx_sessions_expires', 'user_sessions', ['expires_at'], unique=False)
    op.create_index('idx_sessions_active', 'user_sessions', ['user_id', 'is_active'], unique=False)
    
    # Create OTP verifications table
    op.create_table('otp_verifications',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('phone_number', sa.VARCHAR(length=20), nullable=False),
        sa.Column('country_code', sa.VARCHAR(length=5), nullable=False, server_default='+91'),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
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
    op.create_index('idx_otp_user_id', 'otp_verifications', ['user_id'], unique=False)
    
    # Add unique constraint for unverified OTPs
    op.execute("""
        ALTER TABLE otp_verifications 
        ADD CONSTRAINT uq_otp_phone_purpose_unverified 
        UNIQUE (phone_number, purpose) 
        WHERE is_verified = FALSE
    """)


def downgrade() -> None:
    """Drop all core tables."""
    op.drop_table('otp_verifications')
    op.drop_table('user_sessions')
    op.drop_table('users')
    op.drop_table('role_permissions')
    op.drop_table('permissions')
    op.drop_table('roles')
    
    # Drop extensions (optional, might be used by other schemas)
    # op.execute('DROP EXTENSION IF EXISTS "pg_trgm"')
    # op.execute('DROP EXTENSION IF EXISTS "postgis"')
    # op.execute('DROP EXTENSION IF EXISTS "pgcrypto"')
    # op.execute('DROP EXTENSION IF EXISTS "uuid-ossp"')