"use client";

import { LongrMusicTimelineCard } from "@/app/_components/longr/LongrMusicTimelineCard";
import type { LongrMusicClip } from "@/lib/clipstitchr/types/LongrMusicClip";

type LongrMusicTimelineStripProps = {
  musicClips: LongrMusicClip[];
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<LongrMusicClip>) => void;
};

export function LongrMusicTimelineStrip({
  musicClips,
  onDuplicate,
  onRemove,
  onUpdate,
}: LongrMusicTimelineStripProps) {
  if (!musicClips.length) {
    return null;
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {musicClips.map((clip) => (
        <LongrMusicTimelineCard
          key={clip.id}
          clip={clip}
          onDuplicate={onDuplicate}
          onRemove={onRemove}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}
