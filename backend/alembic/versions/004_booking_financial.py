"""Booking and financial system - Bookings, Reviews, Transactions, Wallets, Bank Accounts

Revision ID: 004_booking_financial
Revises: 003_business_core
Create Date: 2025-11-12 12:45:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '004_booking_financial'
down_revision = '003_business_core'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create booking and financial tables with proper ENUMs and constraints."""
    
    # Create ENUMs
    booking_status_enum = postgresql.ENUM(
        'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'refunded',
        name='booking_status'
    )
    booking_status_enum.create(op.get_bind())
    
    payment_status_enum = postgresql.ENUM(
        'pending', 'processing', 'paid', 'failed', 'refunded', 'partially_refunded',
        name='payment_status'
    )
    payment_status_enum.create(op.get_bind())
    
    transaction_type_enum = postgresql.ENUM(
        'payment', 'payout', 'refund', 'wallet_credit', 'wallet_debit', 'subscription_payment', 'commission',
        name='transaction_type'
    )
    transaction_type_enum.create(op.get_bind())
    
    transaction_status_enum = postgresql.ENUM(
        'pending', 'processing', 'completed', 'failed', 'cancelled',
        name='transaction_status'
    )
    transaction_status_enum.create(op.get_bind())
    
    wallet_transaction_type_enum = postgresql.ENUM(
        'credit', 'debit', 'refund', 'bonus', 'penalty', 'withdrawal',
        name='wallet_transaction_type'
    )
    wallet_transaction_type_enum.create(op.get_bind())
    
    # Create bank_accounts table first (referenced by transactions)
    op.create_table('bank_accounts',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('account_holder_name', sa.VARCHAR(length=255), nullable=False),
        sa.Column('account_number_encrypted', sa.Text(), nullable=False),
        sa.Column('account_number_hash', sa.VARCHAR(length=64), nullable=False),
        sa.Column('account_number_last4', sa.VARCHAR(length=4), nullable=False),
        sa.Column('ifsc_code', sa.VARCHAR(length=11), nullable=False),
        sa.Column('bank_name', sa.VARCHAR(length=255), nullable=False),
        sa.Column('branch_name', sa.VARCHAR(length=255), nullable=True),
        sa.Column('account_type', sa.VARCHAR(length=20), server_default='savings', nullable=True),
        sa.Column('razorpay_fund_account_id', sa.VARCHAR(length=255), nullable=True),
        sa.Column('razorpay_contact_id', sa.VARCHAR(length=255), nullable=True),
        sa.Column('is_verified', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('verified_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('verification_reference', sa.VARCHAR(length=255), nullable=True),
        sa.Column('is_primary', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('razorpay_fund_account_id'),
        sa.UniqueConstraint('user_id', 'account_number_hash')
    )
    op.create_index('idx_bank_user', 'bank_accounts', ['user_id', 'is_primary'], unique=False)
    op.create_index('idx_bank_verified', 'bank_accounts', ['is_verified', 'is_active'], unique=False)
    
    # Add constraint for single primary account per user
    op.execute("""
        ALTER TABLE bank_accounts 
        ADD CONSTRAINT uq_bank_user_primary 
        UNIQUE (user_id, is_primary) 
        WHERE is_primary = TRUE
    """)
    
    # Create transactions table
    op.create_table('transactions',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('transaction_number', sa.VARCHAR(length=50), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('booking_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('transaction_type', transaction_type_enum, nullable=False),
        sa.Column('amount', sa.NUMERIC(precision=10, scale=2), nullable=False),
        sa.Column('currency', sa.VARCHAR(length=3), server_default='INR', nullable=False),
        sa.Column('gateway', sa.VARCHAR(length=50), server_default='razorpay', nullable=False),
        sa.Column('gateway_order_id', sa.VARCHAR(length=255), nullable=True),
        sa.Column('gateway_payment_id', sa.VARCHAR(length=255), nullable=True),
        sa.Column('gateway_signature', sa.VARCHAR(length=500), nullable=True),
        sa.Column('gateway_payout_id', sa.VARCHAR(length=255), nullable=True),
        sa.Column('payment_method', sa.VARCHAR(length=50), nullable=True),
        sa.Column('payment_details', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('status', transaction_status_enum, server_default='pending', nullable=False),
        sa.Column('refund_amount', sa.NUMERIC(precision=10, scale=2), nullable=True),
        sa.Column('refund_reason', sa.Text(), nullable=True),
        sa.Column('parent_transaction_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('payout_mode', sa.VARCHAR(length=50), nullable=True),
        sa.Column('payout_account', sa.VARCHAR(length=255), nullable=True),
        sa.Column('bank_account_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('failure_reason', sa.Text(), nullable=True),
        sa.Column('failure_code', sa.VARCHAR(length=100), nullable=True),
        sa.Column('retry_count', sa.Integer(), server_default='0', nullable=True),
        sa.Column('initiated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('completed_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('failed_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.CheckConstraint('amount > 0', name='positive_amount'),
        sa.ForeignKeyConstraint(['bank_account_id'], ['bank_accounts.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('transaction_number')
    )
    op.create_index('idx_transactions_user', 'transactions', ['user_id', 'created_at'], unique=False)
    op.create_index('idx_transactions_status', 'transactions', ['status', 'created_at'], unique=False)
    op.create_index('idx_transactions_gateway_order', 'transactions', ['gateway_order_id'], unique=False)
    op.create_index('idx_transactions_gateway_payment', 'transactions', ['gateway_payment_id'], unique=False)
    
    # Create wallets table
    op.create_table('wallets',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_type', sa.VARCHAR(length=20), nullable=False),
        sa.Column('balance', sa.NUMERIC(precision=10, scale=2), server_default='0.00', nullable=False),
        sa.Column('min_balance', sa.NUMERIC(precision=10, scale=2), server_default='0.00', nullable=False),
        sa.Column('max_balance', sa.NUMERIC(precision=10, scale=2), server_default='100000.00', nullable=False),
        sa.Column('auto_withdrawal_enabled', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('auto_withdrawal_threshold', sa.NUMERIC(precision=10, scale=2), nullable=True),
        sa.Column('total_credited', sa.NUMERIC(precision=10, scale=2), server_default='0.00', nullable=False),
        sa.Column('total_debited', sa.NUMERIC(precision=10, scale=2), server_default='0.00', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=True),
        sa.Column('is_locked', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('locked_reason', sa.Text(), nullable=True),
        sa.Column('locked_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.CheckConstraint('balance >= 0', name='non_negative_balance'),
        sa.CheckConstraint('balance >= min_balance', name='balance_above_min'),
        sa.CheckConstraint('balance <= max_balance', name='balance_below_max'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index('idx_wallets_user', 'wallets', ['user_id'], unique=False)
    op.create_index('idx_wallets_balance', 'wallets', ['balance'], unique=False)
    
    # Create wallet_transactions table
    op.create_table('wallet_transactions',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('wallet_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('transaction_type', wallet_transaction_type_enum, nullable=False),
        sa.Column('amount', sa.NUMERIC(precision=10, scale=2), nullable=False),
        sa.Column('balance_before', sa.NUMERIC(precision=10, scale=2), nullable=False),
        sa.Column('balance_after', sa.NUMERIC(precision=10, scale=2), nullable=False),
        sa.Column('reference_type', sa.VARCHAR(length=50), nullable=True),
        sa.Column('reference_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('transaction_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.CheckConstraint('amount > 0', name='positive_amount'),
        sa.CheckConstraint('balance_after >= 0', name='non_negative_balance_after'),
        sa.ForeignKeyConstraint(['transaction_id'], ['transactions.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['wallet_id'], ['wallets.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_wallet_txn_wallet', 'wallet_transactions', ['wallet_id', 'created_at'], unique=False)
    op.create_index('idx_wallet_txn_user', 'wallet_transactions', ['user_id', 'created_at'], unique=False)
    op.create_index('idx_wallet_txn_reference', 'wallet_transactions', ['reference_type', 'reference_id'], unique=False)
    
    # Create bookings table
    op.create_table('bookings',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('booking_number', sa.VARCHAR(length=50), nullable=False),
        sa.Column('customer_user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('artist_user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('service_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('service_name', sa.VARCHAR(length=255), nullable=False),
        sa.Column('service_price', sa.NUMERIC(precision=10, scale=2), nullable=False),
        sa.Column('service_duration_minutes', sa.Integer(), nullable=False),
        sa.Column('occasion_type', sa.VARCHAR(length=50), nullable=False),
        sa.Column('booking_date', sa.Date(), nullable=False),
        sa.Column('booking_start_time', sa.Time(), nullable=False),
        sa.Column('booking_end_time', sa.Time(), nullable=False),
        sa.Column('location_type', sa.VARCHAR(length=20), nullable=False),
        sa.Column('address_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('special_requests', sa.Text(), nullable=True),
        sa.Column('status', booking_status_enum, server_default='pending', nullable=False),
        sa.Column('payment_status', payment_status_enum, server_default='pending', nullable=False),
        sa.Column('confirmed_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('started_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('completed_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('cancelled_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('cancelled_by', sa.VARCHAR(length=20), nullable=True),
        sa.Column('cancellation_reason', sa.Text(), nullable=True),
        sa.Column('subtotal', sa.NUMERIC(precision=10, scale=2), nullable=False),
        sa.Column('discount_amount', sa.NUMERIC(precision=10, scale=2), server_default='0', nullable=False),
        sa.Column('promo_code', sa.VARCHAR(length=50), nullable=True),
        sa.Column('taxes', sa.NUMERIC(precision=10, scale=2), server_default='0', nullable=False),
        sa.Column('total_amount', sa.NUMERIC(precision=10, scale=2), nullable=False),
        sa.Column('platform_commission_rate', sa.NUMERIC(precision=5, scale=2), server_default='15.00', nullable=False),
        sa.Column('platform_commission', sa.NUMERIC(precision=10, scale=2), nullable=False),
        sa.Column('artist_payout', sa.NUMERIC(precision=10, scale=2), nullable=False),
        sa.Column('academy_commission', sa.NUMERIC(precision=10, scale=2), nullable=True),
        sa.Column('transaction_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('payout_transaction_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('chat_pg_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('reschedule_count', sa.Integer(), server_default='0', nullable=True),
        sa.Column('original_booking_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['address_id'], ['addresses.id'], ),
        sa.ForeignKeyConstraint(['artist_user_id'], ['artists.user_id'], ),
        sa.ForeignKeyConstraint(['customer_user_id'], ['customers.user_id'], ),
        sa.ForeignKeyConstraint(['service_id'], ['services.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('booking_number')
    )
    op.create_index('idx_bookings_customer', 'bookings', ['customer_user_id', 'booking_date'], unique=False)
    op.create_index('idx_bookings_artist', 'bookings', ['artist_user_id', 'booking_date'], unique=False)
    op.create_index('idx_bookings_status', 'bookings', ['status', 'booking_date'], unique=False)
    op.create_index('idx_bookings_payment_status', 'bookings', ['payment_status'], unique=False)
    
    # Add foreign key to transactions for booking_id
    op.create_foreign_key('fk_transactions_booking_id', 'transactions', 'bookings', ['booking_id'], ['id'])
    
    # Create reviews table
    op.create_table('reviews',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('booking_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('customer_user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('artist_user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('rating', sa.SmallInteger(), nullable=False),
        sa.Column('review_title', sa.VARCHAR(length=255), nullable=True),
        sa.Column('review_text', sa.Text(), nullable=True),
        sa.Column('images', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('rating_skill', sa.SmallInteger(), nullable=True),
        sa.Column('rating_professionalism', sa.SmallInteger(), nullable=True),
        sa.Column('rating_punctuality', sa.SmallInteger(), nullable=True),
        sa.Column('rating_value', sa.SmallInteger(), nullable=True),
        sa.Column('is_flagged', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('moderation_status', sa.VARCHAR(length=20), server_default='approved', nullable=True),
        sa.Column('moderated_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('moderated_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('moderation_notes', sa.Text(), nullable=True),
        sa.Column('helpful_count', sa.Integer(), server_default='0', nullable=True),
        sa.Column('is_visible', sa.Boolean(), server_default='true', nullable=True),
        sa.Column('is_featured', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.CheckConstraint('rating >= 1 AND rating <= 5', name='rating_range'),
        sa.CheckConstraint('rating_skill >= 1 AND rating_skill <= 5', name='rating_skill_range'),
        sa.CheckConstraint('rating_professionalism >= 1 AND rating_professionalism <= 5', name='rating_professionalism_range'),
        sa.CheckConstraint('rating_punctuality >= 1 AND rating_punctuality <= 5', name='rating_punctuality_range'),
        sa.CheckConstraint('rating_value >= 1 AND rating_value <= 5', name='rating_value_range'),
        sa.ForeignKeyConstraint(['artist_user_id'], ['artists.user_id'], ),
        sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['customer_user_id'], ['customers.user_id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('booking_id')
    )
    op.create_index('idx_reviews_artist', 'reviews', ['artist_user_id', 'created_at'], unique=False)
    op.create_index('idx_reviews_customer', 'reviews', ['customer_user_id', 'created_at'], unique=False)
    op.create_index('idx_reviews_rating', 'reviews', ['artist_user_id', 'rating'], unique=False)
    op.create_index('idx_reviews_flagged', 'reviews', ['is_flagged', 'moderation_status'], unique=False)


def downgrade() -> None:
    """Drop booking and financial tables."""
    op.drop_table('reviews')
    op.drop_table('bookings')
    op.drop_table('wallet_transactions')
    op.drop_table('wallets')
    op.drop_table('transactions')
    op.drop_table('bank_accounts')
    
    # Drop ENUMs
    op.execute('DROP TYPE IF EXISTS wallet_transaction_type')
    op.execute('DROP TYPE IF EXISTS transaction_status')
    op.execute('DROP TYPE IF EXISTS transaction_type')
    op.execute('DROP TYPE IF EXISTS payment_status')
    op.execute('DROP TYPE IF EXISTS booking_status')