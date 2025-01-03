from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String, nullable=False)  # 'distance', 'time', or 'race'
    target = Column(String, nullable=False)  # Store as string to handle all types
    target_date = Column(DateTime, nullable=False)
    date_created = Column(DateTime, default=datetime.utcnow)
    completed = Column(DateTime, nullable=True)  # When the goal was achieved

    # Relationship with User model
    user = relationship("User", back_populates="goals") 