"use client";

import { MusicSelectorButton } from "@/app/_components/music/MusicSelectorButton";
import { LongrMusicTimelineStrip } from "@/app/_components/longr/LongrMusicTimelineStrip";
import { Panel } from "@/app/_components/ui/Panel";
import type { LongrMusicClip } from "@/lib/clipstitchr/types/LongrMusicClip";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";

type LongrMusicPanelProps = {
  isBuilding: boolean;
  musicClips: LongrMusicClip[];
  onAddTrack: (track: SharedMusicTrack) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<LongrMusicClip>) => void;
};

export function LongrMusicPanel({
  isBuilding,
  musicClips,
  onAddTrack,
  onDuplicate,
  onRemove,
  onUpdate,
}: LongrMusicPanelProps) {
  return (
    <Panel className="p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-accent-dark">Music</p>
          <h2 className="mt-0.5 text-base font-bold text-text-primary">
            Audio timeline
          </h2>
        </div>
        <MusicSelectorButton
          disabled={isBuilding}
          source="longr"
          onSelectTrack={onAddTrack}
        />
      </div>
      <LongrMusicTimelineStrip
        musicClips={musicClips}
        onDuplicate={onDuplicate}
        onRemove={onRemove}
        onUpdate={onUpdate}
      />
    </Panel>
  );
}
