"use client";

import React, { useState } from "react";
import { useDeckStore } from "@/store/useDeckStore";
import { MOODS } from "@/lib/moods";
import { Sparkles, X, Loader2, ArrowRight } from "lucide-react";

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXAMPLE_PROMPTS = [
  "Pitch Deck para uma startup de IA na área financeira com métricas de crescimento e arquitetura técnica",
  "Apresentação executiva sobre a transição para arquitetura de dados moderna com Lakehouse e dbt",
  "Relatório de diretoria sobre prevenção a fraudes em bancos utilizando Machine Learning em tempo real",
  "Planejamento estratégico de 2026 para modernização de infraestrutura em nuvem na AWS e GCP"
];

export const PromptModal: React.FC<PromptModalProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState("");
  const [slideCount, setSlideCount] = useState(5);
  const [selectedMood, setSelectedMood] = useState("nvidia-emerald");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { setDeck } = useDeckStore();

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/generate-deck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          slideCount,
          moodId: selectedMood
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao conectar com a IA");
      }

      const newDeck = await res.json();
      setDeck(newDeck);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Ocorreu um erro ao gerar os slides.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-zinc-900 border border-white/15 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow behind modal */}
        <div className="absolute -top-32 -right-32 w-72 h-72 bg-[#76B900]/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#76B900] to-emerald-400 flex items-center justify-center text-black font-bold shadow-lg shadow-[#76B900]/20">
              <Sparkles className="w-5 h-5 fill-black" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                Gerar Apresentação com IA
              </h3>
              <p className="text-xs text-zinc-400">
                Alimentado por NVIDIA NIM (Llama 3.3 70B Instruct) & Origami Engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <div className="space-y-5 relative z-10">
          {/* Prompt textarea */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block mb-2">
              Sobre o que você quer falar?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Apresentação para investidores sobre nossa plataforma de IA..."
              rows={3}
              disabled={loading}
              className="w-full bg-black/50 border border-white/15 rounded-2xl p-4 text-sm text-white placeholder-zinc-500 focus:border-[#76B900] focus:ring-1 focus:ring-[#76B900] outline-none transition-all resize-none"
            />
          </div>

          {/* Quick Ideas Chips */}
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 block mb-2">Sugestões rápidas:</span>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((ex, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(ex)}
                  disabled={loading}
                  className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 px-3 py-1.5 rounded-full transition-colors text-left truncate max-w-full"
                >
                  {ex.length > 60 ? ex.slice(0, 60) + "..." : ex}
                </button>
              ))}
            </div>
          </div>

          {/* Options Row: Mood and Slide Count */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Tema de Design (Mood)
              </label>
              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                disabled={loading}
                className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-sm text-zinc-200 outline-none cursor-pointer focus:border-[#76B900]"
              >
                {MOODS.map((m) => (
                  <option key={m.id} value={m.id} className="bg-zinc-900 text-white">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Quantidade de Slides
              </label>
              <select
                value={slideCount}
                onChange={(e) => setSlideCount(Number(e.target.value))}
                disabled={loading}
                className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-sm text-zinc-200 outline-none cursor-pointer focus:border-[#76B900]"
              >
                <option value={4} className="bg-zinc-900 text-white">4 Slides (Rápido)</option>
                <option value={5} className="bg-zinc-900 text-white">5 Slides (Padrão)</option>
                <option value={6} className="bg-zinc-900 text-white">6 Slides (Executivo)</option>
                <option value={8} className="bg-zinc-900 text-white">8 Slides (Completo)</option>
              </select>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              {errorMsg}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="flex items-center space-x-2 bg-gradient-to-r from-[#76B900] to-emerald-500 hover:from-[#659e00] hover:to-emerald-600 text-black font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-[#76B900]/25 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gerando Apresentação...</span>
                </>
              ) : (
                <>
                  <span>Criar Apresentação</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
