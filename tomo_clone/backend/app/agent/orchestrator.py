import json
import logging
import datetime
import httpx
from typing import Dict, Any, Optional
from app.core.config import settings
from app.agent.prompts import TOMO_SYSTEM_PROMPT
from app.memory.engine import MemoryEngine
from app.miniapps.schema import create_sample_habit_app
from app.models.schemas import MiniAppModel

logger = logging.getLogger(__name__)

class TomoOrchestrator:
    def __init__(self, memory_engine: MemoryEngine):
        self.memory = memory_engine

    async def process_user_turn(
        self,
        user_id: str,
        user_message: str,
        channel: str = "web",
        image_base64: Optional[str] = None
    ) -> Dict[str, Any]:
        """Processa a mensagem do usuário, gerencia a memória e gera a resposta + mini-apps."""
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
                # Gera template de hábito baseado na primeira meta
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
        """Tenta chamar a API do Gemini. Se indisponível, usa motor simulador offline inteligente."""
        gemini_key = settings.GEMINI_API_KEY
        if gemini_key:
            try:
                return await self._call_gemini_api(gemini_key, message, context, image_base64)
            except Exception as e:
                logger.error(f"Erro ao chamar Gemini API: {e}. Acionando fallback heurístico.")

        # Fallback inteligente local (permite execução e testes instantâneos)
        return self._local_heuristic_agent(message, context)

    async def _call_gemini_api(self, api_key: str, message: str, context: Dict[str, Any], image_base64: Optional[str]) -> Dict[str, Any]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.DEFAULT_MODEL}:generateContent?key={api_key}"
        
        system_instruction = f"{TOMO_SYSTEM_PROMPT}\n\nCONTEXTO DO USUÁRIO:\nMemórias conhecidas: {json.dumps(context.get('memories', []), ensure_ascii=False)}\nMetas ativas: {json.dumps(context.get('goals', []), ensure_ascii=False)}"
        
        parts = [{"text": message}]
        if image_base64:
            parts.append({
                "inline_data": {
                    "mime_type": "image/jpeg",
                    "data": image_base64
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

    def _local_heuristic_agent(self, message: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Simulador de respostas e extração de intenção caso nenhuma chave esteja configurada."""
        msg_lower = message.lower()
        extracted_memories = []
        goals_identified = []
        should_app = False
        app_spec = None

        if "acordo" in msg_lower or "dormir" in msg_lower or "sono" in msg_lower:
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
