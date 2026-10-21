# Open-source Tome (Origami Deck AI)

Clone open-source completo do **Tome App** (`tome.app`) para geração e edição de apresentações inteligentes orientadas por IA (Next.js 15, React 19, Tailwind CSS, Framer Motion e Vercel AI SDK).

---

## 🚀 Funcionalidades

- **Geração de Slides com IA:** Criação automatizada de decks com layouts contextuais inteligentes via LLMs (suporte a modelos OpenAI / NVIDIA NIM).
- **Arquitetura de Layouts Origami:**
  - `HeroTitleLayout` (Slide de Abertura / Capa)
  - `ProblemSolutionLayout` (Problema vs. Solução)
  - `FeatureSplitLayout` (Destaque em duas colunas)
  - `MetricsKpiLayout` (KPIs e Métricas de impacto)
  - `QuoteLayout` (Depoimentos e Citações)
  - `TimelineLayout` (Linha do tempo e Roadmap)
  - `Columns3Layout` (Grades e 3 pilares)
- **Editor Interativo em Tempo Real:** Edição inline de títulos, textos, métricas e temas.
- **Exportação para PowerPoint (`.pptx`):** Download direto do deck pronto com formatação e layouts preservados.
- **Estilos e Temas Dinâmicos:** Suporte a diferentes paletas e moods visuais.
- **Módulo Companion Proativo:** Subprojeto em `tomo_clone` com agente proativo e canais de automação.

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** Next.js 15 (App Router)
- **UI & Animações:** React 19, Tailwind CSS, Framer Motion, Lucide Icons
- **Gerenciamento de Estado:** Zustand
- **IA & Streaming:** Vercel AI SDK (`ai`), `@ai-sdk/openai`
- **Exportação:** `pptxgenjs`

---

## 🏁 Como Rodar o Projeto

### 1. Clonar o Repositório
```bash
git clone https://github.com/marlonferreira1800-hue/Open-source-Tome.git
cd Open-source-Tome
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Copie o arquivo de exemplo e insira suas credenciais:
```bash
cp .env.example .env.local
```

Adicione sua chave de API (ex: NVIDIA NIM ou OpenAI):
```env
NVIDIA_API_KEY=nvapi-your-key-here
```

### 4. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver a aplicação em execução.

---

## 📄 Licença
Distribuído sob licença aberta para estudo e desenvolvimento comunitário.
