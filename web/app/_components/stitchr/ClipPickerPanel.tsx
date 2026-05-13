"use client";

import { useMemo, useState } from "react";
import { ClipPickerActionBar } from "@/app/_components/stitchr/ClipPickerActionBar";
import { DemoClipSelector } from "@/app/_components/stitchr/DemoClipSelector";
import { UgcClipSelector } from "@/app/_components/stitchr/UgcClipSelector";
import { Panel } from "@/app/_components/ui/Panel";
import { SearchInput } from "@/app/_components/ui/SearchInput";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { filterClipsBySearchQuery } from "@/lib/clipstitchr/utils/filterClipsBySearchQuery";

type ClipPickerPanelProps = {
  addMusic: boolean;
  selectedMusicTrack: SharedMusicTrack | null;
  ugcClips: VideoClipMetadata[];
  demoClips: VideoClipMetadata[];
  selectedUgcIds: string[];
  selectedDemoId: string | null;
  selectedUgcTrimRangesByClipId: Record<string, VideoTrimRange>;
  selectedDemoTrimRange: VideoTrimRange | null;
  onLoadClip: (id: string) => Promise<VideoClip | null>;
  onSelectUgc: (id: string) => void;
  onSelectDemo: (id: string) => void;
  onUpdateUgcTrim: (
    clip: VideoClipMetadata,
    trimRange: VideoTrimRange,
  ) => void;
  onUpdateDemoTrim: (
    clip: VideoClipMetadata,
    trimRange: VideoTrimRange,
  ) => void;
  canStitch: boolean;
  isStitching: boolean;
  onAddMusicChange: (addMusic: boolean) => void;
  onSelectMusicTrack: (track: SharedMusicTrack) => void | Promise<void>;
  onStitch: () => void;
};

export function ClipPickerPanel({
  addMusic,
  selectedMusicTrack,
  ugcClips,
  demoClips,
  selectedUgcIds,
  selectedDemoId,
  selectedUgcTrimRangesByClipId,
  selectedDemoTrimRange,
  onLoadClip,
  onSelectUgc,
  onSelectDemo,
  onUpdateUgcTrim,
  onUpdateDemoTrim,
  canStitch,
  isStitching,
  onAddMusicChange,
  onSelectMusicTrack,
  onStitch,
}: ClipPickerPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const filteredUgcClips = useMemo(
    () => filterClipsBySearchQuery(ugcClips, searchQuery),
    [searchQuery, ugcClips],
  );
  const filteredDemoClips = useMemo(
    () => filterClipsBySearchQuery(demoClips, searchQuery),
    [demoClips, searchQuery],
  );

  return (
    <Panel className="p-4">
      <div className="mb-4 grid gap-3 border-b border-border pb-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
        <ClipPickerActionBar
          addMusic={addMusic}
          canStitch={canStitch}
          selectedMusicTrack={selectedMusicTrack}
          selectedUgcCount={selectedUgcIds.length}
          isStitching={isStitching}
          onAddMusicChange={onAddMusicChange}
          onSelectMusicTrack={onSelectMusicTrack}
          onStitch={onStitch}
        />
        <SearchInput
          label="Search clip picker videos"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search UGC and demo videos"
        />
      </div>
      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <UgcClipSelector
          key={`ugc-${searchQuery}`}
          clips={filteredUgcClips}
          selectedIds={selectedUgcIds}
          selectedTrimRangesByClipId={selectedUgcTrimRangesByClipId}
          onLoadClip={onLoadClip}
          onSelect={onSelectUgc}
          onUpdateTrim={onUpdateUgcTrim}
        />
        <DemoClipSelector
          key={`demo-${searchQuery}`}
          clips={filteredDemoClips}
          selectedId={selectedDemoId}
          selectedTrimRange={selectedDemoTrimRange}
          onLoadClip={onLoadClip}
          onSelect={onSelectDemo}
          onUpdateTrim={onUpdateDemoTrim}
        />
      </div>
    </Panel>
  );
}
