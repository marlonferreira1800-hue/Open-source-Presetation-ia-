"use client";

import React from "react";
import { SlideNode } from "@/types/presentation";
import { CheckCircle2, ShieldCheck, Cpu } from "lucide-react";

interface LayoutProps {
  slide: SlideNode;
  slideIndex: number;
  isEditable?: boolean;
  onUpdateElement?: (elementId: string, content: string, label?: string) => void;
}

export const FeatureSplitLayout: React.FC<LayoutProps> = ({
  slide,
  slideIndex,
  isEditable,
  onUpdateElement
}) => {
  const features = slide.elements.filter((e) => e.type === "text" || !e.type);

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

      {/* Split Grid: Visual Artifice on Left, Feature Items on Right */}
      <div className="grid grid-cols-12 gap-10 my-auto items-center">
        {/* Left Visual Box */}
        <div 
          className="col-span-5 h-80 rounded-3xl border flex flex-col items-center justify-center p-8 relative overflow-hidden"
          style={{
            backgroundColor: "var(--mood-surface)",
            borderColor: "var(--mood-surface-border)"
          }}
        >
          <div 
            className="w-24 h-24 rounded-2xl flex items-center justify-center mb-4"
            style={{ 
              backgroundColor: "rgba(118, 185, 0, 0.1)",
              border: "1px solid var(--mood-primary)",
              color: "var(--mood-primary)"
            }}
          >
            <Cpu className="w-12 h-12" />
          </div>
          <span className="text-xl font-bold" style={{ color: "var(--mood-text-primary)" }}>
            Engine Autônoma
          </span>
          <span className="text-xs font-mono mt-1" style={{ color: "var(--mood-text-muted)" }}>
            LATÊNCIA REDUZIDA // 99.9% UPTIME
          </span>
        </div>

        {/* Right Feature List */}
        <div className="col-span-7 flex flex-col space-y-5">
          {features.map((feat, idx) => (
            <div 
              key={feat.id || idx}
              className="p-6 rounded-2xl border flex items-start space-x-4 transition-all hover:translate-x-1"
              style={{
                backgroundColor: "var(--mood-surface)",
                borderColor: "var(--mood-surface-border)"
              }}
            >
              <div className="mt-1" style={{ color: "var(--mood-primary)" }}>
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold mb-1" style={{ color: "var(--mood-text-primary)" }}>
                  {feat.label || `Capacidade 0${idx + 1}`}
                </h4>
                <p className="text-sm leading-relaxed" style={{ color: "var(--mood-text-secondary)" }}>
                  {feat.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t flex justify-between items-center text-xs" style={{ borderColor: "var(--mood-surface-border)", color: "var(--mood-text-muted)" }}>
        <span>CAPACIDADES E ESPECIFICAÇÕES</span>
        <span className="font-mono">SLIDE {String(slideIndex + 1).padStart(2, "0")}</span>
      </div>
    </div>
  );
};
