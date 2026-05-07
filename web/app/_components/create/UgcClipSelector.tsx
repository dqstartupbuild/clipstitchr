"use client";

import { SelectableClipRow } from "@/app/_components/create/SelectableClipRow";
import type { VideoClip } from "@/lib/clipr/types/VideoClip";

type UgcClipSelectorProps = {
  clips: VideoClip[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function UgcClipSelector({
  clips,
  selectedId,
  onSelect,
}: UgcClipSelectorProps) {
  return (
    <div>
      <h2 className="text-base font-bold text-text-primary">UGC Clip</h2>
      <div className="mt-3 space-y-2">
        {clips.map((clip) => (
          <SelectableClipRow
            key={clip.id}
            clip={clip}
            isSelected={clip.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
