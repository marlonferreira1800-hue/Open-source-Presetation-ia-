"use client";

import React, { useState } from "react";
import { useDeckStore } from "@/store/useDeckStore";
import { SlideLayoutType } from "@/types/presentation";
import { 
  Sparkles, 
  Download, 
  Undo2, 
  Redo2, 
  Play, 
  Palette, 
  LayoutGrid, 
  CloudCheck,
  Check,
  FileSpreadsheet,
  FileText,
  ChevronDown
} from "lucide-react";
import { exportToPPTX } from "@/lib/export/pptxExport";

const LAYOUT_OPTIONS: { label: string; value: SlideLayoutType }[] = [
  { label: "Capa de Impacto", value: "hero_title" },
  { label: "Métricas / KPIs", value: "metrics_kpi" },
  { label: "3 Colunas Estruturadas", value: "columns_3" },
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
    changeSlideLayout, 
    undo, 
    redo,
    history,
    future,
    toggleClipE,
    isClipEOpen,
    toggleThemes,
    isThemesOpen,
    setIsPresentMode
  } = useDeckStore();

  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const activeSlide = deck.slides[activeSlideIndex];

  const handleExportPPTX = async () => {
    try {
      setIsExportMenuOpen(false);
      await exportToPPTX(deck);
    } catch (err) {
      console.error("Falha ao exportar PPTX:", err);
      alert("Erro ao exportar apresentação para PPTX");
    }
  };

  const handleExportPDF = () => {
    setIsExportMenuOpen(false);
    window.print();
  };

  return (
    <header className="h-16 border-b border-[#232733] bg-[#0C0E14]/95 backdrop-blur-md px-5 flex items-center justify-between z-30 select-none">
      {/* Left: Presentations.ai Brand & Deck Title */}
      <div className="flex items-center space-x-4">
        {/* Logo */}
        <div className="flex items-center space-x-2.5 cursor-pointer">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0055ED] to-[#7C3AED] flex items-center justify-center font-black text-white text-xs shadow-lg shadow-blue-500/25">
            PAI
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="text-sm font-bold text-white tracking-tight">Presentations.ai</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 font-semibold px-1.5 py-0.2 rounded">PRO</span>
            </div>
            <span className="text-[10px] text-zinc-500">Origami Engine & NVIDIA NIM</span>
          </div>
        </div>

        <div className="h-5 w-px bg-[#232733]" />

        {/* Editable Title */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={deck.title}
            onChange={(e) => useDeckStore.getState().deck.title = e.target.value}
            className="bg-transparent text-sm font-semibold text-zinc-200 hover:bg-white/5 focus:bg-white/10 px-2 py-1 rounded-md transition-colors border border-transparent focus:border-white/20 outline-none w-64 truncate"
          />
          <div className="flex items-center space-x-1 text-[11px] text-zinc-500 font-medium" title="Salvo automaticamente">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-zinc-500 hidden sm:inline">Salvo</span>
          </div>
        </div>
      </div>

      {/* Center: Slide Layout Selector & Undo/Redo */}
      <div className="flex items-center space-x-3">
        {/* Undo/Redo */}
        <div className="flex items-center bg-[#151821] border border-[#232733] rounded-lg p-0.5">
          <button
            onClick={undo}
            disabled={history.length === 0}
            className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent transition-all"
            title="Desfazer (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent transition-all"
            title="Refazer (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Layout Switcher */}
        {activeSlide && (
          <div className="flex items-center space-x-1.5 bg-[#151821] border border-[#232733] rounded-lg px-2.5 py-1 text-xs text-zinc-200">
            <LayoutGrid className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={activeSlide.layout}
              onChange={(e) => changeSlideLayout(activeSlideIndex, e.target.value as SlideLayoutType)}
              className="bg-transparent text-xs text-zinc-200 outline-none cursor-pointer pr-1"
            >
              {LAYOUT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#151821] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Themes (Moods) Button */}
        <button
          onClick={toggleThemes}
          className={`flex items-center space-x-1.5 border rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            isThemesOpen
              ? "bg-blue-600/20 border-blue-500 text-blue-400"
              : "bg-[#151821] border-[#232733] text-zinc-300 hover:bg-[#1C202C] hover:text-white"
          }`}
        >
          <Palette className="w-3.5 h-3.5 text-pink-400" />
          <span>Temas</span>
        </button>
      </div>

      {/* Right: Clip-E AI Copilot, Export, Present */}
      <div className="flex items-center space-x-2.5">
        {/* Clip-E Trigger Button */}
        <button
          onClick={toggleClipE}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            isClipEOpen
              ? "bg-gradient-to-r from-blue-600 to-purple-600 border-blue-400 text-white shadow-lg shadow-blue-500/30"
              : "bg-blue-600/10 hover:bg-blue-600/20 border-blue-500/30 text-blue-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>Clip-E</span>
        </button>

        {/* Generate Deck with AI */}
        <button
          onClick={onOpenAIModal}
          className="flex items-center space-x-1.5 bg-[#151821] hover:bg-[#1C202C] border border-[#232733] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Novo com IA</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            className="flex items-center space-x-1.5 bg-[#151821] hover:bg-[#1C202C] border border-[#232733] text-zinc-200 hover:text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar</span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>

          {isExportMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#151821] border border-[#232733] rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in duration-150">
              <button
                onClick={handleExportPPTX}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs text-zinc-200 hover:bg-white/10 hover:text-white transition-colors text-left"
              >
                <FileSpreadsheet className="w-4 h-4 text-orange-400" />
                <div>
                  <div className="font-semibold">PowerPoint (.pptx)</div>
                  <div className="text-[10px] text-zinc-400">100% Editável</div>
                </div>
              </button>

              <button
                onClick={handleExportPDF}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs text-zinc-200 hover:bg-white/10 hover:text-white transition-colors text-left"
              >
                <FileText className="w-4 h-4 text-red-400" />
                <div>
                  <div className="font-semibold">Documento PDF</div>
                  <div className="text-[10px] text-zinc-400">Impressão / Vetorial</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Present Button (Presentations.ai Signature Blue Pill) */}
        <button
          onClick={() => setIsPresentMode(true)}
          className="flex items-center space-x-1.5 bg-[#0055ED] hover:bg-blue-600 text-white font-bold text-xs px-4 py-1.5 rounded-lg shadow-lg shadow-blue-500/25 transition-all active:scale-95"
          title="Apresentar em tela cheia"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Apresentar</span>
        </button>
      </div>
    </header>
  );
};
