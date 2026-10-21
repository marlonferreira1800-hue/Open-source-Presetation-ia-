# Tomo AI Clone — Personal Proactive AI Agent

Este projeto é um clone funcional de ponta a ponta da arquitetura do **Tomo AI** (`tomo.ai`).

## 🌟 O que está implementado

1. **Agente Proativo com Tom de Voz de Accountability Partner:**
   - Inicia interações, faz check-ins de rotina e cobra hábitos pendentes.
2. **Memória Contínua Hierárquica:**
   - Extrai automaticamente fatos, preferências e metas de cada mensagem.
   - Mantém um perfil persistente em banco SQLite assíncrono (preparado para PostgreSQL/pgvector).
3. **Mini-Apps Dinâmicos (Server-Driven UI):**
   - Cria componentes interativos gerados por IA sob demanda (rastreadores de progresso, checklists e botões de ação).
4. **Canais Integrados:**
   - **Web Companion / PWA:** Interface interativa completa com chat, inspetor de memória e simulador de gatilhos proativos.
   - **WhatsApp:** Webhooks integrados prontos para a Evolution API.
   - **Telegram:** Webhooks e envio via Telegram Bot API.
5. **Scheduler Proativo:**
   - APScheduler em background com regras anti-fadiga e gatilhos de manhã, noite e inatividade.

---

## 🚀 Como Executar

### 1. Iniciar o Servidor:
```bash
python tomo_clone/run.py
```

### 2. Acessar a Interface:
- **Web Companion (Chat + Mini-Apps + Memória):** Abra [http://localhost:8000](http://localhost:8000) no navegador.
- **Documentação Interativa (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## ⚙️ Variáveis de Ambiente (Opcional)
Renomeie ou crie um arquivo `.env` dentro de `tomo_clone/`:
- `GEMINI_API_KEY`: Para usar modelos Gemini (1.5 Flash). Sem chave, o sistema roda com o motor simulador heurístico integrado.
- `TELEGRAM_BOT_TOKEN`: Para conectar o bot do Telegram.
- `EVOLUTION_API_URL` & `EVOLUTION_API_KEY`: Para conectar com o WhatsApp.
