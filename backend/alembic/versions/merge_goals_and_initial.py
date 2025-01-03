"""merge goals and initial

Revision ID: merge_goals_and_initial
Revises: 001, create_goals_table
Create Date: 2024-01-03 17:21:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'merge_goals_and_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = ('001', 'create_goals_table')

def upgrade() -> None:
    pass

def downgrade() -> None:
    pass 