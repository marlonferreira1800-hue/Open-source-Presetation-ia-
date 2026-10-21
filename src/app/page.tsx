"use client";

import React, { useState } from "react";
import { EditorHeader } from "@/components/editor/EditorHeader";
import { SlideThumbnails } from "@/components/editor/SlideThumbnails";
import { EditorViewport } from "@/components/editor/EditorViewport";
import { PromptModal } from "@/components/ai/PromptModal";

export default function Home() {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen bg-black overflow-hidden select-none">
      {/* Top Application Header */}
      <EditorHeader onOpenAIModal={() => setIsAIModalOpen(true)} />

      {/* Main Workspace Area (Thumbnails Sidebar + Center Stage Viewport) */}
      <div className="flex flex-1 overflow-hidden">
        <SlideThumbnails />
        <EditorViewport />
      </div>

      {/* AI Deck Generator Modal */}
      <PromptModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />
    </div>
  );
}
