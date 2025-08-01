"""Add original currency fields to transactions

Revision ID: 35509d80f7cb
Revises: 4effc64aa2c3
Create Date: 2025-08-01 03:23:16.727162

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '35509d80f7cb'
down_revision = '4effc64aa2c3'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('transactions', sa.Column('original_amount', sa.Float(), nullable=True))
    op.add_column('transactions', sa.Column('original_currency', sa.String(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('transactions', 'original_currency')
    op.drop_column('transactions', 'original_amount')
    # ### end Alembic commands ###
