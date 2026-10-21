"use client";

import React from "react";
import { useDeckStore } from "@/store/useDeckStore";
import { OrigamiSlide } from "../origami/OrigamiSlide";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

export const SlideThumbnails: React.FC = () => {
  const { 
    deck, 
    activeSlideIndex, 
    setActiveSlideIndex, 
    addSlide, 
    deleteSlide,
    reorderSlides 
  } = useDeckStore();

  return (
    <aside className="w-64 border-r border-white/10 bg-black/40 backdrop-blur-md flex flex-col h-[calc(100vh-4rem)] z-20 select-none">
      {/* Top Header of Sidebar */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Slides</span>
          <span className="text-[10px] bg-white/10 text-zinc-300 font-mono px-2 py-0.5 rounded-full">
            {deck.slides.length}
          </span>
        </div>

        <button
          onClick={() => addSlide()}
          className="flex items-center space-x-1 text-xs bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-md transition-all active:scale-95 border border-white/10"
          title="Adicionar Novo Slide"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Novo</span>
        </button>
      </div>

      {/* Thumbnails Scrollable List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {deck.slides.map((slide, index) => {
          const isActive = activeSlideIndex === index;

          return (
            <div
              key={slide.id || index}
              onClick={() => setActiveSlideIndex(index)}
              className={`group relative rounded-xl p-2 cursor-pointer transition-all border ${
                isActive
                  ? "border-[#76B900] bg-[#76B900]/10 shadow-lg shadow-[#76B900]/10"
                  : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/[0.08]"
              }`}
            >
              {/* Slide Number Badge */}
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className={`text-[11px] font-mono font-bold ${isActive ? "text-[#76B900]" : "text-zinc-400"}`}>
                  0{index + 1}
                </span>
                <span className="text-[10px] text-zinc-400 font-medium truncate max-w-[120px]">
                  {slide.title}
                </span>

                {/* Quick Actions (Move & Delete) */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
                  {index > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        reorderSlides(index, index - 1);
                      }}
                      className="p-1 hover:text-white text-zinc-400"
                      title="Mover para cima"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                  )}
                  {index < deck.slides.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        reorderSlides(index, index + 1);
                      }}
                      className="p-1 hover:text-white text-zinc-400"
                      title="Mover para baixo"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  )}
                  {deck.slides.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSlide(index);
                      }}
                      className="p-1 hover:text-red-400 text-zinc-400"
                      title="Excluir Slide"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Scaled Mini Slide Preview */}
              <div 
                className="w-full aspect-video rounded-lg overflow-hidden bg-black/80 relative pointer-events-none"
                style={{ width: "100%", height: "120px" }}
              >
                <div
                  style={{
                    transform: `scale(${120 / 1080})`,
                    transformOrigin: "top left",
                    width: 1920,
                    height: 1080,
                  }}
                >
                  <OrigamiSlide
                    slide={slide}
                    slideIndex={index}
                    moodId={deck.moodId}
                    isEditable={false}
                    scale={1}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
