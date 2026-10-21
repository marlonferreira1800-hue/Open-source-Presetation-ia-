import { create } from "zustand";
import { PresentationDoc, SlideNode, SlideLayoutType } from "@/types/presentation";

const INITIAL_DECK: PresentationDoc = {
  id: "deck_demo_1",
  title: "A Revolução da IA Corporativa",
  description: "Como modelos avançados estão redefinindo automação e produtividade",
  moodId: "executive-fintech",
  aspectRatio: "16:9",
  slides: [
    {
      id: "slide_1",
      layout: "hero_title",
      title: "A Próxima Fronteira da Inteligência Artificial",
      subtitle: "Arquiteturas soberanas, inferência em tempo real e orquestração autônoma de sistemas empresariais.",
      accentBadge: "Visão Executiva 2026",
      speakerNotes: "Boas-vindas a todos. Abrir reforçando que a IA passou da fase de experimentação para a infraestrutura central dos negócios.",
      elements: [
        {
          id: "el_author",
          type: "label",
          label: "Apresentado por",
          content: "Marlon Ferreira • Decifrando Dados"
        }
      ]
    },
    {
      id: "slide_2",
      layout: "metrics_kpi",
      title: "Impacto Mensurável de Performance",
      subtitle: "Resultados empíricos após a transição para inferência acelerada em escala",
      accentBadge: "Métricas Chave",
      speakerNotes: "Destacar a redução de 72% de latência com a adoção de GPUs locais e modelos destilados.",
      elements: [
        {
          id: "m_1",
          type: "metric",
          label: "Throughput de Tokens",
          content: "4.8x",
          meta: { trend: "+380%", trendPositive: true }
        },
        {
          id: "m_2",
          type: "metric",
          label: "Latência p99",
          content: "18ms",
          meta: { trend: "-72%", trendPositive: true }
        },
        {
          id: "m_3",
          type: "metric",
          label: "Custo por Milhão de Tokens",
          content: "$0.14",
          meta: { trend: "-65%", trendPositive: true }
        }
      ]
    },
    {
      id: "slide_3",
      layout: "columns_3",
      title: "Os 3 Pilares da Arquitetura Moderna",
      subtitle: "Camadas desacopladas projetadas para escalabilidade e resiliência contínua",
      accentBadge: "Fundamentos",
      speakerNotes: "Explicar como o desacoplamento de AST e layout gráfico permite gerar decks 10x mais rápido.",
      elements: [
        {
          id: "col_1",
          type: "text",
          label: "1. Semantic AST & Layout",
          content: "A IA gera especificações semânticas em árvore JSON, delegando o posicionamento proporcional para a engine gráfica Origami."
        },
        {
          id: "col_2",
          type: "text",
          label: "2. Streaming & Tool Calling",
          content: "Skeletons progressivos renderizam imediatamente, reduzindo o tempo percebido de resposta para menos de 400ms."
        },
        {
          id: "col_3",
          type: "text",
          label: "3. Exportação Nativa OpenXML",
          content: "Arquivos .pptx são montados declarativamente no cliente, gerando apresentações 100% editáveis no PowerPoint."
        }
      ]
    },
    {
      id: "slide_4",
      layout: "problem_solution",
      title: "Desafio vs. Solução Estrutural",
      subtitle: "Por que abordagens tradicionais falham ao gerar apresentações por IA",
      accentBadge: "Paradigma",
      speakerNotes: "Enfatizar a fragilidade de caixas de texto com posições fixas absolutas.",
      elements: [
        {
          id: "prob_1",
          type: "text",
          label: "O Problema: Coordenadas Absolutas",
          content: "Modelos de linguagem não entendem dimensões de pixels de forma confiável, resultando em textos sobrepostos e caixas quebradas."
        },
        {
          id: "sol_1",
          type: "text",
          label: "A Solução: Layouts Adaptativos (Origami)",
          content: "Layouts inteligentes baseados em CSS Grid e Container Queries que se reajustam automaticamente à densidade do conteúdo."
        }
      ]
    },
    {
      id: "slide_5",
      layout: "quote_testimonial",
      title: "Convicção Estratégica",
      subtitle: "A premissa central que orienta a nova geração de interfaces inteligentes",
      accentBadge: "Citação",
      speakerNotes: "Fechar com impacto e convidar a audiência para a sessão de perguntas e respostas.",
      elements: [
        {
          id: "q_text",
          type: "text",
          content: "O futuro do software não é desenhar layouts manualmente pixel a pixel, mas orquestrar intenções semânticas que se auto-organizam."
        },
        {
          id: "q_author",
          type: "label",
          label: "Autor",
          content: "Liderança de Engenharia • Decifrando Dados"
        }
      ]
    }
  ]
};

