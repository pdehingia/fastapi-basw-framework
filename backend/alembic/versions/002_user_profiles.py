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
    """Create user profile tables: admins, customers, artists, addresses, audit_logs."""
    
    # Create audit_logs table first (referenced by other tables)
    op.create_table('audit_logs',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('actor_user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('action', sa.VARCHAR(length=120), nullable=False),
        sa.Column('entity', sa.VARCHAR(length=120), nullable=True),
        sa.Column('entity_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('before', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('after', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_audit_logs_actor', 'audit_logs', ['actor_user_id'], unique=False)
    op.create_index('idx_audit_logs_entity', 'audit_logs', ['entity', 'entity_id'], unique=False)
    op.create_index('idx_audit_logs_created_at', 'audit_logs', ['created_at'], unique=False)
    
    # Create addresses table (will be referenced by user profiles)
    op.create_table('addresses',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('owner_user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('owner_type', sa.VARCHAR(length=20), nullable=True),
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
        sa.ForeignKeyConstraint(['owner_user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Setup PostGIS geography column and index
    op.execute("ALTER TABLE addresses ALTER COLUMN location TYPE GEOGRAPHY(POINT, 4326) USING location::geography")
    op.execute("CREATE INDEX idx_addresses_geo ON addresses USING GIST (location)")
    
    # Create admins table
    op.create_table('admins',
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('employee_code', sa.VARCHAR(length=50), nullable=True),
        sa.Column('designation', sa.VARCHAR(length=120), nullable=True),
        sa.Column('department', sa.VARCHAR(length=120), nullable=True),
        sa.Column('role_id', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['role_id'], ['roles.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('user_id'),
        sa.UniqueConstraint('employee_code')
    )
    
    # Create customers table
    op.create_table('customers',
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('date_of_birth', sa.Date(), nullable=True),
        sa.Column('gender', sa.VARCHAR(length=20), nullable=True),
        sa.Column('preferences', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('stats', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('user_id')
    )
    
    # Create artists table (with forward references to tables that will be created later)
    op.create_table('artists',
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('artist_type', sa.VARCHAR(length=30), nullable=False),
        sa.Column('academy_id', postgresql.UUID(as_uuid=True), nullable=True),  # Will be FK later
        sa.Column('graduation_date', sa.Date(), nullable=True),
        sa.Column('years_of_experience', sa.Integer(), nullable=True),
        sa.Column('specializations', postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column('bio', sa.VARCHAR(length=600), nullable=True),
        sa.Column('languages', postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column('address_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('service_radius_km', sa.Integer(), server_default='10', nullable=True),
        sa.Column('verification_status', sa.VARCHAR(length=20), server_default='pending', nullable=True),
        sa.Column('verified_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('subscription_id', postgresql.UUID(as_uuid=True), nullable=True),  # Will be FK later
        sa.Column('subscription_plan', sa.VARCHAR(length=30), server_default='free', nullable=True),
        sa.Column('is_available', sa.Boolean(), server_default='true', nullable=True),
        sa.Column('is_featured', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('trust_score', sa.NUMERIC(precision=5, scale=2), server_default='0', nullable=True),
        sa.Column('performance', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['address_id'], ['addresses.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('user_id')
    )
    op.create_index('idx_artists_type', 'artists', ['artist_type'], unique=False)
    op.create_index('idx_artists_verification', 'artists', ['verification_status'], unique=False)
    op.create_index('idx_artists_available', 'artists', ['is_available'], unique=False)
    op.create_index('idx_artists_trust_score', 'artists', ['trust_score'], unique=False)
    

def downgrade() -> None:
    """Drop user profile tables."""
    op.drop_table('artists')
    op.drop_table('customers')
    op.drop_table('admins')
    op.drop_table('addresses')
    op.drop_table('audit_logs')