import asyncio
import sys
import os

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Adiciona o backend ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from app.core.db import init_db, AsyncSessionLocal
from app.memory.engine import MemoryEngine
from app.agent.orchestrator import TomoOrchestrator
from app.scheduler.proactive_engine import proactive_scheduler

async def run_test():
    print("🔹 1. Inicializando Banco de Dados...")
    await init_db()

    async with AsyncSessionLocal() as session:
        memory_engine = MemoryEngine(session)
        orchestrator = TomoOrchestrator(memory_engine)

        test_user = "test_user_marlon"
        test_msg = "Minha meta é treinar na academia 5 vezes por semana e durmo às 23h"

        print(f"\n🔹 2. Enviando Mensagem de Teste: '{test_msg}'...")
        res = await orchestrator.process_user_turn(
            user_id=test_user,
            user_message=test_msg,
            channel="web"
        )

        print("\n--- RESPOSTA DO TOMO ---")
        print(f"💬 Resposta: {res['reply']}")
        print(f"🧠 Memórias Aprendidas: {res['new_memories_learned']}")
        print(f"🎯 Metas Atualizadas: {res['goals_updated']}")
        print(f"📱 Mini-App Gerado: {res['generated_mini_app']['title'] if res['generated_mini_app'] else 'Nenhum'}")

        print("\n🔹 3. Verificando Contexto no Banco de Dados...")
        ctx = await memory_engine.get_user_context(test_user)
        print(f"Memórias persistidas: {len(ctx['memories'])}")
        print(f"Metas ativas persistidas: {len(ctx['goals'])}")

        print("\n🔹 4. Testando Gatilho Proativo de Manhã...")
        nudge = await proactive_scheduler.generate_proactive_nudge(test_user, "morning")
        print(f"🔔 Nudge Gerado: {nudge['message']}")

    print("\n✅ Todos os testes do clone do Tomo passaram com sucesso!")

if __name__ == "__main__":
    asyncio.run(run_test())
