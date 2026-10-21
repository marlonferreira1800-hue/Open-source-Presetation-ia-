import httpx
import logging
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class WhatsAppChannel:
    def __init__(self):
        self.api_url = settings.EVOLUTION_API_URL
        self.api_key = settings.EVOLUTION_API_KEY
        self.instance = settings.EVOLUTION_INSTANCE_NAME

    async def send_message(self, phone_number: str, text: str) -> bool:
        if not self.api_url or not self.api_key:
            logger.warning("Evolution API WhatsApp não configurada.")
            return False

        url = f"{self.api_url.rstrip('/')}/message/sendText/{self.instance}"
        headers = {"apikey": self.api_key, "Content-Type": "application/json"}
        payload = {
            "number": phone_number,
            "options": {"delay": 1200, "presence": "composing"},
            "textMessage": {"text": text}
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                resp = await client.post(url, json=payload, headers=headers)
                return resp.status_code in [200, 201]
            except Exception as e:
                logger.error(f"Erro ao enviar mensagem no WhatsApp: {e}")
                return False

    def parse_webhook(self, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Extrai texto e número do remetente do webhook da Evolution API."""
        try:
            data = payload.get("data", {})
            message = data.get("message", {})
            key = data.get("key", {})
            
            # Evita responder as próprias mensagens enviadas pelo bot
            if key.get("fromMe", False):
                return None

            remote_jid = key.get("remoteJid", "")
            phone = remote_jid.split("@")[0]
            
            text = (
                message.get("conversation") or
                message.get("extendedTextMessage", {}).get("text")
            )

            if text and phone:
                return {
                    "user_id": f"wa_{phone}",
                    "phone": phone,
                    "text": text
                }
        except Exception as e:
            logger.error(f"Erro ao parsear webhook do WhatsApp: {e}")
        return None

whatsapp_channel = WhatsAppChannel()
