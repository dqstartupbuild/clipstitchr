"use client";

import { useMemo, useState } from "react";
import { ClipPickerActionBar } from "@/app/_components/create/ClipPickerActionBar";
import { DemoClipSelector } from "@/app/_components/create/DemoClipSelector";
import { UgcClipSelector } from "@/app/_components/create/UgcClipSelector";
import { Panel } from "@/app/_components/ui/Panel";
import { SearchInput } from "@/app/_components/ui/SearchInput";
import type { VideoClip } from "@/lib/clipr/types/VideoClip";
import type { VideoTrimRange } from "@/lib/clipr/types/VideoTrimRange";
import { filterClipsByName } from "@/lib/clipr/utils/filterClipsByName";

type ClipPickerPanelProps = {
  ugcClips: VideoClip[];
  demoClips: VideoClip[];
  selectedUgcId: string | null;
  selectedDemoId: string | null;
  selectedUgcTrimRange: VideoTrimRange | null;
  selectedDemoTrimRange: VideoTrimRange | null;
  onSelectUgc: (id: string) => void;
  onSelectDemo: (id: string) => void;
  onEditUgcTrim: (clip: VideoClip) => void;
  onEditDemoTrim: (clip: VideoClip) => void;
  canCreate: boolean;
  isCreating: boolean;
  onCreate: () => void;
};

export function ClipPickerPanel({
  ugcClips,
  demoClips,
  selectedUgcId,
  selectedDemoId,
  selectedUgcTrimRange,
  selectedDemoTrimRange,
  onSelectUgc,
  onSelectDemo,
  onEditUgcTrim,
  onEditDemoTrim,
  canCreate,
  isCreating,
  onCreate,
}: ClipPickerPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const filteredUgcClips = useMemo(
    () => filterClipsByName(ugcClips, searchQuery),
    [searchQuery, ugcClips],
  );
  const filteredDemoClips = useMemo(
    () => filterClipsByName(demoClips, searchQuery),
    [demoClips, searchQuery],
  );

  return (
    <Panel className="p-5">
      <ClipPickerActionBar
        canCreate={canCreate}
        isCreating={isCreating}
        onCreate={onCreate}
      />
      <SearchInput
        label="Search clip picker videos"
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search UGC and demo videos"
        className="mb-5"
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <UgcClipSelector
          key={`ugc-${searchQuery}`}
          clips={filteredUgcClips}
          selectedId={selectedUgcId}
          selectedTrimRange={selectedUgcTrimRange}
          onSelect={onSelectUgc}
          onEditTrim={onEditUgcTrim}
        />
        <DemoClipSelector
          key={`demo-${searchQuery}`}
          clips={filteredDemoClips}
          selectedId={selectedDemoId}
          selectedTrimRange={selectedDemoTrimRange}
          onSelect={onSelectDemo}
          onEditTrim={onEditDemoTrim}
        />
      </div>
    </Panel>
  );
}
