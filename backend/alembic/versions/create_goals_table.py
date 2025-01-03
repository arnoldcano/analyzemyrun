"""create goals table

Revision ID: create_goals_table
Revises: 
Create Date: 2024-01-03 17:20:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'create_goals_table'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table(
        'goals',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('target', sa.String(), nullable=False),
        sa.Column('target_date', sa.DateTime(), nullable=False),
        sa.Column('date_created', sa.DateTime(), nullable=False),
        sa.Column('completed', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_goals_id'), 'goals', ['id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_goals_id'), table_name='goals')
    op.drop_table('goals') 