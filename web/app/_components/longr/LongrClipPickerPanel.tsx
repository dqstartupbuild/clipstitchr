"use client";

import { useMemo, useState } from "react";
import { LongrClipLibraryCard } from "@/app/_components/longr/LongrClipLibraryCard";
import { LongrDurationMeter } from "@/app/_components/longr/LongrDurationMeter";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import { SearchInput } from "@/app/_components/ui/SearchInput";
import { longrMaxDurationSeconds } from "@/lib/clipstitchr/constants/longrMaxDurationSeconds";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { filterClipsBySearchQuery } from "@/lib/clipstitchr/utils/filterClipsBySearchQuery";
import { getDefaultVideoTrimRange } from "@/lib/clipstitchr/utils/getDefaultVideoTrimRange";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";

type LongrClipPickerPanelProps = {
  clips: VideoClipMetadata[];
  duration: number;
  isBuilding: boolean;
  selectedClipIds: string[];
  onAddClip: (clip: VideoClipMetadata) => void;
  onBuild: () => void;
  onRemoveClip: (clipId: string) => void;
};

export function LongrClipPickerPanel({
  clips,
  duration,
  isBuilding,
  selectedClipIds,
  onAddClip,
  onBuild,
  onRemoveClip,
}: LongrClipPickerPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const filteredClips = useMemo(
    () => filterClipsBySearchQuery(clips, searchQuery),
    [clips, searchQuery],
  );

  return (
    <Panel className="p-4">
      <div className="grid gap-4 border-b border-border pb-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
        <div>
          <p className="text-sm font-semibold text-accent-dark">Longr</p>
          <h2 className="mt-0.5 text-base font-bold text-text-primary">
            Build one long-form sequence
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {selectedClipIds.length} selected
          </p>
        </div>
        <Button
          type="button"
          disabled={!selectedClipIds.length || duration > longrMaxDurationSeconds}
          isLoading={isBuilding}
          onClick={onBuild}
        >
          Build
        </Button>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px]">
        <SearchInput
          label="Search Longr source clips"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search UGC and demo videos"
        />
        <LongrDurationMeter duration={duration} />
      </div>
      <div className="mt-4 grid max-h-[560px] gap-3 overflow-y-auto pr-1">
        {filteredClips.map((clip) => {
          const isSelected = selectedClipIds.includes(clip.id);
          const clipDuration = getVideoTrimRangeDuration(
            getDefaultVideoTrimRange(clip),
          );

          return (
            <LongrClipLibraryCard
              key={clip.id}
              clip={clip}
              disabled={duration + clipDuration > longrMaxDurationSeconds}
              isSelected={isSelected}
              onAdd={onAddClip}
              onRemove={(selectedClip) => onRemoveClip(selectedClip.id)}
            />
          );
        })}
      </div>
    </Panel>
  );
}
