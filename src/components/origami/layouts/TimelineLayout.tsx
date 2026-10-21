"use client";

import React from "react";
import { SlideNode } from "@/types/presentation";
import { Check } from "lucide-react";

interface LayoutProps {
  slide: SlideNode;
  slideIndex: number;
  isEditable?: boolean;
  onUpdateElement?: (elementId: string, content: string, label?: string) => void;
}

export const TimelineLayout: React.FC<LayoutProps> = ({
  slide,
  slideIndex,
  isEditable,
  onUpdateElement
}) => {
  const steps = slide.elements.length > 0 ? slide.elements : [
    { id: "s1", type: "text", label: "Fase 1: Q1", content: "Mapeamento e Prova de Conceito com validação técnica." },
    { id: "s2", type: "text", label: "Fase 2: Q2", content: "Implementação da camada de inferência acelerada." },
    { id: "s3", type: "text", label: "Fase 3: Q3", content: "Rollout corporativo e integração com ferramentas legadas." },
    { id: "s4", type: "text", label: "Fase 4: Q4", content: "Escala autônoma e otimização contínua de latência." }
  ];

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

      {/* Horizontal Timeline */}
      <div className="my-auto relative">
        {/* Connecting Line */}
        <div 
          className="absolute top-6 left-0 right-0 h-1 z-0"
          style={{ backgroundColor: "var(--mood-surface-border)" }}
        />

        <div className={`grid grid-cols-${Math.min(steps.length, 4)} gap-6 relative z-10`}>
          {steps.map((step, idx) => (
            <div key={step.id || idx} className="flex flex-col">
              {/* Step indicator node */}
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm mb-6 border-2 transition-transform hover:scale-110"
                style={{ 
                  backgroundColor: "var(--mood-bg)",
                  borderColor: "var(--mood-primary)",
                  color: "var(--mood-primary)"
                }}
              >
                0{idx + 1}
              </div>

              {/* Step Card */}
              <div 
                className="p-6 rounded-2xl border backdrop-blur-sm flex-1 flex flex-col justify-between"
                style={{
                  backgroundColor: "var(--mood-surface)",
                  borderColor: "var(--mood-surface-border)"
                }}
              >
                <h4 
                  className="text-lg font-bold mb-2"
                  style={{ color: "var(--mood-text-primary)" }}
                >
                  {step.label || `Etapa 0${idx + 1}`}
                </h4>
                <p 
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--mood-text-secondary)" }}
                >
                  {step.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t flex justify-between items-center text-xs" style={{ borderColor: "var(--mood-surface-border)", color: "var(--mood-text-muted)" }}>
        <span>CRONOGRAMA DE EXECUÇÃO</span>
        <span className="font-mono">SLIDE {String(slideIndex + 1).padStart(2, "0")}</span>
      </div>
    </div>
  );
};
