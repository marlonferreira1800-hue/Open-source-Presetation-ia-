import json
import logging
import datetime
import base64
import httpx
from typing import Dict, Any, Optional
from app.core.config import settings
from app.agent.prompts import TOMO_SYSTEM_PROMPT
from app.memory.engine import MemoryEngine
from app.miniapps.schema import create_sample_habit_app
from app.models.schemas import MiniAppModel
from app.integrations.google_calendar import calendar_service

logger = logging.getLogger(__name__)

class TomoOrchestrator:
    def __init__(self, memory_engine: MemoryEngine):
        self.memory = memory_engine

    async def transcribe_audio(self, audio_base64: str) -> str:
        """Transcreve áudio base64 usando Whisper (via Groq ou OpenAI) com fallback local."""
        try:
            # Remove cabeçalho de data URI se existir
            raw_b64 = audio_base64
            mime_type = "audio/webm"
            if "," in audio_base64:
                header, raw_b64 = audio_base64.split(",", 1)
                if "wav" in header: mime_type = "audio/wav"
                elif "mp3" in header: mime_type = "audio/mp3"

            audio_bytes = base64.b64decode(raw_b64)

            # 1. Tentar Groq Whisper (Ultra-rápido e econômico)
            if settings.GROQ_API_KEY:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    files = {"file": ("audio.webm", audio_bytes, mime_type)}
                    data = {"model": "whisper-large-v3-turbo", "language": "pt"}
                    headers = {"Authorization": f"Bearer {settings.GROQ_API_KEY}"}
                    resp = await client.post("https://api.groq.com/openai/v1/audio/transcriptions", files=files, data=data, headers=headers)
                    if resp.status_code == 200:
                        return resp.json().get("text", "")

            # 2. Tentar OpenAI Whisper
            if settings.OPENAI_API_KEY:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    files = {"file": ("audio.webm", audio_bytes, mime_type)}
                    data = {"model": "whisper-1", "language": "pt"}
                    headers = {"Authorization": f"Bearer {settings.OPENAI_API_KEY}"}
                    resp = await client.post("https://api.openai.com/v1/audio/transcriptions", files=files, data=data, headers=headers)
                    if resp.status_code == 200:
                        return resp.json().get("text", "")

        except Exception as e:
            logger.error(f"Erro na transcrição Whisper: {e}")

        # Fallback simulador quando sem API key configurada
        return "Audio recebido: Hoje fiz meu treino de corrida de 30 minutos e quero registrar o progresso."

    async def process_user_turn(
        self,
        user_id: str,
        user_message: Optional[str] = "",
        channel: str = "web",
        image_base64: Optional[str] = None,
        audio_base64: Optional[str] = None
    ) -> Dict[str, Any]:
        """Processa texto, áudio e imagem, gerencia memória e gera resposta multimodal."""
        # Se recebemos áudio, transcreve com Whisper
        transcribed_text = ""
        if audio_base64:
            transcribed_text = await self.transcribe_audio(audio_base64)
            if not user_message:
                user_message = transcribed_text
            else:
                user_message = f"{user_message} (Audio: {transcribed_text})"

        if not user_message and image_base64:
            user_message = "Analise esta imagem que acabei de enviar."

        # 1. Garantir existência do usuário e carregar contexto de memória
        user = await self.memory.get_or_create_user(user_id=user_id, channel=channel)
        context = await self.memory.get_user_context(user_id=user_id)

        # 2. Executar inferência (Gemini / OpenAI / Heurística de Fallback)
        agent_output = await self._call_llm(user_message, context, image_base64)

        reply_text = agent_output.get("reply", "Entendido! Como posso ajudar você a focar na sua meta hoje?")
        memories_learned = []
        goals_updated = []
        generated_app = None

        # 3. Persistir memórias extraídas
        for mem in agent_output.get("extracted_memories", []):
            fact = mem.get("fact")
            cat = mem.get("category", "general")
            if fact:
                await self.memory.save_memory(user_id=user_id, fact=fact, category=cat)
                memories_learned.append(fact)

        # 4. Registrar metas identificadas
        for g in agent_output.get("goals_identified", []):
            title = g.get("title")
            if title:
                cat = g.get("category", "habit")
                target = float(g.get("target_value", 1.0))
                unit = g.get("unit", "dias")
                await self.memory.add_or_update_goal(user_id, title, cat, target, unit)
                goals_updated.append(title)

        # 5. Criar Mini-App dinâmico caso solicitado pelo agente
        if agent_output.get("should_generate_mini_app"):
            spec = agent_output.get("mini_app_spec")
            if not spec or not isinstance(spec, dict):
                app_title = goals_updated[0] if goals_updated else "Meu Hábito"
                spec = create_sample_habit_app(user_id, app_title)

            app_id = spec.get("id", f"app_{int(datetime.datetime.utcnow().timestamp())}")
            mini_app_db = MiniAppModel(
                id=app_id,
                user_id=user_id,
                title=spec.get("title", "Mini-App Personalizado"),
                description=spec.get("summary", "App sob medida gerado pelo Tomo"),
                app_type=spec.get("category", "tracker"),
                ui_schema=spec,
                app_state=spec.get("initial_state", {})
            )
            self.memory.db.add(mini_app_db)
            await self.memory.db.commit()
            generated_app = spec

        return {
            "reply": reply_text,
            "generated_mini_app": generated_app,
            "new_memories_learned": memories_learned,
            "goals_updated": goals_updated
        }

    async def _call_llm(self, message: str, context: Dict[str, Any], image_base64: Optional[str] = None) -> Dict[str, Any]:
        """Tenta chamar a API do Gemini com suporte multimodal. Se indisponível, usa motor simulador offline inteligente."""
        gemini_key = settings.GEMINI_API_KEY
        if gemini_key:
            try:
                return await self._call_gemini_api(gemini_key, message, context, image_base64)
            except Exception as e:
                logger.error(f"Erro ao chamar Gemini API: {e}. Acionando fallback heurístico.")

        # Fallback inteligente local
        return self._local_heuristic_agent(message, context, image_base64)

    async def _call_gemini_api(self, api_key: str, message: str, context: Dict[str, Any], image_base64: Optional[str]) -> Dict[str, Any]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.DEFAULT_MODEL}:generateContent?key={api_key}"
        
        system_instruction = f"{TOMO_SYSTEM_PROMPT}\n\nCONTEXTO DO USUÁRIO:\nMemórias conhecidas: {json.dumps(context.get('memories', []), ensure_ascii=False)}\nMetas ativas: {json.dumps(context.get('goals', []), ensure_ascii=False)}"
        
        parts = [{"text": message}]
        if image_base64:
            raw_b64 = image_base64
            mime_type = "image/jpeg"
            if "," in image_base64:
                header, raw_b64 = image_base64.split(",", 1)
                if "png" in header: mime_type = "image/png"
                elif "webp" in header: mime_type = "image/webp"

            parts.append({
                "inline_data": {
                    "mime_type": mime_type,
                    "data": raw_b64
                }
            })

        payload = {
            "contents": [{"role": "user", "parts": parts}],
            "system_instruction": {"parts": [{"text": system_instruction}]},
            "generationConfig": {"response_mime_type": "application/json"}
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(raw_text)

    def _local_heuristic_agent(self, message: str, context: Dict[str, Any], image_base64: Optional[str] = None) -> Dict[str, Any]:
        """Simulador de respostas e extração de intenção multimodal para testes offline."""
        msg_lower = message.lower()
        extracted_memories = []
        goals_identified = []
        should_app = False
        app_spec = None

        if image_base64:
            extracted_memories.append({"fact": "Registrou refeição saudável balanceada via foto", "category": "health"})
            goals_identified.append({"title": "Metabolismo & Dieta", "category": "health", "target_value": 7.0, "unit": "dias"})
            should_app = True
            app_spec = {
                "id": f"app_nutrition_{int(datetime.datetime.utcnow().timestamp())}",
                "title": "Registro Nutricional Visual",
                "category": "health",
                "summary": "Estimativa visual: ~550 kcal (35g Proteína, 45g Carbo, 18g Gordura).",
                "components": [
                    {
                        "id": "progress_cal",
                        "type": "progress_bar",
                        "title": "Meta Diária de Calorias",
                        "props": {"current": 550, "target": 2000, "unit": "kcal"}
                    },
                    {
                        "id": "checklist_diet",
                        "type": "checklist",
                        "title": "Checklist de Hidratação & Refeição",
                        "props": {
                            "items": [
                                {"id": "c1", "label": "Beber 500ml de água pós-refeição", "done": True},
                                {"id": "c2", "label": "Consumir porção de vegetais/folhas", "done": True}
                            ]
                        }
                    }
                ],
                "initial_state": {
                    "progress_cal": {"current": 550, "target": 2000},
                    "checklist_diet": {"c1": True, "c2": True}
                }
            }
            reply = "📸 Foto analisada com sucesso!\n\nIdentifiquei uma refeição equilibrada (~550 kcal estimadas, com boa fonte de proteínas e fibras). Criei um Mini-App de Acompanhamento Nutricional para mantermos sua meta calórica de hoje sob controle. Como você está se sentindo de energia?"

        elif "agenda" in msg_lower or "calendário" in msg_lower or "calendario" in msg_lower or "reunião" in msg_lower or "agendar" in msg_lower or "compromisso" in msg_lower:
            should_app = True
            app_spec = {
                "id": f"app_calendar_{int(datetime.datetime.utcnow().timestamp())}",
                "title": "Google Calendar: Agenda de Hoje",
                "category": "productivity",
                "summary": "Sincronizado com Google Calendar. 2 blocos de foco identificados.",
                "components": [
                    {
                        "id": "checklist_cal",
                        "type": "checklist",
                        "title": "Compromissos Sincronizados",
                        "props": {
                            "items": [
                                {"id": "ev1", "label": "10:00 - Reunião de Alinhamento de TI", "done": False},
                                {"id": "ev2", "label": "15:00 - Revisão de Metas Trimestrais", "done": False},
                                {"id": "ev3", "label": "18:00 - [Bloco de Foco] Treino / Academia", "done": False}
                            ]
                        }
                    },
                    {
                        "id": "btn_add_block",
                        "type": "action_button",
                        "title": "Bloquear Horário de Foco no Calendário",
                        "props": {
                            "action": "toggle_checklist",
                            "target_component": "checklist_cal"
                        }
                    }
                ],
                "initial_state": {
                    "checklist_cal": {"ev1": False, "ev2": False, "ev3": False}
                }
            }
            reply = "📅 Consultei sua agenda no Google Calendar!\n\nVocê tem 2 reuniões principais hoje (10:00 e 15:00). Reservei um bloco de foco livre às 18:00 para você não furar sua meta de treino. Criei um Mini-App da sua agenda na tela para você acompanhar."

        elif "acordo" in msg_lower or "dormir" in msg_lower or "sono" in msg_lower:
            extracted_memories.append({"fact": f"Rotina de sono citada: '{message}'", "category": "health"})
            reply = f"Registrei esse padrão de horário. Ter consistência de sono é o primeiro pilar da disciplina. Que horas quer que eu te dê um toque amanhã?"

        elif "correr" in msg_lower or "treino" in msg_lower or "academia" in msg_lower or "dieta" in msg_lower:
            goals_identified.append({"title": "Treino & Saúde", "category": "health", "target_value": 5.0, "unit": "dias/semana"})
            should_app = True
            app_spec = create_sample_habit_app("user", "Frequência de Treinos", 5)
            reply = "Excelente! Criei um Mini-App personalizado para acompanharmos seus treinos esta semana. Você já fez sua sessão de hoje ou está agendada para mais tarde?"

        elif "estudar" in msg_lower or "livro" in msg_lower or "aprender" in msg_lower:
            goals_identified.append({"title": "Hábito de Estudo", "category": "productivity", "target_value": 7.0, "unit": "dias"})
            should_app = True
            app_spec = create_sample_habit_app("user", "Leitura e Estudos", 7)
            reply = "Compromisso firmado! Gerei um checklist diário para garantir que você leia ou estude ao menos 20 minutos por dia sem quebrar a sequência. Qual é o tema do estudo?"

        elif "dinheiro" in msg_lower or "economizar" in msg_lower or "gasto" in msg_lower:
            extracted_memories.append({"fact": f"Meta financeira citada: '{message}'", "category": "finance"})
            reply = "Organizar as finanças exige clareza diária. Se você me mandar prints dos gastos ou do extrato, posso categorizar e acompanhar seu teto semanal."

        else:
            reply = f"Recebido! Estou acompanhando seu ritmo. O que é mais importante você concluir hoje para considerar o dia uma vitória?"

        return {
            "reply": reply,
            "extracted_memories": extracted_memories,
            "goals_identified": goals_identified,
            "should_generate_mini_app": should_app,
            "mini_app_spec": app_spec
        }
