"""Add provider business details and salon management tables

Revision ID: 006_providers_table  
Revises: 005_advanced_features
Create Date: 2025-11-12 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '006_providers_table'
down_revision = '005_advanced_features'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create provider business details table and salon management tables."""
    
    # Create provider_business_details table (extends provider_users)
    op.create_table('provider_business_details',
        sa.Column('provider_user_id', postgresql.UUID(as_uuid=True), nullable=False),
        
        # Advanced business information
        sa.Column('business_description', sa.Text(), nullable=True),
        sa.Column('business_website', sa.VARCHAR(length=255), nullable=True),
        sa.Column('business_social_media', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        
        # Approval and verification (additional to basic verification in provider_users)
        sa.Column('is_approved', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('approval_date', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('approved_by', postgresql.UUID(as_uuid=True), nullable=True),
        
        # Business capabilities and services
        sa.Column('service_categories', postgresql.JSONB(astext_type=sa.Text()), nullable=True),  # ['hair', 'nails', 'makeup']
        sa.Column('service_areas', postgresql.JSONB(astext_type=sa.Text()), nullable=True),       # Geographic areas served
        sa.Column('business_settings', postgresql.JSONB(astext_type=sa.Text()), nullable=True),   # Provider preferences
        
        # Financial and performance metrics
        sa.Column('commission_rate', sa.NUMERIC(precision=5, scale=2), server_default='15.00', nullable=True),
        sa.Column('rating', sa.NUMERIC(precision=3, scale=2), server_default='0.00', nullable=True),
        sa.Column('total_bookings', sa.Integer(), server_default='0', nullable=True),
        sa.Column('total_revenue', sa.NUMERIC(precision=15, scale=2), server_default='0.00', nullable=True),
        sa.Column('is_featured', sa.Boolean(), server_default='false', nullable=False),
        
        # Status and activity (additional to basic status in provider_users)
        sa.Column('last_business_activity', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('suspension_reason', sa.Text(), nullable=True),
        sa.Column('suspended_until', sa.TIMESTAMP(timezone=True), nullable=True),
        
        # Timestamps
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        
        # Constraints
        sa.ForeignKeyConstraint(['provider_user_id'], ['provider_users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['approved_by'], ['admin_users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('provider_user_id')
    )
    
    # Create indexes for common queries
    op.create_index('idx_provider_business_approved', 'provider_business_details', ['is_approved'], unique=False)
    op.create_index('idx_provider_business_featured', 'provider_business_details', ['is_featured'], unique=False)
    op.create_index('idx_provider_business_rating', 'provider_business_details', ['rating'], unique=False)
    # Create GIN index for JSONB column using raw SQL
    op.execute("CREATE INDEX idx_provider_business_categories ON provider_business_details USING gin (service_categories)")
    
    # Create provider_salons junction table (one provider can own multiple salons)
    op.create_table('provider_salons',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('provider_user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('salon_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('ownership_type', sa.VARCHAR(length=50), nullable=False),  # 'owner', 'manager', 'partner'
        sa.Column('ownership_percentage', sa.NUMERIC(precision=5, scale=2), nullable=True),  # For partnerships
        sa.Column('joined_date', sa.Date(), nullable=False),
        sa.Column('left_date', sa.Date(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('permissions', postgresql.JSONB(astext_type=sa.Text()), nullable=True),  # What they can manage
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        
        # Constraints  
        sa.ForeignKeyConstraint(['provider_user_id'], ['provider_users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['salon_id'], ['salons.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('provider_user_id', 'salon_id')
    )
    
    # Create indexes for provider_salons
    op.create_index('idx_provider_salons_provider', 'provider_salons', ['provider_user_id', 'is_active'], unique=False)
    op.create_index('idx_provider_salons_salon', 'provider_salons', ['salon_id', 'is_active'], unique=False)
    op.create_index('idx_provider_salons_ownership', 'provider_salons', ['ownership_type'], unique=False)
    
    # Add salon owner reference to salons table (for quick queries)
    op.add_column('salons', sa.Column('primary_owner_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key('fk_salons_primary_owner', 'salons', 'provider_users', ['primary_owner_id'], ['id'])
    op.create_index('idx_salons_primary_owner', 'salons', ['primary_owner_id'], unique=False)


def downgrade() -> None:
    """Remove provider business details and related changes."""
    
    # Drop salon owner reference
    op.drop_index('idx_salons_primary_owner', table_name='salons')
    op.drop_constraint('fk_salons_primary_owner', 'salons', type_='foreignkey')
    op.drop_column('salons', 'primary_owner_id')
    
    # Drop provider_salons table
    op.drop_index('idx_provider_salons_ownership', table_name='provider_salons')
    op.drop_index('idx_provider_salons_salon', table_name='provider_salons')
    op.drop_index('idx_provider_salons_provider', table_name='provider_salons')
    op.drop_table('provider_salons')
    
    # Drop provider_business_details table
    op.drop_index('idx_provider_business_categories', table_name='provider_business_details')
    op.drop_index('idx_provider_business_rating', table_name='provider_business_details')
    op.drop_index('idx_provider_business_featured', table_name='provider_business_details')
    op.drop_index('idx_provider_business_approved', table_name='provider_business_details')
    op.drop_table('provider_business_details')