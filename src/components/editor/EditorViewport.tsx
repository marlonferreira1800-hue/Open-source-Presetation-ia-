"use client";

import React, { useRef, useState, useEffect } from "react";
import { useDeckStore } from "@/store/useDeckStore";
import { OrigamiSlide } from "../origami/OrigamiSlide";
import { 
  ChevronLeft, 
  ChevronRight, 
  Edit3, 
  Check, 
  Minus, 
  Plus, 
  Maximize2, 
  FileText, 
  Sparkles
} from "lucide-react";

export const EditorViewport: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [userZoom, setUserZoom] = useState<number | null>(null);
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);

  const { 
    deck, 
    activeSlideIndex, 
    setActiveSlideIndex,
    updateActiveSlideTitle,
    updateActiveSlideSubtitle,
    updateActiveSlideNotes,
    updateSlideElement,
    isNotesOpen,
    toggleNotes,
    toggleClipE
  } = useDeckStore();

  const activeSlide = deck.slides[activeSlideIndex];

  // Dynamic Scale Calculator (responsive fit to available area)
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      if (userZoom !== null) {
        setScale(userZoom);
        return;
      }

      const { clientWidth, clientHeight } = containerRef.current;
      const paddingX = 80;
      const paddingY = isNotesOpen ? 240 : 120;
      const availableW = clientWidth - paddingX;
      const availableH = clientHeight - paddingY;

      const scaleW = availableW / 1920;
      const scaleH = availableH / 1080;
      const calculatedScale = Math.min(scaleW, scaleH, 0.85);

      setScale(Math.max(calculatedScale, 0.25));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [userZoom, isNotesOpen]);

  // Keyboard navigation (ArrowLeft & ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === "ArrowLeft" && activeSlideIndex > 0) {
        setActiveSlideIndex(activeSlideIndex - 1);
      } else if (e.key === "ArrowRight" && activeSlideIndex < deck.slides.length - 1) {
        setActiveSlideIndex(activeSlideIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSlideIndex, deck.slides.length, setActiveSlideIndex]);

  if (!activeSlide) return null;

  return (
    <main 
      ref={containerRef}
      className="flex-1 h-[calc(100vh-4rem)] bg-[#080A0F] flex flex-col items-center justify-center relative overflow-hidden select-none"
    >
      {/* Background Dot Grid */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px"
        }}
      />

      {/* Floating Quick Action Bar (Top Center) */}
      <div className="absolute top-4 z-20 flex items-center space-x-2.5 bg-[#151821]/90 border border-[#232733] px-3.5 py-1.5 rounded-xl backdrop-blur-md shadow-xl text-xs text-zinc-300">
        <button
          onClick={() => setIsEditingMetadata(!isEditingMetadata)}
          className="flex items-center space-x-1.5 hover:text-white transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5 text-blue-400" />
          <span>{isEditingMetadata ? "Fechar Textos" : "Editar Textos"}</span>
        </button>

        <span className="text-zinc-600">|</span>

        <button
          onClick={toggleClipE}
          className="flex items-center space-x-1.5 text-blue-400 hover:text-blue-300 font-medium transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Editar com Clip-E</span>
        </button>
      </div>

      {/* Inline Metadata Quick Editor Panel */}
      {isEditingMetadata && (
        <div className="absolute top-14 z-30 w-full max-w-xl bg-[#151821] border border-[#232733] p-5 rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Edição Rápida do Slide</span>
            <button 
              onClick={() => setIsEditingMetadata(false)}
              className="text-xs text-blue-400 flex items-center space-x-1 hover:underline font-semibold"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Concluir</span>
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Título do Slide</label>
              <input
                type="text"
                value={activeSlide.title}
                onChange={(e) => updateActiveSlideTitle(e.target.value)}
                className="w-full bg-[#0C0E14] border border-[#232733] rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Subtítulo / Descrição</label>
              <textarea
                value={activeSlide.subtitle || ""}
                onChange={(e) => updateActiveSlideSubtitle(e.target.value)}
                rows={2}
                className="w-full bg-[#0C0E14] border border-[#232733] rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none transition-colors resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Slide Canvas */}
      <div
        className="relative flex items-center justify-center transition-all duration-300"
        style={{
          width: 1920 * scale,
          height: 1080 * scale,
          marginBottom: isNotesOpen ? "140px" : "0px"
        }}
      >
        <OrigamiSlide
          slide={activeSlide}
          slideIndex={activeSlideIndex}
          moodId={deck.moodId}
          scale={scale}
          isEditable={true}
          onUpdateElement={(elId, content, label) => 
            updateSlideElement(activeSlideIndex, elId, content, label)
          }
        />
      </div>

      {/* Navigation Arrows (Left/Right) */}
      <button
        onClick={() => activeSlideIndex > 0 && setActiveSlideIndex(activeSlideIndex - 1)}
        disabled={activeSlideIndex === 0}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#151821]/80 hover:bg-[#1E2330] border border-[#232733] text-white flex items-center justify-center shadow-xl disabled:opacity-20 disabled:hover:bg-[#151821]/80 transition-all active:scale-95 z-20"
        title="Slide Anterior (←)"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => activeSlideIndex < deck.slides.length - 1 && setActiveSlideIndex(activeSlideIndex + 1)}
        disabled={activeSlideIndex === deck.slides.length - 1}
        className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#151821]/80 hover:bg-[#1E2330] border border-[#232733] text-white flex items-center justify-center shadow-xl disabled:opacity-20 disabled:hover:bg-[#151821]/80 transition-all active:scale-95 z-20"
        title="Próximo Slide (→)"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Speaker Notes Drawer (Slides up from bottom) */}
      {isNotesOpen && (
        <div className="absolute bottom-16 left-0 right-0 h-36 bg-[#12151D] border-t border-[#232733] p-4 z-20 animate-in slide-in-from-bottom-6 duration-200 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Notas do Apresentador (Slide 0{activeSlideIndex + 1})</span>
            </span>
            <button
              onClick={toggleNotes}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Fechar
            </button>
          </div>

          <textarea
            value={activeSlide.speakerNotes || ""}
            onChange={(e) => updateActiveSlideNotes(e.target.value)}
            placeholder="Digite anotações e roteiro para o apresentador..."
            className="flex-1 w-full bg-[#0C0E14] border border-[#232733] rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:border-blue-500 outline-none resize-none"
          />
        </div>
      )}

      {/* Floating Bottom Control Dock (Presentations.ai Signature Bar) */}
      <div className="absolute bottom-4 z-20 flex items-center space-x-4 bg-[#12151D]/90 border border-[#232733] px-4 py-1.5 rounded-full backdrop-blur-md shadow-2xl text-xs text-zinc-300">
        {/* Slide Counter */}
        <div className="flex items-center space-x-1.5 font-mono">
          <span className="font-bold text-white">0{activeSlideIndex + 1}</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400">0{deck.slides.length}</span>
        </div>

        <div className="h-4 w-px bg-[#232733]" />

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setUserZoom(Math.max((userZoom ?? scale) - 0.1, 0.25))}
            className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white"
            title="Reduzir Zoom"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <span className="font-mono text-[11px] w-12 text-center text-zinc-300">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={() => setUserZoom(Math.min((userZoom ?? scale) + 0.1, 1.2))}
            className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white"
            title="Aumentar Zoom"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setUserZoom(null)}
            className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white text-[11px] font-medium px-1.5"
            title="Ajustar à tela automaticamente"
          >
            Fit
          </button>
        </div>

        <div className="h-4 w-px bg-[#232733]" />

        {/* Notes Toggle */}
        <button
          onClick={toggleNotes}
          className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
            isNotesOpen ? "bg-blue-600/20 text-blue-400" : "hover:bg-white/10 text-zinc-400 hover:text-white"
          }`}
          title="Alternar anotações do slide"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Notas</span>
        </button>
      </div>
    </main>
  );
};
