"""
SQLAlchemy Models for FitBuddy AI Fitness Platform
Database: SQLite (sqlite:///fitness_database.sqlite)
"""

from datetime import datetime
from typing import List, Optional
import json

from sqlalchemy import (
    create_engine,
    Column,
    String,
    Integer,
    Float,
    Text,
    DateTime,
    ForeignKey,
    Index,
)
from sqlalchemy.orm import (
    declarative_base,
    relationship,
    sessionmaker,
    Session,
)

Base = declarative_base()


class User(Base):
    """
    Stores user details, biometric baseline, and fitness preferences.
    """
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    email = Column(String(256), nullable=True)
    age = Column(Integer, nullable=False)
    gender = Column(String(32), nullable=False)
    height_cm = Column(Float, nullable=False)
    weight_kg = Column(Float, nullable=False)
    fitness_goal = Column(String(64), nullable=False)  # weight_loss, muscle_gain, flexibility, general_fitness
    activity_level = Column(String(64), nullable=False)
    workout_experience = Column(String(64), nullable=False)
    workout_intensity = Column(String(32), nullable=False)  # low, medium, high
    preferred_workout_type = Column(String(64), nullable=False)
    available_equipment = Column(String(64), nullable=False)
    workout_duration_minutes = Column(Integer, nullable=False, default=45)
    limitations_or_injuries = Column(Text, nullable=True)
    dietary_preference = Column(String(64), nullable=True)
    created_at = Column(String(64), default=lambda: datetime.utcnow().isoformat())
    updated_at = Column(String(64), default=lambda: datetime.utcnow().isoformat(), onupdate=lambda: datetime.utcnow().isoformat())

    # Relationships
    plans = relationship("WorkoutPlan", back_populates="user", cascade="all, delete-orphan")
    feedback_logs = relationship("PlanFeedbackLog", back_populates="user")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "age": self.age,
            "gender": self.gender,
            "height_cm": self.height_cm,
            "weight_kg": self.weight_kg,
            "fitness_goal": self.fitness_goal,
            "activity_level": self.activity_level,
            "workout_experience": self.workout_experience,
            "workout_intensity": self.workout_intensity,
            "preferred_workout_type": self.preferred_workout_type,
            "available_equipment": self.available_equipment,
            "workout_duration_minutes": self.workout_duration_minutes,
            "limitations_or_injuries": self.limitations_or_injuries,
            "dietary_preference": self.dietary_preference,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }


class WorkoutPlan(Base):
    """
    Stores generated and modified workout plans with full JSON payload and versioning.
    """
    __tablename__ = "workout_plans"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    user_name = Column(String(128), nullable=True)
    plan_title = Column(String(256), nullable=False)
    tagline = Column(String(512), nullable=True)
    executive_summary = Column(Text, nullable=True)
    workout_intensity = Column(String(32), nullable=False)  # low, medium, high
    available_workout_days = Column(Integer, nullable=False)
    workout_duration_minutes = Column(Integer, nullable=False)
    available_equipment = Column(String(64), nullable=False)
    fitness_goal = Column(String(64), nullable=False)
    version = Column(Integer, nullable=False, default=1)
    latest_feedback_applied = Column(Text, nullable=True)
    plan_json = Column(Text, nullable=False)  # Full serialized GeneratedFitnessPlan JSON
    created_at = Column(String(64), default=lambda: datetime.utcnow().isoformat())
    updated_at = Column(String(64), default=lambda: datetime.utcnow().isoformat(), onupdate=lambda: datetime.utcnow().isoformat())

    # Relationships
    user = relationship("User", back_populates="plans")
    feedback_logs = relationship("PlanFeedbackLog", back_populates="plan", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "user_name": self.user_name,
            "plan_title": self.plan_title,
            "tagline": self.tagline,
            "executive_summary": self.executive_summary,
            "workout_intensity": self.workout_intensity,
            "available_workout_days": self.available_workout_days,
            "workout_duration_minutes": self.workout_duration_minutes,
            "available_equipment": self.available_equipment,
            "fitness_goal": self.fitness_goal,
            "version": self.version,
            "latest_feedback_applied": self.latest_feedback_applied,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    def get_parsed_plan(self):
        try:
            return json.loads(self.plan_json)
        except Exception:
            return None


class PlanFeedbackLog(Base):
    """
    Stores feedback-based modification history for tracking how workout plans evolve.
    """
    __tablename__ = "plan_feedback_logs"

    id = Column(String(64), primary_key=True, index=True)
    plan_id = Column(String(64), ForeignKey("workout_plans.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    feedback_text = Column(Text, nullable=False)
    modifications_summary = Column(Text, nullable=True)
    applied_intensity = Column(String(32), nullable=True)
    created_at = Column(String(64), default=lambda: datetime.utcnow().isoformat())

    # Relationships
    plan = relationship("WorkoutPlan", back_populates="feedback_logs")
    user = relationship("User", back_populates="feedback_logs")

    def to_dict(self):
        return {
            "id": self.id,
            "plan_id": self.plan_id,
            "user_id": self.user_id,
            "feedback_text": self.feedback_text,
            "modifications_summary": self.modifications_summary,
            "applied_intensity": self.applied_intensity,
            "created_at": self.created_at,
        }


# Database Engine Setup
DATABASE_URL = "sqlite:///fitness_database.sqlite"

def get_engine(db_url: str = DATABASE_URL):
    return create_engine(db_url, connect_args={"check_same_thread": False})

def create_tables(engine=None):
    if engine is None:
        engine = get_engine()
    Base.metadata.create_all(bind=engine)
    print("SQLite tables successfully created using SQLAlchemy.")

def get_session(engine=None) -> Session:
    if engine is None:
        engine = get_engine()
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal()


if __name__ == "__main__":
    engine = get_engine()
    create_tables(engine)
