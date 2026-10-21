import datetime
import logging
from typing import List, Dict, Any, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

class GoogleCalendarService:
    def __init__(self):
        # Armazena eventos mockados ou sincronizados em memória por usuário para testes rápidos
        self._mock_events_db: Dict[str, List[Dict[str, Any]]] = {}

    async def list_today_events(self, user_id: str, access_token: Optional[str] = None) -> List[Dict[str, Any]]:
        """Recupera os eventos de hoje do Google Calendar (ou mock inteligente se não autenticado)."""
        if access_token:
            try:
                now = datetime.datetime.utcnow()
                start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat() + "Z"
                end_of_day = now.replace(hour=23, minute=59, second=59, microsecond=0).isoformat() + "Z"

                url = f"https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin={start_of_day}&timeMax={end_of_day}&singleEvents=true&orderBy=startTime"
                headers = {"Authorization": f"Bearer {access_token}"}
                
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.get(url, headers=headers)
                    if resp.status_code == 200:
                        items = resp.json().get("items", [])
                        return [
                            {
                                "id": it.get("id"),
                                "summary": it.get("summary", "Sem título"),
                                "start": it.get("start", {}).get("dateTime", it.get("start", {}).get("date")),
                                "end": it.get("end", {}).get("dateTime", it.get("end", {}).get("date")),
                            }
                            for it in items
                        ]
            except Exception as e:
                logger.error(f"Erro ao consultar Google Calendar: {e}")

        # Se não tiver token ou ocorrer erro, fornece a agenda mockada do usuário
        if user_id not in self._mock_events_db:
            now = datetime.datetime.now()
            today_str = now.strftime("%Y-%m-%d")
            self._mock_events_db[user_id] = [
                {"id": "ev1", "summary": "Reunião de Alinhamento de TI", "time": "10:00 - 11:00", "date": today_str},
                {"id": "ev2", "summary": "Revisão de Metas Trimestrais", "time": "15:00 - 16:00", "date": today_str}
            ]
        return self._mock_events_db[user_id]

    async def schedule_event(
        self,
        user_id: str,
        summary: str,
        time_str: str,
        access_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """Cria um novo evento ou bloco de foco na agenda do usuário."""
        if access_token:
            try:
                # Criação real via Google Calendar API
                url = "https://www.googleapis.com/calendar/v3/calendars/primary/events"
                headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
                payload = {
                    "summary": summary,
                    "description": "Agendado automaticamente pelo Tomo AI",
                    "start": {"dateTime": f"{datetime.date.today()}T{time_str.split('-')[0].strip()}:00-03:00"},
                    "end": {"dateTime": f"{datetime.date.today()}T{time_str.split('-')[1].strip() if '-' in time_str else '19:00'}:00-03:00"}
                }
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(url, json=payload, headers=headers)
                    if resp.status_code in [200, 201]:
                        return resp.json()
            except Exception as e:
                logger.error(f"Erro ao criar evento no Google Calendar: {e}")

        # Persistência simulada local
        new_event = {
            "id": f"ev_{int(datetime.datetime.utcnow().timestamp())}",
            "summary": summary,
            "time": time_str,
            "date": datetime.date.today().isoformat()
        }
        if user_id not in self._mock_events_db:
            self._mock_events_db[user_id] = []
        self._mock_events_db[user_id].append(new_event)
        return new_event

calendar_service = GoogleCalendarService()
