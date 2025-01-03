"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2024-01-02 17:10:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )

    # Create workouts table
    op.create_table(
        'workouts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('date_submitted', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('workout_date', sa.DateTime(), nullable=False),
        sa.Column('activity_type', sa.String(), nullable=False),
        sa.Column('calories_burned', sa.Integer(), nullable=True),
        sa.Column('distance_mi', sa.Float(), nullable=True),
        sa.Column('workout_time_seconds', sa.Integer(), nullable=True),
        sa.Column('avg_pace_min_mi', sa.Float(), nullable=True),
        sa.Column('max_pace_min_mi', sa.Float(), nullable=True),
        sa.Column('avg_speed_mph', sa.Float(), nullable=True),
        sa.Column('max_speed_mph', sa.Float(), nullable=True),
        sa.Column('avg_heart_rate', sa.Integer(), nullable=True),
        sa.Column('steps', sa.Integer(), nullable=True),
        sa.Column('notes', sa.String(), nullable=True),
        sa.Column('source', sa.String(), nullable=False),
        sa.Column('external_link', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('workouts')
    op.drop_table('users') 