"use client";

import React, { useMemo } from "react";
import { SlideNode, MoodTheme } from "@/types/presentation";
import { getMoodById } from "@/lib/moods";
import { HeroTitleLayout } from "./layouts/HeroTitleLayout";
import { MetricsKpiLayout } from "./layouts/MetricsKpiLayout";
import { Columns3Layout } from "./layouts/Columns3Layout";
import { ProblemSolutionLayout } from "./layouts/ProblemSolutionLayout";
import { QuoteLayout } from "./layouts/QuoteLayout";
import { TimelineLayout } from "./layouts/TimelineLayout";
import { FeatureSplitLayout } from "./layouts/FeatureSplitLayout";

interface OrigamiSlideProps {
  slide: SlideNode;
  slideIndex: number;
  moodId: string;
  isEditable?: boolean;
  scale?: number;
  onUpdateElement?: (elementId: string, content: string, label?: string) => void;
}

export const OrigamiSlide: React.FC<OrigamiSlideProps> = ({
  slide,
  slideIndex,
  moodId,
  isEditable = true,
  scale = 1,
  onUpdateElement
}) => {
  const mood: MoodTheme = useMemo(() => getMoodById(moodId), [moodId]);

  // Dynamic CSS Variables representing the active Mood
  const moodStyles = useMemo(() => {
    return {
      "--mood-bg": mood.colors.bg,
      "--mood-surface": mood.colors.surface,
      "--mood-surface-border": mood.colors.surfaceBorder,
      "--mood-primary": mood.colors.primary,
      "--mood-secondary": mood.colors.secondary,
      "--mood-accent": mood.colors.accent,
      "--mood-text-primary": mood.colors.textPrimary,
      "--mood-text-secondary": mood.colors.textSecondary,
      "--mood-text-muted": mood.colors.textMuted,
      "--mood-font-heading": mood.fonts.heading,
      "--mood-font-body": mood.fonts.body,
    } as React.CSSProperties;
  }, [mood]);

  // Layout Component Resolver
  const renderLayout = () => {
    switch (slide.layout) {
      case "hero_title":
        return (
          <HeroTitleLayout
            slide={slide}
            slideIndex={slideIndex}
            isEditable={isEditable}
            onUpdateElement={onUpdateElement}
          />
        );
      case "metrics_kpi":
        return (
          <MetricsKpiLayout
            slide={slide}
            slideIndex={slideIndex}
            isEditable={isEditable}
            onUpdateElement={onUpdateElement}
          />
        );
      case "columns_3":
        return (
          <Columns3Layout
            slide={slide}
            slideIndex={slideIndex}
            isEditable={isEditable}
            onUpdateElement={onUpdateElement}
          />
        );
      case "problem_solution":
        return (
          <ProblemSolutionLayout
            slide={slide}
            slideIndex={slideIndex}
            isEditable={isEditable}
            onUpdateElement={onUpdateElement}
          />
        );
      case "quote_testimonial":
        return (
          <QuoteLayout
            slide={slide}
            slideIndex={slideIndex}
            isEditable={isEditable}
            onUpdateElement={onUpdateElement}
          />
        );
      case "timeline_horizontal":
        return (
          <TimelineLayout
            slide={slide}
            slideIndex={slideIndex}
            isEditable={isEditable}
            onUpdateElement={onUpdateElement}
          />
        );
      case "feature_split":
        return (
          <FeatureSplitLayout
            slide={slide}
            slideIndex={slideIndex}
            isEditable={isEditable}
            onUpdateElement={onUpdateElement}
          />
        );
      default:
        return (
          <Columns3Layout
            slide={slide}
            slideIndex={slideIndex}
            isEditable={isEditable}
            onUpdateElement={onUpdateElement}
          />
        );
    }
  };

  return (
    <div
      data-elementtype="origami"
      data-slide-id={slide.id}
      style={{
        ...moodStyles,
        width: 1920,
        height: 1080,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        backgroundColor: "var(--mood-bg)",
        fontFamily: "var(--mood-font-body)"
      }}
      className="relative shadow-2xl rounded-xl overflow-hidden transition-colors duration-500 ease-out flex-shrink-0"
    >
      {renderLayout()}
    </div>
  );
};
