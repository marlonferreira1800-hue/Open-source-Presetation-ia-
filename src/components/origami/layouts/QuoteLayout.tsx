"use client";

import React from "react";
import { SlideNode } from "@/types/presentation";
import { Quote } from "lucide-react";

interface LayoutProps {
  slide: SlideNode;
  slideIndex: number;
  isEditable?: boolean;
  onUpdateElement?: (elementId: string, content: string, label?: string) => void;
}

export const QuoteLayout: React.FC<LayoutProps> = ({
  slide,
  slideIndex,
  isEditable,
  onUpdateElement
}) => {
  const quoteText = slide.elements.find((e) => e.type === "text")?.content || slide.title;
  const authorEl = slide.elements.find((e) => e.type === "label" || e.id.includes("author"));

  return (
    <div className="flex flex-col justify-between h-full p-20 relative overflow-hidden select-text">
      {/* Background quote icon */}
      <div 
        className="absolute top-12 left-16 opacity-10 pointer-events-none"
        style={{ color: "var(--mood-primary)" }}
      >
        <Quote className="w-40 h-40" />
      </div>

      {/* Top Tag */}
      {slide.accentBadge && (
        <span 
          className="text-xs uppercase font-bold tracking-widest px-3 py-1 rounded-md border w-fit"
          style={{ 
            borderColor: "var(--mood-surface-border)",
            backgroundColor: "var(--mood-surface)",
            color: "var(--mood-primary)"
          }}
        >
          {slide.accentBadge}
        </span>
      )}

      {/* Quote Main text */}
      <div className="z-10 max-w-4xl my-auto">
        <blockquote 
          className="text-4xl md:text-5xl font-medium tracking-tight leading-[1.3] mb-8"
          style={{ 
            color: "var(--mood-text-primary)",
            fontFamily: "var(--mood-font-heading)"
          }}
        >
          “{quoteText}”
        </blockquote>

        {authorEl && (
          <div className="flex items-center space-x-4">
            <div 
              className="w-12 h-1 rounded-full"
              style={{ backgroundColor: "var(--mood-primary)" }}
            />
            <div>
              <div className="text-xl font-bold" style={{ color: "var(--mood-text-primary)" }}>
                {authorEl.content}
              </div>
              {authorEl.label && (
                <div className="text-sm font-medium" style={{ color: "var(--mood-text-muted)" }}>
                  {authorEl.label}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-6 border-t flex justify-between items-center text-xs" style={{ borderColor: "var(--mood-surface-border)", color: "var(--mood-text-muted)" }}>
        <span>DECLARAÇÃO DE POSICIONAMENTO</span>
        <span className="font-mono">SLIDE {String(slideIndex + 1).padStart(2, "0")}</span>
      </div>
    </div>
  );
};
