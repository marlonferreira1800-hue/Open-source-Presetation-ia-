"use client";

import React from "react";
import { SlideNode } from "@/types/presentation";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface LayoutProps {
  slide: SlideNode;
  slideIndex: number;
  isEditable?: boolean;
  onUpdateElement?: (elementId: string, content: string, label?: string) => void;
}

export const ProblemSolutionLayout: React.FC<LayoutProps> = ({
  slide,
  slideIndex,
  isEditable,
  onUpdateElement
}) => {
  const problemEl = slide.elements[0] || { label: "O Problema", content: "Descrição do problema existente." };
  const solutionEl = slide.elements[1] || { label: "A Solução", content: "Como o novo modelo resolve a questão." };

  return (
    <div className="flex flex-col justify-between h-full p-16 relative overflow-hidden select-text">
      {/* Header */}
      <div>
        {slide.accentBadge && (
          <span 
            className="text-xs uppercase font-bold tracking-widest px-3 py-1 rounded-md border inline-block mb-3"
            style={{ 
              borderColor: "var(--mood-surface-border)",
              backgroundColor: "var(--mood-surface)",
              color: "var(--mood-primary)"
            }}
          >
            {slide.accentBadge}
          </span>
        )}
        <h2 
          className="text-4xl font-extrabold tracking-tight mb-2"
          style={{ 
            color: "var(--mood-text-primary)",
            fontFamily: "var(--mood-font-heading)"
          }}
        >
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p className="text-xl max-w-3xl" style={{ color: "var(--mood-text-secondary)" }}>
            {slide.subtitle}
          </p>
        )}
      </div>

      {/* Split Comparison Grid */}
      <div className="grid grid-cols-2 gap-10 my-auto">
        {/* Problem Card */}
        <div 
          className="p-10 rounded-3xl border flex flex-col justify-between relative overflow-hidden"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.05)",
            borderColor: "rgba(239, 68, 68, 0.25)"
          }}
        >
          <div>
            <div className="flex items-center space-x-3 mb-6 text-red-400">
              <AlertCircle className="w-8 h-8" />
              <span className="text-xl font-bold tracking-tight">
                {problemEl.label || "O Cenário Anterior"}
              </span>
            </div>
            <p className="text-xl leading-relaxed font-normal" style={{ color: "var(--mood-text-secondary)" }}>
              {problemEl.content}
            </p>
          </div>
          <div className="mt-8 pt-4 border-t border-red-500/20 text-xs font-mono text-red-400/80 uppercase">
            Gargalo / Fricção Identificada
          </div>
        </div>

        {/* Solution Card */}
        <div 
          className="p-10 rounded-3xl border flex flex-col justify-between relative overflow-hidden shadow-2xl"
          style={{
            backgroundColor: "var(--mood-surface)",
            borderColor: "var(--mood-primary)"
          }}
        >
          <div>
            <div className="flex items-center space-x-3 mb-6" style={{ color: "var(--mood-primary)" }}>
              <CheckCircle2 className="w-8 h-8" />
              <span className="text-xl font-bold tracking-tight">
                {solutionEl.label || "A Solução Inovadora"}
              </span>
            </div>
            <p className="text-xl leading-relaxed font-medium" style={{ color: "var(--mood-text-primary)" }}>
              {solutionEl.content}
            </p>
          </div>
          <div className="mt-8 pt-4 border-t text-xs font-mono uppercase" style={{ borderColor: "var(--mood-surface-border)", color: "var(--mood-primary)" }}>
            Transformação Estrutural Validada
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t flex justify-between items-center text-xs" style={{ borderColor: "var(--mood-surface-border)", color: "var(--mood-text-muted)" }}>
        <span>ANÁLISE COMPARATIVA DE VALOR</span>
        <span className="font-mono">SLIDE {String(slideIndex + 1).padStart(2, "0")}</span>
      </div>
    </div>
  );
};
