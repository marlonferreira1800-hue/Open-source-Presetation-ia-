import httpx
import logging
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class TelegramChannel:
    def __init__(self):
        self.token = settings.TELEGRAM_BOT_TOKEN
        self.base_url = f"https://api.telegram.org/bot{self.token}" if self.token else None

    async def send_message(self, chat_id: str, text: str) -> bool:
        if not self.base_url:
            logger.warning("Telegram Bot Token não configurado.")
            return False
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                resp = await client.post(
                    f"{self.base_url}/sendMessage",
                    json={"chat_id": chat_id, "text": text, "parse_mode": "Markdown"}
                )
                return resp.status_code == 200
            except Exception as e:
                logger.error(f"Erro ao enviar mensagem no Telegram: {e}")
                return False

    def parse_webhook(self, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Extrai texto e chat_id do payload do webhook do Telegram."""
        message = payload.get("message", {})
        text = message.get("text")
        chat = message.get("chat", {})
        chat_id = str(chat.get("id"))
        
        if text and chat_id:
            return {"user_id": f"tg_{chat_id}", "chat_id": chat_id, "text": text}
        return None

telegram_channel = TelegramChannel()
