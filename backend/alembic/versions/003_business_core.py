"""Business core entities - Academies, Salons, Services, Courses

Revision ID: 003_business_core
Revises: 002_user_profiles
Create Date: 2025-11-12 12:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '003_business_core'
down_revision = '002_user_profiles'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create business core tables: academies, salons, salon_artists, services, courses."""
    
    # Create academies table (linked to provider_users)
    op.create_table('academies',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('provider_user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('academy_name', sa.VARCHAR(length=255), nullable=False),
        sa.Column('gst_number', sa.VARCHAR(length=20), nullable=True),
        sa.Column('registration_number', sa.VARCHAR(length=100), nullable=True),
        sa.Column('address_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('commission_rate', sa.NUMERIC(precision=5, scale=2), server_default='5.00', nullable=True),
        sa.Column('is_verified', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=True),
        sa.Column('branding', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['address_id'], ['addresses.id'], ),
        sa.ForeignKeyConstraint(['provider_user_id'], ['provider_users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('provider_user_id')
    )
    op.create_index('idx_academies_verified', 'academies', ['is_verified'], unique=False)
    op.create_index('idx_academies_active', 'academies', ['is_active'], unique=False)
    
    # Create salons table
    op.create_table('salons',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('salon_name', sa.VARCHAR(length=255), nullable=False),
        sa.Column('salon_slug', sa.VARCHAR(length=255), nullable=False),
        sa.Column('address_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('commission_rate', sa.NUMERIC(precision=5, scale=2), server_default='15.00', nullable=True),
        sa.Column('is_verified', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=True),
        sa.Column('business_hours', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['address_id'], ['addresses.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('salon_slug')
    )
    op.create_index('idx_salons_verified', 'salons', ['is_verified'], unique=False)
    op.create_index('idx_salons_active', 'salons', ['is_active'], unique=False)
    
    # Create salon_providers table (artists are now provider_users)
    op.create_table('salon_providers',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('salon_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('provider_user_id', postgresql.UUID(as_uuid=True), nullable=False),  # Changed from artist_user_id
        sa.Column('employment_type', sa.VARCHAR(length=20), nullable=False),
        sa.Column('joined_date', sa.Date(), nullable=False),
        sa.Column('left_date', sa.Date(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=True),
        sa.Column('total_bookings', sa.Integer(), server_default='0', nullable=True),
        sa.Column('total_revenue', sa.NUMERIC(precision=12, scale=2), server_default='0', nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['provider_user_id'], ['provider_users.id'], ondelete='CASCADE'),  # Changed from artists.user_id
        sa.ForeignKeyConstraint(['salon_id'], ['salons.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('salon_id', 'provider_user_id')  # Changed from artist_user_id
    )
    op.create_index('idx_salon_providers_salon', 'salon_providers', ['salon_id', 'is_active'], unique=False)  # Changed table name
    op.create_index('idx_salon_providers_provider', 'salon_providers', ['provider_user_id'], unique=False)  # Changed table and column name
    
    # Create services table
    op.create_table('services',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('service_name', sa.VARCHAR(length=200), nullable=False),
        sa.Column('service_slug', sa.VARCHAR(length=200), nullable=False),
        sa.Column('category', sa.VARCHAR(length=60), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('suggested_price_min', sa.NUMERIC(precision=10, scale=2), nullable=True),
        sa.Column('suggested_price_max', sa.NUMERIC(precision=10, scale=2), nullable=True),
        sa.Column('default_duration_minutes', sa.Integer(), nullable=True),
        sa.Column('image_url', sa.Text(), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=True),
        sa.Column('is_featured', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('display_order', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('service_name'),
        sa.UniqueConstraint('service_slug')
    )
    op.create_index('idx_services_category', 'services', ['category'], unique=False)
    op.create_index('idx_services_active', 'services', ['is_active'], unique=False)
    op.create_index('idx_services_featured', 'services', ['is_featured'], unique=False)
    
    # Create courses table
    op.create_table('courses',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('course_name', sa.VARCHAR(length=255), nullable=False),
        sa.Column('course_slug', sa.VARCHAR(length=255), nullable=False),
        sa.Column('course_code', sa.VARCHAR(length=60), nullable=True),
        sa.Column('category', sa.VARCHAR(length=100), nullable=False),
        sa.Column('level', sa.VARCHAR(length=50), nullable=False),
        sa.Column('short_description', sa.Text(), nullable=True),
        sa.Column('full_description', sa.Text(), nullable=True),
        sa.Column('duration_months', sa.Integer(), nullable=False),
        sa.Column('total_hours', sa.Integer(), nullable=True),
        sa.Column('syllabus', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('suggested_fees_min', sa.NUMERIC(precision=10, scale=2), nullable=True),
        sa.Column('suggested_fees_max', sa.NUMERIC(precision=10, scale=2), nullable=True),
        sa.Column('image_url', sa.Text(), nullable=True),
        sa.Column('brochure_url', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=True),
        sa.Column('is_featured', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('course_code'),
        sa.UniqueConstraint('course_slug')
    )
    op.create_index('idx_courses_category', 'courses', ['category'], unique=False)
    op.create_index('idx_courses_level', 'courses', ['level'], unique=False)
    op.create_index('idx_courses_active', 'courses', ['is_active'], unique=False)
    
    # Create academy_courses table
    op.create_table('academy_courses',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('academy_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('course_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('custom_course_name', sa.VARCHAR(length=255), nullable=True),
        sa.Column('fees', sa.NUMERIC(precision=10, scale=2), nullable=False),
        sa.Column('duration_months', sa.Integer(), nullable=False),
        sa.Column('batch_size_min', sa.Integer(), nullable=True),
        sa.Column('batch_size_max', sa.Integer(), nullable=True),
        sa.Column('next_batch_start_date', sa.Date(), nullable=True),
        sa.Column('total_students_enrolled', sa.Integer(), server_default='0', nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=True),
        sa.Column('is_accepting_enrollment', sa.Boolean(), server_default='true', nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['academy_id'], ['academies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('academy_id', 'course_id')
    )
    op.create_index('idx_academy_courses_academy', 'academy_courses', ['academy_id', 'is_active'], unique=False)
    op.create_index('idx_academy_courses_course', 'academy_courses', ['course_id'], unique=False)


def downgrade() -> None:
    """Drop business core tables."""
    # Drop tables in reverse order
    op.drop_table('academy_courses')
    op.drop_table('courses')
    op.drop_table('services')
    op.drop_table('salon_providers')  # Changed from salon_artists
    op.drop_table('salons')
    op.drop_table('academies')