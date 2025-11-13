"""009_rename_metadata_columns

Revision ID: 009_rename_metadata_columns
Revises: 008_admin_panel_tables
Create Date: 2025-11-13 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'cdc92a1764c9'
down_revision = '008_admin_panel_tables'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Rename metadata columns to avoid SQLAlchemy reserved name conflicts."""
    
    # Rename metadata column in bookings table to booking_metadata
    op.alter_column('bookings', 'metadata', new_column_name='booking_metadata')
    
    # Rename metadata column in transactions table to transaction_metadata  
    op.alter_column('transactions', 'metadata', new_column_name='transaction_metadata')


def downgrade() -> None:
    """Revert metadata column renames."""
    
    # Revert booking_metadata back to metadata
    op.alter_column('bookings', 'booking_metadata', new_column_name='metadata')
    
    # Revert transaction_metadata back to metadata
    op.alter_column('transactions', 'transaction_metadata', new_column_name='metadata')
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cdc92a1764c9'
down_revision: Union[str, None] = '008_admin_panel_tables'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
