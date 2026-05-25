"use client";

import { useState } from "react";
import { StitchrLongrTimelineCard } from "@/app/_components/stitchr/StitchrLongrTimelineCard";
import { Panel } from "@/app/_components/ui/Panel";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

type StitchrLongrTimelineStripProps = {
  clips: VideoClipMetadata[];
  onLoadPoster?: (id: string) => Promise<Blob | null>;
  onMoveClip: (draggedId: string, targetId: string) => void;
  onRemoveClip: (id: string) => void;
};

export function StitchrLongrTimelineStrip({
  clips,
  onLoadPoster,
  onMoveClip,
  onRemoveClip,
}: StitchrLongrTimelineStripProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  if (!clips.length) {
    return null;
  }

  return (
    <Panel className="p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-accent-dark">Timeline</p>
          <h2 className="mt-0.5 text-base font-bold text-text-primary">
            Play order
          </h2>
        </div>
        <span className="text-sm font-semibold text-text-tertiary">
          {clips.length}
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {clips.map((clip, index) => (
          <StitchrLongrTimelineCard
            key={clip.id}
            clip={clip}
            index={index}
            isDragging={draggingId === clip.id}
            onDragStart={setDraggingId}
            onDrop={(targetId) => {
              if (draggingId && draggingId !== targetId) {
                onMoveClip(draggingId, targetId);
              }

              setDraggingId(null);
            }}
            onLoadPoster={onLoadPoster}
            onRemove={onRemoveClip}
          />
        ))}
      </div>
    </Panel>
  );
}
