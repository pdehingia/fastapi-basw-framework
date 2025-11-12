"""Advanced features - Subscriptions, Referrals, Promos, Ads, Activity Logs, Earnings Summary

Revision ID: 005_advanced_features
Revises: 004_booking_financial
Create Date: 2025-11-12 13:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '005_advanced_features'
down_revision = '004_booking_financial'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create advanced feature tables: subscriptions, referrals, promos, ads, activity logs."""
    
    # Create subscriptions table
    op.create_table('subscriptions',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('artist_user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('plan_type', sa.Enum('premium', 'elite', name='subscription_plan'), nullable=False),
        sa.Column('plan_name', sa.VARCHAR(length=100), nullable=False),
        sa.Column('plan_price', sa.NUMERIC(precision=10, scale=2), nullable=False),
        sa.Column('billing_cycle', sa.VARCHAR(length=20), nullable=False),
        sa.Column('commission_rate', sa.NUMERIC(precision=5, scale=2), nullable=False),
        sa.Column('features', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=False),
        sa.Column('current_period_start', sa.Date(), nullable=False),
        sa.Column('current_period_end', sa.Date(), nullable=False),
        sa.Column('razorpay_subscription_id', sa.VARCHAR(length=255), nullable=True),
        sa.Column('status', sa.Enum('active', 'cancelled', 'expired', 'paused', 'payment_failed', name='subscription_status'), server_default='active', nullable=False),
        sa.Column('auto_renew', sa.Boolean(), server_default='true', nullable=True),
        sa.Column('cancel_at_period_end', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('cancelled_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('payment_failed_count', sa.Integer(), server_default='0', nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['artist_user_id'], ['artists.user_id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('artist_user_id'),
        sa.UniqueConstraint('razorpay_subscription_id')
    )
    op.create_index('idx_subscriptions_artist', 'subscriptions', ['artist_user_id'], unique=False)
    op.create_index('idx_subscriptions_status', 'subscriptions', ['status', 'end_date'], unique=False)
    op.create_index('idx_subscriptions_billing', 'subscriptions', ['current_period_end', 'status'], unique=False)
    
    # Create subscription_payments table
    op.create_table('subscription_payments',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('subscription_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('artist_user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('amount', sa.NUMERIC(precision=10, scale=2), nullable=False),
        sa.Column('currency', sa.VARCHAR(length=3), server_default='INR', nullable=False),
        sa.Column('razorpay_payment_id', sa.VARCHAR(length=255), nullable=True),
        sa.Column('razorpay_order_id', sa.VARCHAR(length=255), nullable=True),
        sa.Column('billing_period_start', sa.Date(), nullable=False),
        sa.Column('billing_period_end', sa.Date(), nullable=False),
        sa.Column('status', postgresql.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', name='transaction_status'), server_default='pending', nullable=False),
        sa.Column('failure_reason', sa.Text(), nullable=True),
        sa.Column('retry_attempt', sa.Integer(), server_default='0', nullable=True),
        sa.Column('transaction_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('payment_date', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['artist_user_id'], ['artists.user_id'], ),
        sa.ForeignKeyConstraint(['subscription_id'], ['subscriptions.id'], ),
        sa.ForeignKeyConstraint(['transaction_id'], ['transactions.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_sub_payments_subscription', 'subscription_payments', ['subscription_id', 'payment_date'], unique=False)
    op.create_index('idx_sub_payments_artist', 'subscription_payments', ['artist_user_id', 'payment_date'], unique=False)
    op.create_index('idx_sub_payments_status', 'subscription_payments', ['status', 'payment_date'], unique=False)
    
    # Add foreign key from artists to subscriptions
    op.create_foreign_key('fk_artists_subscription_id', 'artists', 'subscriptions', ['subscription_id'], ['id'])
    
    # Create referrals table
    op.create_table('referrals',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('referrer_user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('referral_code', sa.VARCHAR(length=50), nullable=False),
        sa.Column('referee_user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('referee_phone', sa.VARCHAR(length=20), nullable=True),
        sa.Column('status', sa.Enum('pending', 'qualified', 'rewarded', 'expired', name='referral_status'), server_default='pending', nullable=True),
        sa.Column('referee_first_booking_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('qualified_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('referrer_reward_amount', sa.NUMERIC(precision=10, scale=2), server_default='100.00', nullable=True),
        sa.Column('referee_reward_amount', sa.NUMERIC(precision=10, scale=2), server_default='50.00', nullable=True),
        sa.Column('referrer_wallet_txn_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('referee_wallet_txn_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('expires_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['referee_first_booking_id'], ['bookings.id'], ),
        sa.ForeignKeyConstraint(['referee_wallet_txn_id'], ['wallet_transactions.id'], ),
        sa.ForeignKeyConstraint(['referrer_user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['referrer_wallet_txn_id'], ['wallet_transactions.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('referee_user_id'),
        sa.UniqueConstraint('referral_code')
    )
    op.create_index('idx_referrals_referrer', 'referrals', ['referrer_user_id', 'created_at'], unique=False)
    op.create_index('idx_referrals_referee', 'referrals', ['referee_user_id'], unique=False)
    op.create_index('idx_referrals_code', 'referrals', ['referral_code'], unique=False)
    op.create_index('idx_referrals_status', 'referrals', ['status', 'created_at'], unique=False)
    
    # Create promo_codes table
    op.create_table('promo_codes',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('code', sa.VARCHAR(length=40), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('promo_type', sa.VARCHAR(length=20), nullable=False),
        sa.Column('discount_type', sa.VARCHAR(length=20), nullable=False),
        sa.Column('discount_value', sa.NUMERIC(precision=10, scale=2), nullable=False),
        sa.Column('max_discount', sa.NUMERIC(precision=10, scale=2), nullable=True),
        sa.Column('valid_from', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('valid_until', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('restrictions', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('target', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=True),
        sa.Column('is_public', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('campaign_name', sa.VARCHAR(length=120), nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['admins.user_id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('code')
    )
    op.create_index('idx_promo_codes_code', 'promo_codes', ['code'], unique=False)
    op.create_index('idx_promo_codes_active', 'promo_codes', ['is_active', 'valid_from', 'valid_until'], unique=False)
    op.create_index('idx_promo_codes_campaign', 'promo_codes', ['campaign_name'], unique=False)
    
    # Create ads table
    op.create_table('ads',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('advertiser_type', sa.VARCHAR(length=20), nullable=False),
        sa.Column('advertiser_name', sa.VARCHAR(length=200), nullable=True),
        sa.Column('ad_type', sa.VARCHAR(length=30), nullable=False),
        sa.Column('campaign_name', sa.VARCHAR(length=200), nullable=True),
        sa.Column('creative', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('targeting', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('placement', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('budget', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('pricing', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('schedule', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('metrics', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('status', sa.VARCHAR(length=30), server_default='draft', nullable=True),
        sa.Column('approval', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_ads_advertiser', 'ads', ['advertiser_type'], unique=False)
    op.create_index('idx_ads_status', 'ads', ['status'], unique=False)
    op.create_index('idx_ads_type', 'ads', ['ad_type'], unique=False)
    
    # Create user_activity_logs table (partitioned)
    op.execute("""
        CREATE TABLE user_activity_logs (
            id BIGSERIAL,
            user_id UUID NOT NULL REFERENCES users(id),
            user_type VARCHAR(20) NOT NULL,
            activity_type VARCHAR(100) NOT NULL,
            activity_category VARCHAR(50),
            description TEXT,
            metadata JSONB,
            ip_address INET,
            session_id UUID REFERENCES user_sessions(id),
            created_at TIMESTAMPTZ DEFAULT NOW()
        ) PARTITION BY RANGE (created_at);
    """)
    
    # Create initial partitions for user_activity_logs
    current_year = 2025
    for month in range(1, 13):
        start_date = f"{current_year}-{month:02d}-01"
        if month == 12:
            end_date = f"{current_year + 1}-01-01"
        else:
            end_date = f"{current_year}-{month + 1:02d}-01"
        
        partition_name = f"user_activity_logs_y{current_year}m{month:02d}"
        op.execute(f"""
            CREATE TABLE {partition_name} PARTITION OF user_activity_logs
            FOR VALUES FROM ('{start_date}') TO ('{end_date}');
        """)
    
    # Create indexes on the base table
    op.create_index('idx_activity_user_id', 'user_activity_logs', ['user_id', 'created_at'], unique=False)
    op.create_index('idx_activity_type', 'user_activity_logs', ['activity_type', 'created_at'], unique=False)
    op.create_index('idx_activity_created_at', 'user_activity_logs', ['created_at'], unique=False)
    
    # Create earnings_summary materialized view
    op.execute("""
        CREATE MATERIALIZED VIEW earnings_summary AS
        SELECT 
            artist_user_id,
            DATE(created_at) as earning_date,
            COUNT(*) as total_bookings,
            SUM(artist_payout) as total_earnings,
            SUM(platform_commission) as total_commission,
            AVG(service_price) as avg_service_price
        FROM bookings 
        WHERE status = 'completed'
        GROUP BY artist_user_id, DATE(created_at);
    """)
    
    # Create index on the materialized view
    op.execute("CREATE UNIQUE INDEX idx_earnings_summary_unique ON earnings_summary (artist_user_id, earning_date);")
    
    # Create function to update updated_at column
    op.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE 'plpgsql';
    """)
    
    # Add triggers for updated_at columns on tables that have them
    tables_with_updated_at = [
        'users', 'roles', 'admins', 'customers', 'artists', 'addresses',
        'academies', 'salons', 'salon_artists', 'services', 'courses', 'academy_courses',
        'transactions', 'wallets', 'bookings', 'reviews', 'subscriptions',
        'referrals', 'promo_codes', 'ads'
    ]
    
    for table in tables_with_updated_at:
        op.execute(f"""
            CREATE TRIGGER update_{table}_updated_at
                BEFORE UPDATE ON {table}
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        """)


def downgrade() -> None:
    """Drop advanced feature tables and functions."""
    
    # Drop triggers
    tables_with_updated_at = [
        'users', 'roles', 'admins', 'customers', 'artists', 'addresses',
        'academies', 'salons', 'salon_artists', 'services', 'courses', 'academy_courses',
        'transactions', 'wallets', 'bookings', 'reviews', 'subscriptions',
        'referrals', 'promo_codes', 'ads'
    ]
    
    for table in tables_with_updated_at:
        op.execute(f"DROP TRIGGER IF EXISTS update_{table}_updated_at ON {table};")
    
    # Drop function
    op.execute("DROP FUNCTION IF EXISTS update_updated_at_column();")
    
    # Drop materialized view
    op.execute("DROP MATERIALIZED VIEW IF EXISTS earnings_summary;")
    
    # Drop partitioned table (will drop all partitions)
    op.execute("DROP TABLE IF EXISTS user_activity_logs;")
    
    # Drop tables
    op.drop_table('ads')
    op.drop_table('promo_codes')
    op.drop_table('referrals')
    op.drop_table('subscription_payments')
    op.drop_table('subscriptions')
    
    # Drop ENUMs
    op.execute('DROP TYPE IF EXISTS referral_status')
    op.execute('DROP TYPE IF EXISTS subscription_status')
    op.execute('DROP TYPE IF EXISTS subscription_plan')