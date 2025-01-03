from typing import List, Optional, Tuple
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from app.models.workout import Workout
from app.schemas.workout import WorkoutCreate

def get_workout(db: Session, workout_id: int) -> Optional[Workout]:
    return db.query(Workout).filter(Workout.id == workout_id).first()

def get_workouts_by_user(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 10,
    sort_by: Optional[str] = None,
    sort_order: str = "desc",
    activity_type: Optional[str] = None
) -> Tuple[List[Workout], int]:
    query = db.query(Workout).filter(Workout.user_id == user_id)
    
    if activity_type:
        query = query.filter(Workout.activity_type == activity_type)
    
    # Get total count before applying pagination
    total = query.count()
    
    # Apply sorting
    if sort_by:
        order_func = desc if sort_order == "desc" else asc
        query = query.order_by(order_func(getattr(Workout, sort_by)))
    else:
        # Default sort by workout date descending
        query = query.order_by(desc(Workout.workout_date))
    
    # Apply pagination
    query = query.offset(skip).limit(limit)
    
    return query.all(), total

def get_workouts_in_date_range(
    db: Session,
    user_id: int,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
) -> List[Workout]:
    """
    Get workouts for a user within a date range.
    If start_date and end_date are None, returns all workouts.
    """
    query = db.query(Workout).filter(Workout.user_id == user_id)
    
    if start_date is not None:
        query = query.filter(Workout.workout_date >= start_date)
    if end_date is not None:
        query = query.filter(Workout.workout_date <= end_date)
    
    return query.order_by(Workout.workout_date.asc()).all()

def create_workout(db: Session, workout: WorkoutCreate, user_id: int) -> Workout:
    db_workout = Workout(
        **workout.model_dump(),
        user_id=user_id
    )
    db.add(db_workout)
    db.commit()
    db.refresh(db_workout)
    return db_workout

def create_workouts_bulk(db: Session, workouts: List[WorkoutCreate], user_id: int) -> List[Workout]:
    db_workouts = [
        Workout(**workout.model_dump(), user_id=user_id)
        for workout in workouts
    ]
    db.add_all(db_workouts)
    db.commit()
    for workout in db_workouts:
        db.refresh(workout)
    return db_workouts 