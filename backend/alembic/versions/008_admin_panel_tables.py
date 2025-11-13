"""008_admin_panel_tables

Revision ID: 008_admin_panel_tables
Revises: 007_support_tickets_system
Create Date: 2025-11-13 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '008_admin_panel_tables'
down_revision = '007_support_tickets_system'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Upgrade schema - Add Admin Panel tables and modify existing ones."""
    
    # 1. Academy Students - Link table between academies and artists
    op.create_table('academy_students',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('academy_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('artist_user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('enrollment_date', sa.Date(), nullable=False),
        sa.Column('graduation_date', sa.Date(), nullable=True),
        sa.Column('course_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('course_name', sa.VARCHAR(length=255), nullable=False),
        sa.Column('maya_registration_status', sa.VARCHAR(length=30), nullable=False, server_default='pending'),
        sa.Column('invitation_sent', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('invitation_sent_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('student_photo_url', sa.Text(), nullable=True),
        sa.Column('certificate_url', sa.Text(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('academy_id', 'artist_user_id', name='uq_academy_artist'),
        sa.ForeignKeyConstraint(['academy_id'], ['academies.id'], name='fk_academy_students_academy_id'),
        sa.ForeignKeyConstraint(['artist_user_id'], ['provider_users.id'], name='fk_academy_students_artist_user_id'),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], name='fk_academy_students_course_id')
    )
    op.create_index('idx_academy_students_academy', 'academy_students', ['academy_id'], unique=False)
    op.create_index('idx_academy_students_artist', 'academy_students', ['artist_user_id'], unique=False)
    
    # 2. PPC Campaigns for academies
    op.create_table('ppc_campaigns',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('academy_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('course_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('campaign_name', sa.VARCHAR(length=255), nullable=False),
        sa.Column('platform', sa.VARCHAR(length=50), nullable=False),  # google, facebook, etc
        sa.Column('campaign_type', sa.VARCHAR(length=50), nullable=False),  # search, display, video, etc
        sa.Column('budget_type', sa.VARCHAR(length=20), nullable=False),  # daily, monthly
        sa.Column('budget_amount', sa.NUMERIC(precision=10, scale=2), nullable=False),
        sa.Column('target_keywords', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('target_demographics', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('target_locations', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('campaign_status', sa.VARCHAR(length=30), nullable=False, server_default='draft'),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('impressions', sa.BigInteger(), server_default='0', nullable=True),
        sa.Column('clicks', sa.Integer(), server_default='0', nullable=True),
        sa.Column('conversions', sa.Integer(), server_default='0', nullable=True),
        sa.Column('cost', sa.NUMERIC(precision=12, scale=2), server_default='0.00', nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['academy_id'], ['academies.id'], name='fk_ppc_campaigns_academy_id'),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], name='fk_ppc_campaigns_course_id')
    )
    op.create_index('idx_ppc_campaigns_academy', 'ppc_campaigns', ['academy_id'], unique=False)
    op.create_index('idx_ppc_campaigns_status', 'ppc_campaigns', ['campaign_status'], unique=False)
    
    # 3. Admission Inquiries for academies
    op.create_table('admission_inquiries',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('academy_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('course_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('full_name', sa.VARCHAR(length=255), nullable=False),
        sa.Column('email', sa.VARCHAR(length=255), nullable=False),
        sa.Column('phone', sa.VARCHAR(length=20), nullable=False),
        sa.Column('age', sa.Integer(), nullable=True),
        sa.Column('education_level', sa.VARCHAR(length=100), nullable=True),
        sa.Column('previous_experience', sa.Text(), nullable=True),
        sa.Column('inquiry_source', sa.VARCHAR(length=50), nullable=True),  # website, phone, walk-in, referral
        sa.Column('inquiry_status', sa.VARCHAR(length=30), nullable=False, server_default='new'),
        sa.Column('follow_up_date', sa.Date(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('conversion_probability', sa.Integer(), nullable=True),  # 1-10 scale
        sa.Column('assigned_to', postgresql.UUID(as_uuid=True), nullable=True),  # admin_user_id
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['academy_id'], ['academies.id'], name='fk_admission_inquiries_academy_id'),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], name='fk_admission_inquiries_course_id'),
        sa.ForeignKeyConstraint(['assigned_to'], ['admin_users.id'], name='fk_admission_inquiries_assigned_to')
    )
    op.create_index('idx_admission_inquiries_academy', 'admission_inquiries', ['academy_id'], unique=False)
    op.create_index('idx_admission_inquiries_status', 'admission_inquiries', ['inquiry_status'], unique=False)
    
    # 4. Canned Responses for support and inquiries
    op.create_table('canned_responses',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('title', sa.VARCHAR(length=255), nullable=False),
        sa.Column('category', sa.VARCHAR(length=100), nullable=False),  # support, inquiry, marketing
        sa.Column('response_text', sa.Text(), nullable=False),
        sa.Column('tags', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('usage_count', sa.Integer(), server_default='0', nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['created_by'], ['admin_users.id'], name='fk_canned_responses_created_by')
    )
    op.create_index('idx_canned_responses_category', 'canned_responses', ['category'], unique=False)
    op.create_index('idx_canned_responses_active', 'canned_responses', ['is_active'], unique=False)
    
    # 5. Email Templates (must come before email_campaigns due to FK)
    op.create_table('email_templates',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('template_name', sa.VARCHAR(length=255), nullable=False),
        sa.Column('template_category', sa.VARCHAR(length=100), nullable=False),
        sa.Column('subject_template', sa.VARCHAR(length=255), nullable=False),
        sa.Column('html_content', sa.Text(), nullable=False),
        sa.Column('text_content', sa.Text(), nullable=True),
        sa.Column('template_variables', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_system_template', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('usage_count', sa.Integer(), server_default='0', nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['created_by'], ['admin_users.id'], name='fk_email_templates_created_by')
    )
    op.create_index('idx_email_templates_category', 'email_templates', ['template_category'], unique=False)
    op.create_index('idx_email_templates_active', 'email_templates', ['is_active'], unique=False)
    
    # 6. Email Campaigns
    op.create_table('email_campaigns',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('campaign_name', sa.VARCHAR(length=255), nullable=False),
        sa.Column('campaign_type', sa.VARCHAR(length=50), nullable=False),  # promotional, newsletter, notification
        sa.Column('subject_line', sa.VARCHAR(length=255), nullable=False),
        sa.Column('template_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('sender_name', sa.VARCHAR(length=100), nullable=False),
        sa.Column('sender_email', sa.VARCHAR(length=255), nullable=False),
        sa.Column('target_audience', sa.VARCHAR(length=50), nullable=False),  # all_users, academies, artists, customers
        sa.Column('segment_criteria', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('campaign_status', sa.VARCHAR(length=30), nullable=False, server_default='draft'),
        sa.Column('scheduled_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('sent_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('total_recipients', sa.Integer(), server_default='0', nullable=True),
        sa.Column('total_sent', sa.Integer(), server_default='0', nullable=True),
        sa.Column('total_delivered', sa.Integer(), server_default='0', nullable=True),
        sa.Column('total_opened', sa.Integer(), server_default='0', nullable=True),
        sa.Column('total_clicked', sa.Integer(), server_default='0', nullable=True),
        sa.Column('total_unsubscribed', sa.Integer(), server_default='0', nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['template_id'], ['email_templates.id'], name='fk_email_campaigns_template_id'),
        sa.ForeignKeyConstraint(['created_by'], ['admin_users.id'], name='fk_email_campaigns_created_by')
    )
    op.create_index('idx_email_campaigns_status', 'email_campaigns', ['campaign_status'], unique=False)
    op.create_index('idx_email_campaigns_type', 'email_campaigns', ['campaign_type'], unique=False)
    
    # 7. SMS Campaigns
    op.create_table('sms_campaigns',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('campaign_name', sa.VARCHAR(length=255), nullable=False),
        sa.Column('campaign_type', sa.VARCHAR(length=50), nullable=False),  # promotional, reminder, notification
        sa.Column('message_content', sa.VARCHAR(length=1600), nullable=False),  # SMS length limit
        sa.Column('target_audience', sa.VARCHAR(length=50), nullable=False),  # all_users, academies, artists, customers
        sa.Column('segment_criteria', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('campaign_status', sa.VARCHAR(length=30), nullable=False, server_default='draft'),
        sa.Column('scheduled_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('sent_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('total_recipients', sa.Integer(), server_default='0', nullable=True),
        sa.Column('total_sent', sa.Integer(), server_default='0', nullable=True),
        sa.Column('total_delivered', sa.Integer(), server_default='0', nullable=True),
        sa.Column('total_failed', sa.Integer(), server_default='0', nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['created_by'], ['admin_users.id'], name='fk_sms_campaigns_created_by')
    )
    op.create_index('idx_sms_campaigns_status', 'sms_campaigns', ['campaign_status'], unique=False)
    op.create_index('idx_sms_campaigns_type', 'sms_campaigns', ['campaign_type'], unique=False)
    
    # 8. Feature Flags for system configuration
    op.create_table('feature_flags',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('flag_name', sa.VARCHAR(length=100), nullable=False),
        sa.Column('flag_key', sa.VARCHAR(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_enabled', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('flag_type', sa.VARCHAR(length=30), nullable=False, server_default='boolean'),
        sa.Column('flag_value', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('target_environment', sa.VARCHAR(length=30), nullable=False, server_default='all'),
        sa.Column('rollout_percentage', sa.Integer(), server_default='100', nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('flag_key', name='uq_feature_flags_key'),
        sa.ForeignKeyConstraint(['created_by'], ['admin_users.id'], name='fk_feature_flags_created_by')
    )
    op.create_index('idx_feature_flags_enabled', 'feature_flags', ['is_enabled'], unique=False)
    op.create_index('idx_feature_flags_environment', 'feature_flags', ['target_environment'], unique=False)
    
    # 9. User Segments for targeted campaigns
    op.create_table('user_segments',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('segment_name', sa.VARCHAR(length=255), nullable=False),
        sa.Column('segment_description', sa.Text(), nullable=True),
        sa.Column('segment_type', sa.VARCHAR(length=50), nullable=False),  # demographic, behavioral, geographic
        sa.Column('user_type', sa.VARCHAR(length=50), nullable=False),  # admin, provider, customer
        sa.Column('criteria', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('estimated_size', sa.Integer(), server_default='0', nullable=True),
        sa.Column('last_calculated_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['created_by'], ['admin_users.id'], name='fk_user_segments_created_by')
    )
    op.create_index('idx_user_segments_type', 'user_segments', ['segment_type'], unique=False)
    op.create_index('idx_user_segments_user_type', 'user_segments', ['user_type'], unique=False)
    
    # 10. System Notifications for Admin Panel
    op.create_table('system_notifications',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('notification_type', sa.VARCHAR(length=50), nullable=False),
        sa.Column('title', sa.VARCHAR(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('priority', sa.VARCHAR(length=20), nullable=False, server_default='normal'),
        sa.Column('target_user_type', sa.VARCHAR(length=50), nullable=False),  # admin, provider, customer, all
        sa.Column('target_user_id', postgresql.UUID(as_uuid=True), nullable=True),  # null means all users of type
        sa.Column('action_url', sa.VARCHAR(length=500), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('expires_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_system_notifications_type', 'system_notifications', ['notification_type'], unique=False)
    op.create_index('idx_system_notifications_target', 'system_notifications', ['target_user_type', 'target_user_id'], unique=False)
    op.create_index('idx_system_notifications_read', 'system_notifications', ['is_read'], unique=False)
    
    # 11. Platform Analytics for performance tracking
    op.create_table('platform_analytics',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('metric_name', sa.VARCHAR(length=100), nullable=False),
        sa.Column('metric_category', sa.VARCHAR(length=50), nullable=False),  # user, booking, revenue, engagement
        sa.Column('metric_value', sa.NUMERIC(precision=15, scale=2), nullable=False),
        sa.Column('metric_date', sa.Date(), nullable=False),
        sa.Column('metric_hour', sa.Integer(), nullable=True),  # for hourly data
        sa.Column('dimensions', postgresql.JSONB(astext_type=sa.Text()), nullable=True),  # additional grouping data
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('metric_name', 'metric_date', 'metric_hour', name='uq_platform_analytics_metric_date_hour')
    )
    op.create_index('idx_platform_analytics_metric', 'platform_analytics', ['metric_name'], unique=False)
    op.create_index('idx_platform_analytics_category', 'platform_analytics', ['metric_category'], unique=False)
    op.create_index('idx_platform_analytics_date', 'platform_analytics', ['metric_date'], unique=False)
    
    # 12. Academy Performance Metrics
    op.create_table('academy_performance',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('academy_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('metric_date', sa.Date(), nullable=False),
        sa.Column('total_students_enrolled', sa.Integer(), server_default='0', nullable=True),
        sa.Column('new_enrollments', sa.Integer(), server_default='0', nullable=True),
        sa.Column('graduated_students', sa.Integer(), server_default='0', nullable=True),
        sa.Column('dropout_students', sa.Integer(), server_default='0', nullable=True),
        sa.Column('revenue_generated', sa.NUMERIC(precision=12, scale=2), server_default='0.00', nullable=True),
        sa.Column('maya_commission_earned', sa.NUMERIC(precision=12, scale=2), server_default='0.00', nullable=True),
        sa.Column('ppc_spend', sa.NUMERIC(precision=10, scale=2), server_default='0.00', nullable=True),
        sa.Column('leads_generated', sa.Integer(), server_default='0', nullable=True),
        sa.Column('leads_converted', sa.Integer(), server_default='0', nullable=True),
        sa.Column('conversion_rate', sa.NUMERIC(precision=5, scale=2), server_default='0.00', nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('academy_id', 'metric_date', name='uq_academy_performance_date'),
        sa.ForeignKeyConstraint(['academy_id'], ['academies.id'], name='fk_academy_performance_academy_id')
    )
    op.create_index('idx_academy_performance_academy', 'academy_performance', ['academy_id'], unique=False)
    op.create_index('idx_academy_performance_date', 'academy_performance', ['metric_date'], unique=False)

    # Modify existing tables to add Academy verification fields to provider_users
    op.add_column('provider_users', sa.Column('academy_verification_status', sa.VARCHAR(length=30), nullable=True, server_default='pending'))
    op.add_column('provider_users', sa.Column('academy_verification_documents', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column('provider_users', sa.Column('academy_verification_notes', sa.Text(), nullable=True))
    op.add_column('provider_users', sa.Column('academy_verified_at', sa.TIMESTAMP(timezone=True), nullable=True))
    op.add_column('provider_users', sa.Column('academy_verified_by', postgresql.UUID(as_uuid=True), nullable=True))
    
    # Add foreign key for academy verification
    op.create_foreign_key('fk_provider_users_academy_verified_by', 'provider_users', 'admin_users', ['academy_verified_by'], ['id'])
    op.create_index('idx_provider_users_academy_verification', 'provider_users', ['academy_verification_status'], unique=False)
    
    # Modify academies table to add revenue and PPC tracking fields
    op.add_column('academies', sa.Column('monthly_revenue_target', sa.NUMERIC(precision=12, scale=2), nullable=True))
    op.add_column('academies', sa.Column('current_month_revenue', sa.NUMERIC(precision=12, scale=2), server_default='0.00', nullable=True))
    op.add_column('academies', sa.Column('total_lifetime_revenue', sa.NUMERIC(precision=15, scale=2), server_default='0.00', nullable=True))
    op.add_column('academies', sa.Column('ppc_budget_monthly', sa.NUMERIC(precision=10, scale=2), nullable=True))
    op.add_column('academies', sa.Column('ppc_spend_current_month', sa.NUMERIC(precision=10, scale=2), server_default='0.00', nullable=True))
    op.add_column('academies', sa.Column('marketing_roi', sa.NUMERIC(precision=5, scale=2), server_default='0.00', nullable=True))
    op.add_column('academies', sa.Column('student_satisfaction_score', sa.NUMERIC(precision=3, scale=2), server_default='0.00', nullable=True))
    op.add_column('academies', sa.Column('last_performance_update', sa.TIMESTAMP(timezone=True), nullable=True))
    
    # Modify bookings table to add academy commission tracking
    op.add_column('bookings', sa.Column('academy_commission_rate', sa.NUMERIC(precision=5, scale=2), nullable=True))
    op.add_column('bookings', sa.Column('academy_commission_amount', sa.NUMERIC(precision=10, scale=2), nullable=True))
    op.add_column('bookings', sa.Column('is_academy_student_booking', sa.Boolean(), server_default='false', nullable=True))
    op.add_column('bookings', sa.Column('academy_student_id', postgresql.UUID(as_uuid=True), nullable=True))
    
    # Add foreign key for academy student bookings
    op.create_foreign_key('fk_bookings_academy_student', 'bookings', 'academy_students', ['academy_student_id'], ['id'])
    op.create_index('idx_bookings_academy_student', 'bookings', ['is_academy_student_booking'], unique=False)
    
    # Modify reviews table to add missing admin fields (some already exist from 004)
    op.add_column('reviews', sa.Column('admin_response', sa.Text(), nullable=True))
    op.add_column('reviews', sa.Column('admin_response_at', sa.TIMESTAMP(timezone=True), nullable=True))
    
    # Add foreign key for review moderation (moderated_by column already exists)
    op.create_foreign_key('fk_reviews_moderated_by', 'reviews', 'admin_users', ['moderated_by'], ['id'])


def downgrade() -> None:
    """Downgrade schema - Remove Admin Panel tables and modifications."""
    
    # Remove foreign keys and columns from existing tables (reverse order)
    op.drop_constraint('fk_reviews_moderated_by', 'reviews', type_='foreignkey')
    op.drop_column('reviews', 'admin_response')
    op.drop_column('reviews', 'admin_response_at')
    
    op.drop_constraint('fk_bookings_academy_student', 'bookings', type_='foreignkey')
    op.drop_index('idx_bookings_academy_student', 'bookings')
    op.drop_column('bookings', 'academy_commission_rate')
    op.drop_column('bookings', 'academy_commission_amount')
    op.drop_column('bookings', 'is_academy_student_booking')
    op.drop_column('bookings', 'academy_student_id')
    
    op.drop_column('academies', 'monthly_revenue_target')
    op.drop_column('academies', 'current_month_revenue')
    op.drop_column('academies', 'total_lifetime_revenue')
    op.drop_column('academies', 'ppc_budget_monthly')
    op.drop_column('academies', 'ppc_spend_current_month')
    op.drop_column('academies', 'marketing_roi')
    op.drop_column('academies', 'student_satisfaction_score')
    op.drop_column('academies', 'last_performance_update')
    
    op.drop_constraint('fk_provider_users_academy_verified_by', 'provider_users', type_='foreignkey')
    op.drop_index('idx_provider_users_academy_verification', 'provider_users')
    op.drop_column('provider_users', 'academy_verification_status')
    op.drop_column('provider_users', 'academy_verification_documents')
    op.drop_column('provider_users', 'academy_verification_notes')
    op.drop_column('provider_users', 'academy_verified_at')
    op.drop_column('provider_users', 'academy_verified_by')
    
    # Drop new tables (reverse order of creation)
    op.drop_table('academy_performance')
    op.drop_table('platform_analytics')
    op.drop_table('system_notifications')
    op.drop_table('user_segments')
    op.drop_table('feature_flags')
    op.drop_table('sms_campaigns')
    op.drop_table('email_campaigns')
    op.drop_table('email_templates')
    op.drop_table('canned_responses')
    op.drop_table('admission_inquiries')
    op.drop_table('ppc_campaigns')
    op.drop_table('academy_students')