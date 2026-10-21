import logging
import datetime
from typing import List, Dict, Any
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.future import select
from app.core.config import settings
from app.core.db import AsyncSessionLocal
from app.models.schemas import UserModel, GoalModel
from app.integrations.google_calendar import calendar_service
from app.core.git_service import git_service

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

        if settings.AUTO_GIT_SYNC_ENABLED:
            self.scheduler.add_job(
                git_service.auto_commit_and_push,
                "interval",
                minutes=settings.AUTO_GIT_SYNC_INTERVAL_MINUTES,
                id="git_auto_sync",
                replace_existing=True
            )
            logger.info(f"Auto-Git Sync ativado: intervalo de {settings.AUTO_GIT_SYNC_INTERVAL_MINUTES} minutos.")

        if settings.PROACTIVE_CHECKINS_ENABLED or settings.AUTO_GIT_SYNC_ENABLED:
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

            # Consultar eventos do Google Calendar para o briefing do dia
            events = await calendar_service.list_today_events(user_id)
            cal_summary = f" (Agenda: {len(events)} compromissos agendados)" if events else ""

            if trigger_type == "morning":
                if events:
                    ev_titles = ", ".join([f"{e.get('time', 'Hoje')}: {e.get('summary', 'Reunião')}" for e in events[:2]])
                    msg = f"🌅 Bom dia! Consultei sua agenda no Google Calendar: você tem {ev_titles}. Qual horário livre vamos reservar para focar na meta de {goal_titles[0] if goal_titles else 'hoje'}?"
                elif goal_titles:
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
