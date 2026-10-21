import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from sqlalchemy import Column, String, Integer, DateTime, Text, JSON, Float, ForeignKey, Boolean
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

# --- SQLAlchemy Models ---

class UserModel(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)  # ex: "user_123" ou número de telefone/telegram
    name = Column(String, nullable=True)
    channel = Column(String, default="web")  # "whatsapp", "telegram", "web"
    phone_or_chat_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_interaction = Column(DateTime, default=datetime.datetime.utcnow)
    preferences = Column(JSON, default=dict)

    memories = relationship("MemoryModel", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("GoalModel", back_populates="user", cascade="all, delete-orphan")
    miniapps = relationship("MiniAppModel", back_populates="user", cascade="all, delete-orphan")


class MemoryModel(Base):
    __tablename__ = "memories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"))
    category = Column(String, default="general")  # "identity", "health", "finance", "habits", "values"
    fact = Column(Text, nullable=False)
    importance = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("UserModel", back_populates="memories")


class GoalModel(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    category = Column(String, default="habit")
    target_value = Column(Float, nullable=True)
    current_value = Column(Float, default=0.0)
    unit = Column(String, nullable=True)  # "km", "livros", "horas", "dias"
    deadline = Column(DateTime, nullable=True)
    status = Column(String, default="active")  # "active", "completed", "paused"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("UserModel", back_populates="goals")


class MiniAppModel(Base):
    __tablename__ = "mini_apps"

    id = Column(String, primary_key=True)  # uuid ou slug único
    user_id = Column(String, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    app_type = Column(String, default="tracker")  # "tracker", "checklist", "summary", "timer"
    ui_schema = Column(JSON, nullable=False)  # JSON Schema para renderização no client
    app_state = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("UserModel", back_populates="miniapps")


# --- Pydantic Schemas ---

class MessageRequest(BaseModel):
    user_id: str
    message: Optional[str] = ""
    channel: str = "web"
    image_base64: Optional[str] = None
    audio_base64: Optional[str] = None

class MessageResponse(BaseModel):
    reply: str
    generated_mini_app: Optional[Dict[str, Any]] = None
    new_memories_learned: List[str] = []
    goals_updated: List[str] = []

class MiniAppActionRequest(BaseModel):
    mini_app_id: str
    user_id: str
    action_type: str  # ex: "toggle_item", "increment_value", "submit_form"
    payload: Dict[str, Any]
