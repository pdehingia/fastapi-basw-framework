"""007_support_tickets_system

Revision ID: 007_support_tickets_system
Revises: 006_providers_table
Create Date: 2025-11-13 06:27:02.414123

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '007_support_tickets_system'
down_revision: Union[str, None] = '006_providers_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - Add support tickets system."""
    
    # Support Tickets System
    op.create_table(
        'support_tickets',
        sa.Column('id', sa.Integer, primary_key=True, index=True),
        sa.Column('ticket_number', sa.String(20), unique=True, nullable=False, index=True),
        sa.Column('user_id', sa.Integer, nullable=False, index=True),
        sa.Column('user_type', sa.String(20), nullable=False),  # 'customer', 'provider', 'admin'
        sa.Column('subject', sa.String(255), nullable=False),
        sa.Column('description', sa.Text, nullable=False),
        sa.Column('issue_type', sa.String(50), nullable=False, index=True),
        sa.Column('priority', sa.String(20), server_default='medium', nullable=False),  # 'low', 'medium', 'high', 'critical'
        sa.Column('status', sa.String(30), server_default='new', nullable=False),  # 'new', 'assigned', 'in_progress', 'waiting_customer', 'resolved', 'closed'
        sa.Column('assigned_to', sa.Integer, nullable=True, index=True),
        sa.Column('booking_id', sa.Integer, nullable=True, index=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('first_response_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('resolution_summary', sa.Text, nullable=True),
        sa.Column('customer_satisfaction_rating', sa.Integer, nullable=True),
        sa.Column('tags', sa.JSON, nullable=True),
        sa.Column('metadata', sa.JSON, nullable=True)
    )
    
    # Support Ticket Messages (conversation thread)
    op.create_table(
        'support_ticket_messages',
        sa.Column('id', sa.Integer, primary_key=True, index=True),
        sa.Column('ticket_id', sa.Integer, sa.ForeignKey('support_tickets.id', ondelete='CASCADE'), nullable=False),
        sa.Column('sender_id', sa.Integer, nullable=False, index=True),
        sa.Column('sender_type', sa.String(20), nullable=False),  # 'customer', 'provider', 'admin'
        sa.Column('message', sa.Text, nullable=False),
        sa.Column('message_type', sa.String(20), server_default='message', nullable=False),  # 'message', 'note', 'system'
        sa.Column('attachments', sa.JSON, nullable=True),
        sa.Column('is_internal', sa.Boolean, default=False, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('edited_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('metadata', sa.JSON, nullable=True)
    )
    
    # Create indexes for better performance
    op.create_index('idx_support_tickets_status_priority', 'support_tickets', ['status', 'priority'])
    op.create_index('idx_support_tickets_user', 'support_tickets', ['user_id', 'user_type'])
    op.create_index('idx_support_tickets_assigned', 'support_tickets', ['assigned_to', 'status'])
    op.create_index('idx_support_tickets_created_at', 'support_tickets', ['created_at'])
    
    op.create_index('idx_ticket_messages_ticket_created', 'support_ticket_messages', ['ticket_id', 'created_at'])
    op.create_index('idx_ticket_messages_sender', 'support_ticket_messages', ['sender_id', 'sender_type'])


def downgrade() -> None:
    """Downgrade schema."""
    
    # Drop indexes first
    op.drop_index('idx_ticket_messages_sender', 'support_ticket_messages')
    op.drop_index('idx_ticket_messages_ticket_created', 'support_ticket_messages')
    op.drop_index('idx_support_tickets_created_at', 'support_tickets')
    op.drop_index('idx_support_tickets_assigned', 'support_tickets')
    op.drop_index('idx_support_tickets_user', 'support_tickets')
    op.drop_index('idx_support_tickets_status_priority', 'support_tickets')
    
    # Drop tables
    op.drop_table('support_ticket_messages')
    op.drop_table('support_tickets')
