"use client";

import React, { useState } from "react";
import { EditorHeader } from "@/components/editor/EditorHeader";
import { SlideThumbnails } from "@/components/editor/SlideThumbnails";
import { EditorViewport } from "@/components/editor/EditorViewport";
import { ClipEPanel } from "@/components/editor/ClipEPanel";
import { ThemesDrawer } from "@/components/editor/ThemesDrawer";
import { PresentMode } from "@/components/editor/PresentMode";
import { PromptModal } from "@/components/ai/PromptModal";

export default function Home() {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0C0E14] overflow-hidden select-none text-white">
      {/* Top Application Header */}
      <EditorHeader onOpenAIModal={() => setIsAIModalOpen(true)} />

      {/* Main Workspace Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Thumbnails Sidebar */}
        <SlideThumbnails />

        {/* Center Canvas Viewport */}
        <EditorViewport />

        {/* Right Drawer: Clip-E AI Copilot */}
        <ClipEPanel />

        {/* Right Drawer: Themes (Moods) */}
        <ThemesDrawer />
      </div>

      {/* Fullscreen Presentation Mode */}
      <PresentMode />

      {/* AI Deck Creator Modal */}
      <PromptModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />
    </div>
  );
}
