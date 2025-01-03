from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class GoalBase(BaseModel):
    type: str  # 'distance', 'time', or 'race'
    target: str
    target_date: datetime

class GoalCreate(GoalBase):
    pass

class GoalUpdate(GoalBase):
    completed: Optional[datetime] = None

class Goal(GoalBase):
    id: int
    user_id: int
    date_created: datetime
    completed: Optional[datetime] = None

    class Config:
        from_attributes = True 