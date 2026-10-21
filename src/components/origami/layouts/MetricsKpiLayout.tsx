"use client";

import React from "react";
import { SlideNode } from "@/types/presentation";
import { TrendingUp, ArrowUpRight } from "lucide-react";

interface LayoutProps {
  slide: SlideNode;
  slideIndex: number;
  isEditable?: boolean;
  onUpdateElement?: (elementId: string, content: string, label?: string) => void;
}

export const MetricsKpiLayout: React.FC<LayoutProps> = ({
  slide,
  slideIndex,
  isEditable,
  onUpdateElement
}) => {
  const metrics = slide.elements.filter((e) => e.type === "metric");

  return (
    <div className="flex flex-col justify-between h-full p-16 relative overflow-hidden select-text">
      {/* Header */}
      <div>
        {slide.accentBadge && (
          <span 
            className="text-xs uppercase font-bold tracking-widest px-3 py-1 rounded-md border"
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
          className="text-4xl font-extrabold tracking-tight mt-4 mb-2"
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

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-3 gap-6 my-auto">
        {metrics.map((metric, idx) => {
          const trend = metric.meta?.trend;
          const trendPositive = metric.meta?.trendPositive ?? true;

          return (
            <div
              key={metric.id || idx}
              className="p-8 rounded-2xl border backdrop-blur-md flex flex-col justify-between transition-all duration-300 hover:scale-[1.02]"
              style={{
                backgroundColor: "var(--mood-surface)",
                borderColor: "var(--mood-surface-border)"
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <span 
                  className="text-sm font-semibold tracking-wide uppercase"
                  style={{ color: "var(--mood-text-muted)" }}
                >
                  {metric.label || `Métrica ${idx + 1}`}
                </span>
                {trend && (
                  <span 
                    className="flex items-center text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: trendPositive ? "rgba(118, 185, 0, 0.15)" : "rgba(239, 68, 68, 0.15)",
                      color: trendPositive ? "var(--mood-primary)" : "#ef4444"
                    }}
                  >
                    <ArrowUpRight className="w-3 h-3 mr-0.5" />
                    {trend}
                  </span>
                )}
              </div>

              <div 
                className="text-6xl font-black tracking-tight my-2"
                style={{ 
                  color: "var(--mood-primary)",
                  fontFamily: "var(--mood-font-heading)"
                }}
              >
                {metric.content}
              </div>

              <div className="text-xs font-medium mt-4 pt-3 border-t" style={{ borderColor: "var(--mood-surface-border)", color: "var(--mood-text-secondary)" }}>
                Benchmark auditado em produção
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="pt-6 border-t flex justify-between items-center text-xs" style={{ borderColor: "var(--mood-surface-border)", color: "var(--mood-text-muted)" }}>
        <span>DECIFRANDO DADOS • RELATÓRIO EXECUTIVO</span>
        <span className="font-mono">SLIDE {String(slideIndex + 1).padStart(2, "0")}</span>
      </div>
    </div>
  );
};
