import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings
from app.core.db import init_db, get_db
from app.models.schemas import (
    MessageRequest, MessageResponse, MiniAppActionRequest,
    MiniAppModel, GoalModel, MemoryModel, UserModel
)
from app.memory.engine import MemoryEngine
from app.agent.orchestrator import TomoOrchestrator
from app.scheduler.proactive_engine import proactive_scheduler
from app.channels.telegram import telegram_channel
from app.channels.whatsapp import whatsapp_channel

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicializa o banco de dados
    await init_db()
    # Inicia o agendador proativo
    proactive_scheduler.start()
    yield
    # Desliga o agendador
    proactive_scheduler.stop()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Endpoints da API Principal ---

@app.post("/api/v1/chat", response_model=MessageResponse)
async def chat_endpoint(req: MessageRequest, db: AsyncSession = Depends(get_db)):
    memory_engine = MemoryEngine(db)
    orchestrator = TomoOrchestrator(memory_engine)
    
    result = await orchestrator.process_user_turn(
        user_id=req.user_id,
        user_message=req.message,
        channel=req.channel,
        image_base64=req.image_base64
    )
    return MessageResponse(**result)

@app.get("/api/v1/user/{user_id}/context")
async def get_user_context(user_id: str, db: AsyncSession = Depends(get_db)):
    memory_engine = MemoryEngine(db)
    await memory_engine.get_or_create_user(user_id)
    return await memory_engine.get_user_context(user_id)

@app.get("/api/v1/user/{user_id}/miniapps")
async def get_user_miniapps(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(MiniAppModel).where(MiniAppModel.user_id == user_id).order_by(MiniAppModel.created_at.desc())
    )
    apps = result.scalars().all()
    return [
        {
            "id": a.id,
            "title": a.title,
            "description": a.description,
            "app_type": a.app_type,
            "ui_schema": a.ui_schema,
            "app_state": a.app_state
        }
        for a in apps
    ]

@app.post("/api/v1/miniapps/{app_id}/action")
async def miniapp_action(app_id: str, action: MiniAppActionRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MiniAppModel).where(MiniAppModel.id == app_id))
    mini_app = result.scalars().first()
    if not mini_app:
        raise HTTPException(status_code=404, detail="Mini-App não encontrado")

    # Atualiza o estado da aplicação
    state = dict(mini_app.app_state or {})
    target = action.payload.get("target_component")
    
    if action.action_type == "increment_progress" and target in state:
        state[target]["current"] = state[target].get("current", 0) + 1
    elif action.action_type == "toggle_checklist":
        item_id = action.payload.get("item_id")
        check_key = target or "checklist_1"
        if check_key in state and item_id in state[check_key]:
            state[check_key][item_id] = not state[check_key][item_id]

    mini_app.app_state = state
    await db.commit()
    return {"status": "success", "updated_state": state}

@app.post("/api/v1/proactive/simulate")
async def simulate_proactive_nudge(req: dict):
    user_id = req.get("user_id", "default_user")
    trigger_type = req.get("trigger_type", "morning")
    nudge = await proactive_scheduler.generate_proactive_nudge(user_id, trigger_type)
    return nudge

# --- Webhooks de Canais ---

@app.post("/api/v1/channels/telegram/webhook")
async def telegram_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    payload = await request.json()
    parsed = telegram_channel.parse_webhook(payload)
    if parsed:
        memory_engine = MemoryEngine(db)
        orchestrator = TomoOrchestrator(memory_engine)
        res = await orchestrator.process_user_turn(
            user_id=parsed["user_id"],
            user_message=parsed["text"],
            channel="telegram"
        )
        await telegram_channel.send_message(parsed["chat_id"], res["reply"])
    return {"ok": True}

@app.post("/api/v1/channels/whatsapp/webhook")
async def whatsapp_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    payload = await request.json()
    parsed = whatsapp_channel.parse_webhook(payload)
    if parsed:
        memory_engine = MemoryEngine(db)
        orchestrator = TomoOrchestrator(memory_engine)
        res = await orchestrator.process_user_turn(
            user_id=parsed["user_id"],
            user_message=parsed["text"],
            channel="whatsapp"
        )
        await whatsapp_channel.send_message(parsed["phone"], res["reply"])
    return {"ok": True}

# --- Servir o Web Companion PWA ---
companion_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "web_companion"))
if os.path.exists(companion_dir):
    app.mount("/static", StaticFiles(directory=companion_dir), name="static")

    @app.get("/")
    async def serve_index():
        return FileResponse(os.path.join(companion_dir, "index.html"))
