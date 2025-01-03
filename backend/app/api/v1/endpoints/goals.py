from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.crud import goal as crud_goal
from app.schemas.goal import Goal, GoalCreate, GoalUpdate

router = APIRouter()

@router.get("/", response_model=List[Goal])
def get_goals(
    db: Session = Depends(deps.get_db),
    current_user_id: int = Depends(deps.get_current_user_id),
):
    """Get all goals for the current user."""
    return crud_goal.get_goals(db, current_user_id)

@router.post("/", response_model=Goal)
def create_goal(
    goal: GoalCreate,
    db: Session = Depends(deps.get_db),
    current_user_id: int = Depends(deps.get_current_user_id),
):
    """Create a new goal."""
    return crud_goal.create_goal(db, goal, current_user_id)

@router.put("/{goal_id}", response_model=Goal)
def update_goal(
    goal_id: int,
    goal: GoalUpdate,
    db: Session = Depends(deps.get_db),
    current_user_id: int = Depends(deps.get_current_user_id),
):
    """Update a goal."""
    db_goal = crud_goal.update_goal(db, goal_id, goal, current_user_id)
    if not db_goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return db_goal

@router.delete("/{goal_id}")
def delete_goal(
    goal_id: int,
    db: Session = Depends(deps.get_db),
    current_user_id: int = Depends(deps.get_current_user_id),
):
    """Delete a goal."""
    if not crud_goal.delete_goal(db, goal_id, current_user_id):
        raise HTTPException(status_code=404, detail="Goal not found")
    return {"message": "Goal deleted"} 