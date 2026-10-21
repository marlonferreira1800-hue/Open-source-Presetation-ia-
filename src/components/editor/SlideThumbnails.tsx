"use client";

import React, { useState } from "react";
import { useDeckStore } from "@/store/useDeckStore";
import { OrigamiSlide } from "../origami/OrigamiSlide";
import { SlideLayoutType } from "@/types/presentation";
import { 
  Plus, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Layout, 
  ChevronRight
} from "lucide-react";

const TEMPLATES: { label: string; value: SlideLayoutType; desc: string }[] = [
  { label: "Capa de Impacto", value: "hero_title", desc: "Abertura com título e autor" },
  { label: "Métricas / KPIs", value: "metrics_kpi", desc: "3 indicadores numéricos" },
  { label: "3 Colunas", value: "columns_3", desc: "Pilares ou itens lado a lado" },
  { label: "Problema vs. Solução", value: "problem_solution", desc: "Comparativo antes e depois" },
  { label: "Citação", value: "quote_testimonial", desc: "Frase de impacto destacada" },
  { label: "Linha do Tempo", value: "timeline_horizontal", desc: "Etapas e roadmap" },
  { label: "Destaque Visual", value: "feature_split", desc: "Imagem/box com especificações" },
];

export const SlideThumbnails: React.FC = () => {
  const { 
    deck, 
    activeSlideIndex, 
    setActiveSlideIndex, 
    addSlide, 
    duplicateSlide,
    deleteSlide,
    reorderSlides 
  } = useDeckStore();

  const [isPickerOpen, setIsPickerOpen] = useState(false);

  return (
    <aside className="w-64 border-r border-[#232733] bg-[#0C0E14] flex flex-col h-[calc(100vh-4rem)] z-20 select-none">
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-[#232733] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Slides</span>
          <span className="text-[10px] bg-white/10 text-zinc-300 font-mono px-2 py-0.5 rounded-full">
            {deck.slides.length}
          </span>
        </div>

        {/* Add Slide Quick Button */}
        <div className="relative">
          <button
            onClick={() => setIsPickerOpen(!isPickerOpen)}
            className="flex items-center space-x-1 text-xs bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-md transition-all active:scale-95"
            title="Escolher layout e adicionar slide"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar</span>
          </button>

          {/* Template Picker Popup */}
          {isPickerOpen && (
            <div className="absolute left-0 top-full mt-2 w-64 bg-[#151821] border border-[#232733] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in duration-150">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 py-1 block">
                Escolha o Layout:
              </span>
              <div className="space-y-1 mt-1">
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.value}
                    onClick={() => {
                      addSlide(tpl.value);
                      setIsPickerOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-blue-400">
                        {tpl.label}
                      </div>
                      <div className="text-[10px] text-zinc-400">{tpl.desc}</div>
                    </div>
                    <ChevronRight className="w-3 h-3 text-zinc-500 group-hover:text-white" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Thumbnails Scrollable List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {deck.slides.map((slide, index) => {
          const isActive = activeSlideIndex === index;

          return (
            <div
              key={slide.id || index}
              onClick={() => setActiveSlideIndex(index)}
              className={`group relative rounded-xl p-2 cursor-pointer transition-all border ${
                isActive
                  ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/15"
                  : "border-[#232733] bg-[#12151D] hover:border-zinc-700 hover:bg-[#161A24]"
              }`}
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className={`text-[11px] font-mono font-bold ${isActive ? "text-blue-400" : "text-zinc-500"}`}>
                  0{index + 1}
                </span>
                <span className="text-[10px] text-zinc-400 font-medium truncate max-w-[110px]">
                  {slide.title}
                </span>

                {/* Slide Quick Actions (Visible on Hover) */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateSlide(index);
                    }}
                    className="p-1 hover:text-white text-zinc-400"
                    title="Duplicar slide"
                  >
                    <Copy className="w-3 h-3" />
                  </button>

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
                      title="Excluir slide"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Scaled Mini Slide Preview */}
              <div 
                className="w-full rounded-lg overflow-hidden bg-black/60 relative pointer-events-none border border-white/5"
                style={{ width: "100%", height: "115px" }}
              >
                <div
                  style={{
                    transform: `scale(${115 / 1080})`,
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
