"use client";

import React from "react";
import { SlideNode } from "@/types/presentation";
import { Layers, Zap, Cpu } from "lucide-react";

interface LayoutProps {
  slide: SlideNode;
  slideIndex: number;
  isEditable?: boolean;
  onUpdateElement?: (elementId: string, content: string, label?: string) => void;
}

const DEFAULT_ICONS = [Layers, Zap, Cpu];

export const Columns3Layout: React.FC<LayoutProps> = ({
  slide,
  slideIndex,
  isEditable,
  onUpdateElement
}) => {
  const columns = slide.elements.filter((e) => e.type === "text" || !e.type);

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

      {/* 3 Columns Grid */}
      <div className="grid grid-cols-3 gap-8 my-auto">
        {columns.map((col, idx) => {
          const IconComp = DEFAULT_ICONS[idx % DEFAULT_ICONS.length];

          return (
            <div
              key={col.id || idx}
              className="p-8 rounded-2xl border backdrop-blur-sm flex flex-col justify-between transition-all duration-300 hover:border-opacity-60"
              style={{
                backgroundColor: "var(--mood-surface)",
                borderColor: "var(--mood-surface-border)"
              }}
            >
              <div>
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                  style={{ 
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    color: "var(--mood-primary)",
                    border: "1px solid var(--mood-surface-border)"
                  }}
                >
                  <IconComp className="w-6 h-6" />
                </div>

                <h3 
                  className="text-xl font-bold mb-3"
                  style={{ color: "var(--mood-text-primary)" }}
                >
                  {col.label || `Pilar ${idx + 1}`}
                </h3>

                <p 
                  className="text-base leading-relaxed"
                  style={{ color: "var(--mood-text-secondary)" }}
                >
                  {col.content}
                </p>
              </div>

              <div 
                className="mt-6 pt-4 border-t text-xs font-mono"
                style={{ borderColor: "var(--mood-surface-border)", color: "var(--mood-text-muted)" }}
              >
                0{idx + 1} // CAMADA
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="pt-6 border-t flex justify-between items-center text-xs" style={{ borderColor: "var(--mood-surface-border)", color: "var(--mood-text-muted)" }}>
        <span>ARQUITETURA DISTRIBUÍDA</span>
        <span className="font-mono">SLIDE {String(slideIndex + 1).padStart(2, "0")}</span>
      </div>
    </div>
  );
};
