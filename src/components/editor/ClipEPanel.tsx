"use client";

import React, { useState } from "react";
import { useDeckStore } from "@/store/useDeckStore";
import { 
  Sparkles, 
  X, 
  ArrowUp, 
  Zap, 
  BarChart3, 
  Briefcase, 
  RefreshCw, 
  Loader2, 
  CheckCircle2, 
  MessageSquare
} from "lucide-react";

export const ClipEPanel: React.FC = () => {
  const { 
    isClipEOpen, 
    toggleClipE, 
    deck, 
    activeSlideIndex, 
    updateSlideAt, 
    undo 
  } = useDeckStore();

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const activeSlide = deck.slides[activeSlideIndex];

  if (!isClipEOpen || !activeSlide) return null;

  const handleCommand = async (actionPrompt: string, actionType?: string) => {
    setLoading(true);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/clipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: actionPrompt,
          currentSlide: activeSlide,
          action: actionType
        })
      });

      if (!res.ok) {
        throw new Error("Erro na comunicação com Clip-E");
      }

      const updatedSlide = await res.json();
      updateSlideAt(activeSlideIndex, updatedSlide);
      setSuccessMsg("Slide atualizado pelo Clip-E!");
      setPrompt("");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
      alert("Falha ao processar comando com Clip-E");
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="w-80 border-l border-white/10 bg-[#0F121A]/95 backdrop-blur-xl flex flex-col h-[calc(100vh-4rem)] z-30 select-none animate-in slide-in-from-right-4 duration-300 shadow-2xl">
      {/* Clip-E Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0055ED] via-[#3B82F6] to-purple-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <Sparkles className="w-4 h-4 fill-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-sm font-bold text-white tracking-wide">Clip-E</span>
              <span className="text-[10px] font-mono bg-blue-500/20 text-blue-400 px-1.5 py-0.2 rounded-full border border-blue-500/30">
                AI Copilot
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 block -mt-0.5">Editor Inteligente de Slide</span>
          </div>
        </div>

        <button
          onClick={toggleClipE}
          className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          title="Fechar Clip-E"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Active Slide Target Indicator */}
      <div className="px-4 py-2.5 bg-white/[0.03] border-b border-white/5 flex items-center space-x-2 text-xs">
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
        <span className="text-zinc-400">Atuando no</span>
        <span className="text-white font-semibold truncate max-w-[150px]">
          Slide 0{activeSlideIndex + 1} ({activeSlide.title})
        </span>
      </div>

      {/* Quick Actions & Suggestions */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2.5">
            Ações Rápidas de 1 Clique
          </span>

          <div className="space-y-2">
            <button
              onClick={() => handleCommand("Encurtar textos para ficarem mais concisos", "shorten")}
              disabled={loading}
              className="w-full p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-blue-600/10 hover:border-blue-500/40 text-left flex items-center space-x-2.5 text-xs text-zinc-200 transition-all disabled:opacity-50 group"
            >
              <div className="p-1.5 rounded-lg bg-white/5 text-blue-400 group-hover:bg-blue-500/20">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-white">Encurtar Textos</div>
                <div className="text-[10px] text-zinc-400">Mais conciso e impactante</div>
              </div>
            </button>

            <button
              onClick={() => handleCommand("Transformar este slide em formato de métricas comparativas", "metrics")}
              disabled={loading}
              className="w-full p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-emerald-600/10 hover:border-emerald-500/40 text-left flex items-center space-x-2.5 text-xs text-zinc-200 transition-all disabled:opacity-50 group"
            >
              <div className="p-1.5 rounded-lg bg-white/5 text-emerald-400 group-hover:bg-emerald-500/20">
                <BarChart3 className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-white">Converter para KPIs</div>
                <div className="text-[10px] text-zinc-400">Exibir 3 métricas de destaque</div>
              </div>
            </button>

            <button
              onClick={() => handleCommand("Reescrever com tom executivo e institucional sofisticado", "executive")}
              disabled={loading}
              className="w-full p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-purple-600/10 hover:border-purple-500/40 text-left flex items-center space-x-2.5 text-xs text-zinc-200 transition-all disabled:opacity-50 group"
            >
              <div className="p-1.5 rounded-lg bg-white/5 text-purple-400 group-hover:bg-purple-500/20">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-white">Tom Mais Executivo</div>
                <div className="text-[10px] text-zinc-400">Vocabulário de liderança C-Level</div>
              </div>
            </button>
          </div>
        </div>

        {/* Feedback message */}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
            <button
              onClick={undo}
              className="underline text-[11px] font-bold text-emerald-300 hover:text-white"
            >
              Desfazer
            </button>
          </div>
        )}

        {/* Assistant Tip */}
        <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] text-xs text-zinc-400 leading-relaxed">
          <div className="flex items-center space-x-1.5 text-blue-400 font-semibold mb-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Dica do Clip-E</span>
          </div>
          Você pode pedir qualquer coisa em linguagem natural: &ldquo;adicione uma estatística&rdquo;, &ldquo;resuma em 3 frases&rdquo; ou &ldquo;mude para comparativo&rdquo;.
        </div>
      </div>

      {/* Clip-E Input Bar */}
      <div className="p-3 border-t border-white/10 bg-black/40">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (prompt.trim() && !loading) handleCommand(prompt);
          }}
          className="relative"
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Peça qualquer alteração ao Clip-E..."
            disabled={loading}
            className="w-full bg-white/5 border border-white/15 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-blue-600 active:scale-90"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowUp className="w-3.5 h-3.5" />}
          </button>
        </form>
      </div>
    </aside>
  );
};
