"""Add exchange_rate_to_usd to transactions

Revision ID: a1b2c3d4e5f6
Revises: 35509d80f7cb
Create Date: 2025-01-31 04:15:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = '35509d80f7cb'
branch_labels = None
depends_on = None


def upgrade():
    # Add exchange_rate_to_usd column to transactions table
    op.add_column('transactions', sa.Column('exchange_rate_to_usd', sa.Float(), nullable=True))
    
    # Update existing transactions to have exchange_rate_to_usd = 1.0 for USD transactions
    # This is a simplified approach - in production, you'd want to fetch historical rates
    op.execute("""
        UPDATE transactions 
        SET exchange_rate_to_usd = 1.0 
        WHERE original_currency = 'USD' OR original_currency IS NULL
    """)


def downgrade():
    # Remove exchange_rate_to_usd column
    op.drop_column('transactions', 'exchange_rate_to_usd')