interface DeckStore {
  deck: PresentationDoc;
  activeSlideIndex: number;
  isGenerating: boolean;
  history: PresentationDoc[];
  future: PresentationDoc[];

  // Panels & Views
  isClipEOpen: boolean;
  isThemesOpen: boolean;
  isPresentMode: boolean;
  isNotesOpen: boolean;
  zoomLevel: number; // 0.25 to 1.5, default null (fit)

  // Actions
  setActiveSlideIndex: (index: number) => void;
  setMood: (moodId: string) => void;
  updateActiveSlideTitle: (title: string) => void;
  updateActiveSlideSubtitle: (subtitle: string) => void;
  updateActiveSlideNotes: (notes: string) => void;
  updateSlideElement: (slideIndex: number, elementId: string, content: string, label?: string) => void;
  updateSlideAt: (index: number, newSlide: SlideNode) => void;
  changeSlideLayout: (slideIndex: number, newLayout: SlideLayoutType) => void;
  addSlide: (layout?: SlideLayoutType) => void;
  duplicateSlide: (slideIndex: number) => void;
  deleteSlide: (slideIndex: number) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  setDeck: (deck: PresentationDoc) => void;
  setIsGenerating: (generating: boolean) => void;
  toggleClipE: () => void;
  toggleThemes: () => void;
  setIsPresentMode: (val: boolean) => void;
  toggleNotes: () => void;
  setZoomLevel: (zoom: number) => void;
  undo: () => void;
  redo: () => void;
}

