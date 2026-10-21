import logging
import datetime
from typing import List, Dict, Any
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.future import select
from app.core.config import settings
from app.core.db import AsyncSessionLocal
from app.models.schemas import UserModel, GoalModel

logger = logging.getLogger(__name__)

class ProactiveScheduler:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()

    def start(self):
        # Agenda checagens periódicas se ativado nas configurações
        if settings.PROACTIVE_CHECKINS_ENABLED:
            self.scheduler.add_job(
                self.check_inactive_users,
                "interval",
                minutes=30,
                id="inactivity_check",
                replace_existing=True
            )
            self.scheduler.start()
            logger.info("Scheduler proativo do Tomo iniciado.")

    def stop(self):
        if self.scheduler.running:
            self.scheduler.shutdown()

    async def check_inactive_users(self):
        """Verifica usuários com metas ativas sem interação recente."""
        async with AsyncSessionLocal() as session:
            threshold = datetime.datetime.utcnow() - datetime.timedelta(hours=settings.INACTIVITY_THRESHOLD_HOURS)
            result = await session.execute(
                select(UserModel).where(UserModel.last_interaction < threshold)
            )
            users = result.scalars().all()
            for user in users:
                # Gera notificação/nudge proativo
                logger.info(f"[Proativo] Notificando usuário inativo {user.id} para manter a rotina.")

    async def generate_proactive_nudge(self, user_id: str, trigger_type: str = "morning") -> Dict[str, Any]:
        """Gera mensagem proativa sob demanda (morning, midday, evening, inactivity)."""
        async with AsyncSessionLocal() as session:
            # Buscar metas do usuário para enriquecer o nudge
            goals_res = await session.execute(
                select(GoalModel).where(GoalModel.user_id == user_id, GoalModel.status == "active")
            )
            goals = goals_res.scalars().all()
            goal_titles = [g.title for g in goals]

            if trigger_type == "morning":
                if goal_titles:
                    msg = f"🌅 Bom dia! Hoje é um novo dia para avançar em: {', '.join(goal_titles)}. Qual é a sua prioridade nº 1 para esta manhã?"
                else:
                    msg = "🌅 Bom dia! Preparado para o dia de hoje? Que hábito ou meta vamos focar hoje?"
            elif trigger_type == "evening":
                msg = "🌙 Boa noite! Passando para checar como foi o seu dia. Conseguiu cumprir seus compromissos e metas planejadas?"
            elif trigger_type == "inactivity":
                msg = "👀 Ei! Percebi que você está sumido há algumas horas. Como está o foco na sua rotina de hoje?"
            else:
                msg = "⚡ Check-in rápido de meio de dia: fez uma pausa para água ou cumpriu o bloco de foco planejado?"

            return {
                "trigger_type": trigger_type,
                "message": msg,
                "timestamp": datetime.datetime.utcnow().isoformat()
            }

proactive_scheduler = ProactiveScheduler()
