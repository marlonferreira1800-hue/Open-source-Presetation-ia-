# Open-Source Presentations.ai (OrigamiDeck AI) 🚀

Clone open-source de alta fidelidade do **Presentations.ai** (`app.presentations.ai`), a plataforma líder de criação e edição inteligente de apresentações orientada por IA, alimentada pela engine de layout proprietária **Origami** e inferência acelerada via **NVIDIA NIM** (`meta/llama-3.3-70b-instruct`).

Construído com **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, **Zustand**, **Vercel AI SDK** e **PptxGenJS**.

---

## ✨ Principais Funcionalidades

### 1. 🤖 Orquestrador de IA & Clip-E Copilot
- **Idea-to-Deck Generator:** Criação de apresentações completas com base em um briefing ou prompt em segundos.
- **Clip-E AI Copilot:** Assistente lateral conversacional conectado ao slide ativo:
  - *⚡ Encurtar Textos:* Condensa textos longos para máxima retenção e impacto.
  * *📊 Converter para KPIs:* Transforma dados em 3 cards numéricos de destaque com métricas de tendência.
  * *👔 Tom Mais Executivo:* Reformula o vocabulário para o padrão C-Level.
  * *Chat Livre:* Solicite qualquer alteração em linguagem natural.
- **Inferência NVIDIA NIM:** Conectado à API oficial (`https://integrate.api.nvidia.com/v1`) com fallback inteligente para testes locais imediatos.

### 2. 📐 Engine de Layout Adaptativo Origami
Diferente de ferramentas que usam coordenadas absolutas frágeis, o Origami calcula layouts responsivos proporcionais ($1920 \times 1080$) baseados em semântica:
- **`HeroTitleLayout`:** Capa de abertura de alto impacto com metadados e autoria.
- **`MetricsKpiLayout`:** Cards de indicadores com deltas percentuais (`+380%`, `-72%`).
- **`Columns3Layout`:** Três pilares conceituais com ícones e descrições.
- **`ProblemSolutionLayout`:** Comparativo lado a lado (O Problema vs. A Solução).
- **`QuoteLayout`:** Citações marcantes com avatar e autor.
- **`TimelineLayout`:** Roteiro sequencial em etapas com marcadores numerados.
- **`FeatureSplitLayout`:** Bloco de destaque visual com lista de capacidades técnicas.

### 3. 🎨 Sistema de Design e Temas (*Moods*)
Injeção dinâmica de CSS Custom Properties (`--mood-bg`, `--mood-primary`, etc.) que alteram a estética do deck inteiro com 1 clique:
- **NVIDIA Cyber Green** (Dark mode com verde neon característico)
- **Corporate Midnight** (Azul escuro institucional executivo)
- **Minimalist Clean** (Modo claro sofisticado com serifa clássica)
- **Sunset Warmth** (Tons vibrantes em terracota e âmbar)
- **Fintech Blue** (Estilo financeiro tecnológico)

### 4. 🖥️ Interface Fiel ao Presentations.ai
- **TopBar Executiva:** Título editável com badge de auto-save, seletor de layout dinâmico e menu de exportação.
- **Storyboard Lateral:** Miniaturas dos slides em tempo real com ações de duplicar, reordenar e excluir.
- **Dock Flutuante:** Controle de zoom (`-`, `%`, `+`, `Fit`), contador de slides e gaveta de **Notas do Apresentador**.
- **Modo Apresentação (Fullscreen):** Modo cinema com navegação fluida por teclado (`Espaço`, setas e `Esc`).

### 5. 📄 Exportação Nativa para PowerPoint (.pptx)
- Conversão direta do Slide AST para objetos vetoriais nativos do OpenXML via **PptxGenJS**:
  - Títulos, subtítulos e caixas de texto 100% editáveis no Microsoft PowerPoint e Google Slides.
  - Suporte adicional para exportação em **PDF Vetorial**.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router, Server Components) |
| **Linguagem & UI** | React 19, TypeScript, Tailwind CSS, Lucide Icons |
| **State Management** | Zustand com histórico atômico de Undo/Redo |
| **Motor de IA** | Vercel AI SDK (`ai`), NVIDIA NIM API (`meta/llama-3.3-70b-instruct`) |
| **Exportação PPTX** | PptxGenJS (OpenXML nativo) |

---

## 🚀 Como Executar

### 1. Clonar o Repositório
```bash
git clone https://github.com/marlonferreira1800-hue/Open-source-Presetation-ia-.git
cd Open-source-Presetation-ia-
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente (Opcional)
Crie um arquivo `.env.local` na raiz:
```env
# Obtenha sua chave gratuita em https://build.nvidia.com/
NVIDIA_API_KEY=nvapi-sua-chave-aqui
```
*(Nota: O app possui um modo sintético demonstrativo integrado que funciona perfeitamente mesmo sem a chave da API).*

### 4. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 📜 Licença
Distribuído sob a licença MIT. Consulte `LICENSE` para mais detalhes.
