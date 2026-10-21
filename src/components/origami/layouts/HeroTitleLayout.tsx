"use client";

import React from "react";
import { SlideNode } from "@/types/presentation";
import { Sparkles } from "lucide-react";

interface LayoutProps {
  slide: SlideNode;
  slideIndex: number;
  isEditable?: boolean;
  onUpdateElement?: (elementId: string, content: string, label?: string) => void;
}

export const HeroTitleLayout: React.FC<LayoutProps> = ({
  slide,
  slideIndex,
  isEditable,
  onUpdateElement
}) => {
  const authorElement = slide.elements.find((e) => e.type === "label" || e.id.includes("author"));

  return (
    <div className="flex flex-col justify-between h-full p-16 relative overflow-hidden select-text">
      {/* Background ambient glow */}
      <div 
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-[120px] opacity-25 pointer-events-none"
        style={{ backgroundColor: "var(--mood-primary)" }}
      />
      <div 
        className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-[140px] opacity-20 pointer-events-none"
        style={{ backgroundColor: "var(--mood-secondary)" }}
      />

      {/* Top Header Badge */}
      <div className="z-10 flex items-center space-x-3">
        {slide.accentBadge && (
          <div 
            className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase border flex items-center gap-1.5"
            style={{ 
              borderColor: "var(--mood-surface-border)",
              backgroundColor: "var(--mood-surface)",
              color: "var(--mood-primary)"
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{slide.accentBadge}</span>
          </div>
        )}
      </div>

      {/* Main Title & Subtitle block */}
      <div className="z-10 max-w-4xl my-auto">
        <h1 
          className="text-6xl font-extrabold tracking-tight leading-[1.1] mb-6"
          style={{ 
            color: "var(--mood-text-primary)",
            fontFamily: "var(--mood-font-heading)"
          }}
        >
          {slide.title}
        </h1>

        {slide.subtitle && (
          <p 
            className="text-2xl font-normal leading-relaxed max-w-3xl"
            style={{ color: "var(--mood-text-secondary)" }}
          >
            {slide.subtitle}
          </p>
        )}
      </div>

      {/* Footer Author/Meta */}
      <div className="z-10 pt-8 border-t flex items-center justify-between" style={{ borderColor: "var(--mood-surface-border)" }}>
        {authorElement && (
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--mood-text-muted)" }}>
              {authorElement.label || "Apresentação"}
            </span>
            <span className="text-base font-medium mt-0.5" style={{ color: "var(--mood-text-primary)" }}>
              {authorElement.content}
            </span>
          </div>
        )}

        <div className="flex items-center space-x-2 text-xs font-mono" style={{ color: "var(--mood-text-muted)" }}>
          <span>SLIDE {String(slideIndex + 1).padStart(2, "0")}</span>
        </div>
      </div>
    </div>
  );
};
