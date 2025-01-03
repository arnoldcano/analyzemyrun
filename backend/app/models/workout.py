from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date_submitted = Column(DateTime, default=datetime.utcnow)
    workout_date = Column(DateTime, nullable=False)
    activity_type = Column(String, nullable=False)
    calories_burned = Column(Integer)
    distance_mi = Column(Float)
    workout_time_seconds = Column(Integer)
    avg_pace_min_mi = Column(Float)
    max_pace_min_mi = Column(Float)
    avg_speed_mph = Column(Float)
    max_speed_mph = Column(Float)
    avg_heart_rate = Column(Integer)
    steps = Column(Integer)
    notes = Column(String)
    source = Column(String)  # 'csv' or 'mapmyfitness'
    external_link = Column(String)

    # Relationship with User model
    user = relationship("User", back_populates="workouts") 