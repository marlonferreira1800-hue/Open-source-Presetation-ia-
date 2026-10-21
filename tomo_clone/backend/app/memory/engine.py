import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.schemas import UserModel, MemoryModel, GoalModel

class MemoryEngine:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_create_user(self, user_id: str, name: Optional[str] = None, channel: str = "web") -> UserModel:
        result = await self.db.execute(select(UserModel).where(UserModel.id == user_id))
        user = result.scalars().first()
        if not user:
            user = UserModel(
                id=user_id,
                name=name or f"User_{user_id[-4:]}",
                channel=channel,
                created_at=datetime.datetime.utcnow(),
                last_interaction=datetime.datetime.utcnow(),
                preferences={"tone": "encorajador, direto, sem enrolação"}
            )
            self.db.add(user)
            await self.db.commit()
            await self.db.refresh(user)
        else:
            user.last_interaction = datetime.datetime.utcnow()
            await self.db.commit()
        return user

    async def get_user_context(self, user_id: str) -> Dict[str, Any]:
        """Recupera o perfil consolidado de memórias e metas ativas do usuário."""
        # Buscar memórias
        mem_res = await self.db.execute(
            select(MemoryModel).where(MemoryModel.user_id == user_id).order_by(MemoryModel.created_at.desc())
        )
        memories = mem_res.scalars().all()

        # Buscar metas ativas
        goal_res = await self.db.execute(
            select(GoalModel).where(GoalModel.user_id == user_id, GoalModel.status == "active")
        )
        goals = goal_res.scalars().all()

        return {
            "memories": [{"category": m.category, "fact": m.fact} for m in memories],
            "goals": [
                {
                    "title": g.title,
                    "category": g.category,
                    "current": g.current_value,
                    "target": g.target_value,
                    "unit": g.unit
                }
                for g in goals
            ]
        }

    async def save_memory(self, user_id: str, fact: str, category: str = "general"):
        """Salva um fato de longo prazo na memória do usuário se não for duplicado."""
        existing = await self.db.execute(
            select(MemoryModel).where(MemoryModel.user_id == user_id, MemoryModel.fact == fact)
        )
        if not existing.scalars().first():
            mem = MemoryModel(user_id=user_id, fact=fact, category=category)
            self.db.add(mem)
            await self.db.commit()

    async def add_or_update_goal(self, user_id: str, title: str, category: str = "habit", target_val: float = 1.0, unit: str = "dias"):
        result = await self.db.execute(
            select(GoalModel).where(GoalModel.user_id == user_id, GoalModel.title == title)
        )
        goal = result.scalars().first()
        if not goal:
            goal = GoalModel(
                user_id=user_id,
                title=title,
                category=category,
                target_value=target_val,
                current_value=0.0,
                unit=unit
            )
            self.db.add(goal)
        else:
            goal.target_value = target_val
        await self.db.commit()
        return goal
