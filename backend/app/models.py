from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Password reset flow (6-digit code sent via email)
    reset_code = Column(String, nullable=True)
    reset_code_expires_at = Column(DateTime, nullable=True)

    history = relationship("History", back_populates="user", cascade="all, delete-orphan")

class History(Base):
    __tablename__ = "classification_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Nullable for guest scans
    filename = Column(String, nullable=False)
    label = Column(String, nullable=False) # "REAL" or "FAKE"
    confidence = Column(Float, nullable=False) # e.g. 0.954
    inference_time_ms = Column(Integer, nullable=False) # e.g. 250
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Feedback loop columns
    has_feedback = Column(Boolean, default=False)
    was_correct = Column(Boolean, nullable=True)

    user = relationship("User", back_populates="history")
