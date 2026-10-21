"use client";

import React from "react";
import { useDeckStore } from "@/store/useDeckStore";
import { MOODS } from "@/lib/moods";
import { SlideLayoutType } from "@/types/presentation";
import { 
  Sparkles, 
  Download, 
  Undo2, 
  Redo2, 
  Play, 
  Palette, 
  LayoutGrid, 
  Plus
} from "lucide-react";
import { exportToPPTX } from "@/lib/export/pptxExport";

const LAYOUT_OPTIONS: { label: string; value: SlideLayoutType }[] = [
  { label: "Capa de Impacto", value: "hero_title" },
  { label: "Métricas / KPIs", value: "metrics_kpi" },
  { label: "3 Colunas", value: "columns_3" },
  { label: "Problema vs. Solução", value: "problem_solution" },
  { label: "Citação / Frase", value: "quote_testimonial" },
  { label: "Linha do Tempo", value: "timeline_horizontal" },
  { label: "Destaque Visual", value: "feature_split" },
];

interface EditorHeaderProps {
  onOpenAIModal: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({ onOpenAIModal }) => {
  const { 
    deck, 
    activeSlideIndex, 
    setMood, 
    changeSlideLayout, 
    undo, 
    redo,
    history,
    future,
    addSlide
  } = useDeckStore();

  const activeSlide = deck.slides[activeSlideIndex];

  const handleExportPPTX = async () => {
    try {
      await exportToPPTX(deck);
    } catch (err) {
      console.error("Falha ao exportar PPTX:", err);
      alert("Erro ao exportar apresentação para PPTX");
    }
  };

  return (
    <header className="h-16 border-b border-white/10 bg-black/60 backdrop-blur-md px-6 flex items-center justify-between z-30 select-none">
      {/* Left: Branding & Deck Name */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#76B900] to-emerald-400 flex items-center justify-center font-black text-black text-sm shadow-lg shadow-[#76B900]/20">
            PAI
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-wide">OrigamiDeck AI</span>
            <span className="text-[10px] text-zinc-400 block -mt-0.5">Powered by NVIDIA NIM</span>
          </div>
        </div>

        <div className="h-5 w-px bg-white/10" />

        <input
          type="text"
          value={deck.title}
          onChange={(e) => useDeckStore.getState().deck.title = e.target.value}
          className="bg-transparent text-sm font-medium text-zinc-200 hover:bg-white/5 focus:bg-white/10 px-2 py-1 rounded transition-colors border border-transparent focus:border-white/20 outline-none w-72"
        />
      </div>

      {/* Center: Controls (Undo, Redo, Layout, Moods) */}
      <div className="flex items-center space-x-3">
        {/* Undo/Redo */}
        <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5">
          <button
            onClick={undo}
            disabled={history.length === 0}
            className="p-1.5 rounded hover:bg-white/10 text-zinc-300 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            title="Desfazer (Undo)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            className="p-1.5 rounded hover:bg-white/10 text-zinc-300 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            title="Refazer (Redo)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Change Slide Layout Selector */}
        {activeSlide && (
          <div className="flex items-center space-x-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-zinc-200">
            <LayoutGrid className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={activeSlide.layout}
              onChange={(e) => changeSlideLayout(activeSlideIndex, e.target.value as SlideLayoutType)}
              className="bg-transparent text-xs text-zinc-200 outline-none cursor-pointer pr-1"
            >
              {LAYOUT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-zinc-900 text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Mood Theme Selector */}
        <div className="flex items-center space-x-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-zinc-200">
          <Palette className="w-3.5 h-3.5 text-[#76B900]" />
          <select
            value={deck.moodId}
            onChange={(e) => setMood(e.target.value)}
            className="bg-transparent text-xs text-zinc-200 outline-none cursor-pointer pr-1"
          >
            {MOODS.map((m) => (
              <option key={m.id} value={m.id} className="bg-zinc-900 text-white">
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: AI Generate, Export PPTX */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenAIModal}
          className="flex items-center space-x-2 bg-gradient-to-r from-[#76B900] to-emerald-500 hover:from-[#659e00] hover:to-emerald-600 text-black font-semibold text-xs px-3.5 py-2 rounded-lg shadow-lg shadow-[#76B900]/25 transition-all active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 fill-black" />
          <span>Gerar com IA</span>
        </button>

        <button
          onClick={handleExportPPTX}
          className="flex items-center space-x-2 bg-white/10 hover:bg-white/15 text-white font-medium text-xs px-3 py-2 rounded-lg border border-white/10 transition-all active:scale-95"
          title="Baixar arquivo nativo PowerPoint (.pptx)"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar PPTX</span>
        </button>
      </div>
    </header>
  );
};
