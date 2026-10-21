"use client";

import React, { useEffect, useState, useRef } from "react";
import { useDeckStore } from "@/store/useDeckStore";
import { OrigamiSlide } from "../origami/OrigamiSlide";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

export const PresentMode: React.FC = () => {
  const { isPresentMode, setIsPresentMode, deck, activeSlideIndex, setActiveSlideIndex } = useDeckStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8);

  const activeSlide = deck.slides[activeSlideIndex];

  // Auto calculate scale to fill screen precisely
  useEffect(() => {
    if (!isPresentMode) return;

    const handleResize = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const scaleW = clientWidth / 1920;
      const scaleH = clientHeight / 1080;
      setScale(Math.min(scaleW, scaleH));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isPresentMode]);

  // Keyboard navigation & Esc to exit
  useEffect(() => {
    if (!isPresentMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPresentMode(false);
      } else if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
        if (activeSlideIndex < deck.slides.length - 1) {
          setActiveSlideIndex(activeSlideIndex + 1);
        }
      } else if (e.key === "ArrowLeft" || e.key === "Backspace") {
        if (activeSlideIndex > 0) {
          setActiveSlideIndex(activeSlideIndex - 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPresentMode, activeSlideIndex, deck.slides.length, setActiveSlideIndex, setIsPresentMode]);

  if (!isPresentMode || !activeSlide) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden"
    >
      {/* Slide Canvas */}
      <div
        style={{
          width: 1920 * scale,
          height: 1080 * scale,
        }}
        className="relative flex items-center justify-center shadow-2xl"
      >
        <OrigamiSlide
          slide={activeSlide}
          slideIndex={activeSlideIndex}
          moodId={deck.moodId}
          scale={scale}
          isEditable={false}
        />
      </div>

      {/* Floating Hover Controls (Top Right) */}
      <div className="absolute top-6 right-6 flex items-center space-x-3 opacity-30 hover:opacity-100 transition-opacity z-50">
        <div className="bg-zinc-900/80 border border-white/10 px-3 py-1.5 rounded-full text-xs font-mono text-zinc-300 backdrop-blur-md">
          {activeSlideIndex + 1} / {deck.slides.length}
        </div>

        <button
          onClick={() => setIsPresentMode(false)}
          className="p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-white backdrop-blur-md transition-all"
          title="Sair do modo apresentação (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Arrows on Hover */}
      {activeSlideIndex > 0 && (
        <button
          onClick={() => setActiveSlideIndex(activeSlideIndex - 1)}
          className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-zinc-900/60 hover:bg-zinc-900 border border-white/10 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-50"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {activeSlideIndex < deck.slides.length - 1 && (
        <button
          onClick={() => setActiveSlideIndex(activeSlideIndex + 1)}
          className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-zinc-900/60 hover:bg-zinc-900 border border-white/10 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-50"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Progress Bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-50">
        <div 
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${((activeSlideIndex + 1) / deck.slides.length) * 100}%` }}
        />
      </div>
    </div>
  );
};
