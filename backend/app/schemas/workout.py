from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel

class WorkoutBase(BaseModel):
    workout_date: datetime
    activity_type: str
    calories_burned: Optional[int] = None
    distance_mi: Optional[float] = None
    workout_time_seconds: Optional[int] = None
    avg_pace_min_mi: Optional[float] = None
    max_pace_min_mi: Optional[float] = None
    avg_speed_mph: Optional[float] = None
    max_speed_mph: Optional[float] = None
    avg_heart_rate: Optional[int] = None
    steps: Optional[int] = None
    notes: Optional[str] = None
    source: str
    external_link: Optional[str] = None

class WorkoutCreate(WorkoutBase):
    pass

class WorkoutUpdate(WorkoutBase):
    pass

class WorkoutInDBBase(WorkoutBase):
    id: int
    user_id: int
    date_submitted: datetime

    class Config:
        from_attributes = True

class Workout(WorkoutInDBBase):
    pass

class WorkoutInDB(WorkoutInDBBase):
    pass

class WorkoutList(BaseModel):
    items: List[Workout]
    total: int

class WeeklyMileage(BaseModel):
    week: str
    distance: float

class Achievement(BaseModel):
    type: str
    value: str
    date: str

class PaceZones(BaseModel):
    easy: int
    moderate: int
    tempo: int

class WorkoutSummary(BaseModel):
    total_runs: int
    total_distance: float
    avg_distance: float
    longest_run: float
    best_pace: Optional[float]
    avg_pace: Optional[float]
    total_time: int
    weekly_mileage: List[WeeklyMileage]
    recent_achievements: List[Achievement]
    pace_zones: PaceZones 