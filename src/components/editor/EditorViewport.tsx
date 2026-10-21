"use client";

import React, { useRef, useState, useEffect } from "react";
import { useDeckStore } from "@/store/useDeckStore";
import { OrigamiSlide } from "../origami/OrigamiSlide";
import { ChevronLeft, ChevronRight, Edit3, Check } from "lucide-react";

export const EditorViewport: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);

  const { 
    deck, 
    activeSlideIndex, 
    setActiveSlideIndex,
    updateActiveSlideTitle,
    updateActiveSlideSubtitle,
    updateSlideElement
  } = useDeckStore();

  const activeSlide = deck.slides[activeSlideIndex];

  // Dynamic Scale Calculator (responsive fit to viewport)
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      
      // Target slide nominal size: 1920 x 1080
      const paddingX = 80;
      const paddingY = 80;
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
  }, []);

  // Keyboard navigation (Left/Right arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't intercept when user is typing in input
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
      className="flex-1 h-[calc(100vh-4rem)] bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden select-none"
    >
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }}
      />

      {/* Floating Quick Edit Bar for Active Slide */}
      <div className="absolute top-4 z-20 flex items-center space-x-3 bg-zinc-900/90 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md shadow-xl text-xs text-zinc-300">
        <button
          onClick={() => setIsEditingMetadata(!isEditingMetadata)}
          className="flex items-center space-x-1.5 hover:text-white transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5 text-[#76B900]" />
          <span>{isEditingMetadata ? "Fechar Edição" : "Editar Textos"}</span>
        </button>

        <span className="text-zinc-600">|</span>

        <span className="font-mono text-zinc-400">
          Slide {activeSlideIndex + 1} de {deck.slides.length}
        </span>
      </div>

      {/* Inline Metadata Quick Editor Dropdown */}
      {isEditingMetadata && (
        <div className="absolute top-16 z-30 w-full max-w-xl bg-zinc-900 border border-white/15 p-5 rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Edição Rápida do Slide</span>
            <button 
              onClick={() => setIsEditingMetadata(false)}
              className="text-xs text-[#76B900] flex items-center space-x-1 hover:underline"
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
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#76B900] outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Subtítulo / Descrição</label>
              <textarea
                value={activeSlide.subtitle || ""}
                onChange={(e) => updateActiveSlideSubtitle(e.target.value)}
                rows={2}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#76B900] outline-none transition-colors resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Central Canvas Viewport Wrapper */}
      <div
        className="relative flex items-center justify-center transition-all duration-300"
        style={{
          width: 1920 * scale,
          height: 1080 * scale,
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

      {/* Navigation Buttons (Left / Right) */}
      <button
        onClick={() => activeSlideIndex > 0 && setActiveSlideIndex(activeSlideIndex - 1)}
        disabled={activeSlideIndex === 0}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-white flex items-center justify-center shadow-xl disabled:opacity-20 disabled:hover:bg-zinc-900/80 transition-all active:scale-95 z-20"
        title="Slide Anterior (Seta Esquerda)"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => activeSlideIndex < deck.slides.length - 1 && setActiveSlideIndex(activeSlideIndex + 1)}
        disabled={activeSlideIndex === deck.slides.length - 1}
        className="absolute right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-white flex items-center justify-center shadow-xl disabled:opacity-20 disabled:hover:bg-zinc-900/80 transition-all active:scale-95 z-20"
        title="Próximo Slide (Seta Direita)"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </main>
  );
};
