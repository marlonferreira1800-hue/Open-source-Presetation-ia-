"use client";

import React from "react";
import { useDeckStore } from "@/store/useDeckStore";
import { MOODS } from "@/lib/moods";
import { Palette, X, Check } from "lucide-react";

export const ThemesDrawer: React.FC = () => {
  const { isThemesOpen, toggleThemes, deck, setMood } = useDeckStore();

  if (!isThemesOpen) return null;

  return (
    <aside className="w-80 border-l border-white/10 bg-[#0F121A]/95 backdrop-blur-xl flex flex-col h-[calc(100vh-4rem)] z-30 select-none animate-in slide-in-from-right-4 duration-300 shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-lg shadow-pink-500/25">
            <Palette className="w-4 h-4 fill-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-wide">Design Themes (Moods)</span>
            <span className="text-[10px] text-zinc-400 block -mt-0.5">Estilos visuais completos</span>
          </div>
        </div>

        <button
          onClick={toggleThemes}
          className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          title="Fechar Painel de Temas"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Themes List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {MOODS.map((mood) => {
          const isActive = deck.moodId === mood.id;

          return (
            <div
              key={mood.id}
              onClick={() => setMood(mood.id)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                isActive
                  ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                  : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/[0.08]"
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-white tracking-wide">
                  {mood.name}
                </span>
                {isActive && (
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Color Swatches */}
              <div className="flex items-center space-x-2 mb-2">
                <div
                  className="w-7 h-7 rounded-lg border border-white/10 shadow-sm"
                  style={{ backgroundColor: mood.colors.bg }}
                  title="Background"
                />
                <div
                  className="w-7 h-7 rounded-lg border border-white/10 shadow-sm"
                  style={{ backgroundColor: mood.colors.primary }}
                  title="Cor Primária"
                />
                <div
                  className="w-7 h-7 rounded-lg border border-white/10 shadow-sm"
                  style={{ backgroundColor: mood.colors.secondary }}
                  title="Cor Secundária"
                />
                <div
                  className="w-7 h-7 rounded-lg border border-white/10 shadow-sm"
                  style={{ backgroundColor: mood.colors.surface }}
                  title="Card / Superfície"
                />
              </div>

              <div className="text-[10px] text-zinc-400 font-mono uppercase">
                {mood.category} • {mood.fonts.heading.split(",")[0]}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
