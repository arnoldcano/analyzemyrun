import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app import crud, schemas
from app.core.config import settings

logger = logging.getLogger(__name__)

FIRST_SUPERUSER = "admin@analyzemyrun.com"
FIRST_SUPERUSER_PW = "admin123"

TEST_USER = "user@analyzemyrun.com"
TEST_USER_PW = "user123"

# Sample workouts for the test user
sample_workouts = [
    {
        "workout_date": datetime.utcnow() - timedelta(days=5),
        "activity_type": "Running",
        "calories_burned": 450,
        "distance_mi": 5.0,
        "workout_time_seconds": 2700,  # 45 minutes
        "avg_pace_min_mi": 9.0,
        "max_pace_min_mi": 8.0,
        "avg_speed_mph": 6.67,
        "max_speed_mph": 7.5,
        "avg_heart_rate": 155,
        "steps": 7500,
        "notes": "Morning run, felt good",
        "source": "csv"
    },
    {
        "workout_date": datetime.utcnow() - timedelta(days=3),
        "activity_type": "Running",
        "calories_burned": 600,
        "distance_mi": 7.0,
        "workout_time_seconds": 3600,  # 60 minutes
        "avg_pace_min_mi": 8.5,
        "max_pace_min_mi": 7.5,
        "avg_speed_mph": 7.0,
        "max_speed_mph": 8.0,
        "avg_heart_rate": 160,
        "steps": 10000,
        "notes": "Long run, pushed the pace",
        "source": "csv"
    }
]

def init_db(db: Session) -> None:
    # Create admin user if it doesn't exist
    admin_user = crud.user.get_user_by_email(db, email=FIRST_SUPERUSER)
    if not admin_user:
        user_in = schemas.UserCreate(
            email=FIRST_SUPERUSER,
            password=FIRST_SUPERUSER_PW,
            full_name="Admin User",
            is_active=True,
        )
        admin_user = crud.user.create_user(db, user_in=user_in)
        logger.info("Created admin user")

    # Create test user if it doesn't exist
    test_user = crud.user.get_user_by_email(db, email=TEST_USER)
    if not test_user:
        user_in = schemas.UserCreate(
            email=TEST_USER,
            password=TEST_USER_PW,
            full_name="Test User",
            is_active=True,
        )
        test_user = crud.user.create_user(db, user_in=user_in)
        logger.info("Created test user")

        # Add sample workouts for test user
        for workout_data in sample_workouts:
            workout_in = schemas.WorkoutCreate(**workout_data)
            crud.workout.create_workout(db, workout=workout_in, user_id=test_user.id)
        logger.info("Added sample workouts for test user") 