from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.goal import Goal
from app.schemas.goal import GoalCreate, GoalUpdate

def get_goals(db: Session, user_id: int) -> List[Goal]:
    """Get all goals for a user."""
    return db.query(Goal).filter(Goal.user_id == user_id).order_by(Goal.target_date).all()

def create_goal(db: Session, goal: GoalCreate, user_id: int) -> Goal:
    """Create a new goal."""
    db_goal = Goal(
        **goal.model_dump(),
        user_id=user_id
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

def update_goal(db: Session, goal_id: int, goal: GoalUpdate, user_id: int) -> Optional[Goal]:
    """Update a goal."""
    db_goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()
    if not db_goal:
        return None
    
    for key, value in goal.model_dump(exclude_unset=True).items():
        setattr(db_goal, key, value)
    
    db.commit()
    db.refresh(db_goal)
    return db_goal

def delete_goal(db: Session, goal_id: int, user_id: int) -> bool:
    """Delete a goal."""
    db_goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()
    if not db_goal:
        return False
    
    db.delete(db_goal)
    db.commit()
    return True 