export const useDeckStore = create<DeckStore>((set, get) => ({
  deck: INITIAL_DECK,
  activeSlideIndex: 0,
  isGenerating: false,
  history: [],
  future: [],

  // Panels
  isClipEOpen: false,
  isThemesOpen: false,
  isPresentMode: false,
  isNotesOpen: false,
  zoomLevel: 0, // 0 = Auto-fit

  setActiveSlideIndex: (index) => set({ activeSlideIndex: index }),

  toggleClipE: () => set((state) => ({ isClipEOpen: !state.isClipEOpen, isThemesOpen: false })),
  toggleThemes: () => set((state) => ({ isThemesOpen: !state.isThemesOpen, isClipEOpen: false })),
  setIsPresentMode: (isPresentMode) => set({ isPresentMode }),
  toggleNotes: () => set((state) => ({ isNotesOpen: !state.isNotesOpen })),
  setZoomLevel: (zoomLevel) => set({ zoomLevel }),

  setMood: (moodId) => {
    const { deck, history } = get();
    set({
      history: [...history, deck],
      future: [],
      deck: { ...deck, moodId }
    });
  },

  updateActiveSlideTitle: (title) => {
    const { deck, activeSlideIndex } = get();
    const slides = [...deck.slides];
    if (!slides[activeSlideIndex]) return;
    slides[activeSlideIndex] = { ...slides[activeSlideIndex], title };
    set({ deck: { ...deck, slides } });
  },

  updateActiveSlideSubtitle: (subtitle) => {
    const { deck, activeSlideIndex } = get();
    const slides = [...deck.slides];
    if (!slides[activeSlideIndex]) return;
    slides[activeSlideIndex] = { ...slides[activeSlideIndex], subtitle };
    set({ deck: { ...deck, slides } });
  },

  updateActiveSlideNotes: (speakerNotes) => {
    const { deck, activeSlideIndex } = get();
    const slides = [...deck.slides];
    if (!slides[activeSlideIndex]) return;
    slides[activeSlideIndex] = { ...slides[activeSlideIndex], speakerNotes };
    set({ deck: { ...deck, slides } });
  },

  updateSlideElement: (slideIndex, elementId, content, label) => {
    const { deck } = get();
    const slides = [...deck.slides];
    const targetSlide = slides[slideIndex];
    if (!targetSlide) return;

    const elements = targetSlide.elements.map((el) => {
      if (el.id === elementId) {
        return { ...el, content, ...(label !== undefined ? { label } : {}) };
      }
      return el;
    });

    slides[slideIndex] = { ...targetSlide, elements };
    set({ deck: { ...deck, slides } });
  },

  updateSlideAt: (index, newSlide) => {
    const { deck, history } = get();
    const slides = [...deck.slides];
    slides[index] = newSlide;
    set({
      history: [...history, deck],
      future: [],
      deck: { ...deck, slides }
    });
  },

  changeSlideLayout: (slideIndex, newLayout) => {
    const { deck, history } = get();
    const slides = [...deck.slides];
    const target = slides[slideIndex];
    if (!target) return;

    slides[slideIndex] = {
      ...target,
      layout: newLayout
    };

    set({
      history: [...history, deck],
      future: [],
      deck: { ...deck, slides }
    });
  },

  addSlide: (layout = "columns_3") => {
    const { deck, activeSlideIndex, history } = get();
    const newSlideId = "slide_" + Math.random().toString(36).substring(2, 9);
    const newSlide: SlideNode = {
      id: newSlideId,
      layout,
      title: "Novo Slide Criado",
      subtitle: "Personalize este conteúdo ou peça para o Clip-E reescrever com IA",
      accentBadge: "Destaque",
      elements: [
        { id: "e1", type: "text", label: "Tópico Principal", content: "Conteúdo descritivo conciso e objetivo." },
        { id: "e2", type: "text", label: "Segundo Ponto", content: "Outro ponto chave relevante para a apresentação." },
        { id: "e3", type: "text", label: "Terceiro Ponto", content: "Conclusão ou próximo passo prático." }
      ]
    };

    const slides = [...deck.slides];
    slides.splice(activeSlideIndex + 1, 0, newSlide);

    set({
      history: [...history, deck],
      future: [],
      deck: { ...deck, slides },
      activeSlideIndex: activeSlideIndex + 1
    });
  },

  duplicateSlide: (slideIndex) => {
    const { deck, history } = get();
    const slideToCopy = deck.slides[slideIndex];
    if (!slideToCopy) return;

    const copiedSlide: SlideNode = {
      ...JSON.parse(JSON.stringify(slideToCopy)),
      id: "slide_" + Math.random().toString(36).substring(2, 9),
      title: slideToCopy.title + " (Cópia)"
    };

    const slides = [...deck.slides];
    slides.splice(slideIndex + 1, 0, copiedSlide);

    set({
      history: [...history, deck],
      future: [],
      deck: { ...deck, slides },
      activeSlideIndex: slideIndex + 1
    });
  },

  deleteSlide: (slideIndex) => {
    const { deck, activeSlideIndex, history } = get();
    if (deck.slides.length <= 1) return;

    const slides = deck.slides.filter((_, idx) => idx !== slideIndex);
    const newActiveIndex = Math.min(activeSlideIndex, slides.length - 1);

    set({
      history: [...history, deck],
      future: [],
      deck: { ...deck, slides },
      activeSlideIndex: newActiveIndex
    });
  },

  reorderSlides: (fromIndex, toIndex) => {
    const { deck, history } = get();
    const slides = [...deck.slides];
    const [moved] = slides.splice(fromIndex, 1);
    slides.splice(toIndex, 0, moved);

    set({
      history: [...history, deck],
      future: [],
      deck: { ...deck, slides },
      activeSlideIndex: toIndex
    });
  },

  setDeck: (newDeck) => {
    const { deck, history } = get();
    set({
      history: [...history, deck],
      future: [],
      deck: newDeck,
      activeSlideIndex: 0
    });
  },

  setIsGenerating: (isGenerating) => set({ isGenerating }),

  undo: () => {
    const { history, deck, future } = get();
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    set({
      deck: previous,
      history: newHistory,
      future: [deck, ...future]
    });
  },

  redo: () => {
    const { future, deck, history } = get();
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    set({
      deck: next,
      history: [...history, deck],
      future: newFuture
    });
  }
}));
