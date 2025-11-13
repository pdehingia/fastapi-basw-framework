"""User profiles and audit tables - Admins, Customers, Artists, Addresses, Audit

Revision ID: 002_user_profiles
Revises: 001_initial_core
Create Date: 2025-11-12 12:15:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002_user_profiles'
down_revision = '001_initial_core'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create audit tables and addresses table for domain-specific users."""
    
    # Create domain-specific audit tables
    op.create_table('admin_audit_logs',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('admin_user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('action', sa.VARCHAR(length=120), nullable=False),
        sa.Column('entity', sa.VARCHAR(length=120), nullable=True),
        sa.Column('entity_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('before', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('after', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['admin_user_id'], ['admin_users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_admin_audit_logs_user', 'admin_audit_logs', ['admin_user_id'], unique=False)
    op.create_index('idx_admin_audit_logs_entity', 'admin_audit_logs', ['entity', 'entity_id'], unique=False)
    op.create_index('idx_admin_audit_logs_created_at', 'admin_audit_logs', ['created_at'], unique=False)
    
    op.create_table('provider_audit_logs',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('provider_user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('action', sa.VARCHAR(length=120), nullable=False),
        sa.Column('entity', sa.VARCHAR(length=120), nullable=True),
        sa.Column('entity_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('before', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('after', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['provider_user_id'], ['provider_users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_provider_audit_logs_user', 'provider_audit_logs', ['provider_user_id'], unique=False)
    op.create_index('idx_provider_audit_logs_entity', 'provider_audit_logs', ['entity', 'entity_id'], unique=False)
    op.create_index('idx_provider_audit_logs_created_at', 'provider_audit_logs', ['created_at'], unique=False)
    
    op.create_table('customer_audit_logs',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('customer_user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('action', sa.VARCHAR(length=120), nullable=False),
        sa.Column('entity', sa.VARCHAR(length=120), nullable=True),
        sa.Column('entity_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('before', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('after', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['customer_user_id'], ['customer_users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_customer_audit_logs_user', 'customer_audit_logs', ['customer_user_id'], unique=False)
    op.create_index('idx_customer_audit_logs_entity', 'customer_audit_logs', ['entity', 'entity_id'], unique=False)
    op.create_index('idx_customer_audit_logs_created_at', 'customer_audit_logs', ['created_at'], unique=False)
    
    # Create addresses table (supports all user types)
    op.create_table('addresses',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('owner_user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('owner_type', sa.VARCHAR(length=20), nullable=True),  # 'admin', 'provider', 'customer'
        sa.Column('label', sa.VARCHAR(length=100), nullable=True),
        sa.Column('address_line1', sa.VARCHAR(length=255), nullable=True),
        sa.Column('address_line2', sa.VARCHAR(length=255), nullable=True),
        sa.Column('city', sa.VARCHAR(length=120), nullable=True),
        sa.Column('state', sa.VARCHAR(length=120), nullable=True),
        sa.Column('pincode', sa.VARCHAR(length=20), nullable=True),
        sa.Column('country', sa.VARCHAR(length=60), server_default='India', nullable=True),
        sa.Column('location', sa.Text(), nullable=True),  # Will be GEOGRAPHY(POINT, 4326) after PostGIS setup
        sa.Column('contact_name', sa.VARCHAR(length=120), nullable=True),
        sa.Column('contact_phone', sa.VARCHAR(length=20), nullable=True),
        sa.Column('is_verified', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('is_default', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Setup PostGIS geography column and index
    op.execute("ALTER TABLE addresses ALTER COLUMN location TYPE GEOGRAPHY(POINT, 4326) USING location::geography")
    op.execute("CREATE INDEX idx_addresses_geo ON addresses USING GIST (location)")
    op.create_index('idx_addresses_owner', 'addresses', ['owner_user_id', 'owner_type'], unique=False)
    

def downgrade() -> None:
    """Drop user profile tables."""
    op.drop_table('addresses')
    op.drop_table('customer_audit_logs')
    op.drop_table('provider_audit_logs')
    op.drop_table('admin_audit_logs')