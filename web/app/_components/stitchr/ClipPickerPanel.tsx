"use client";

import { useMemo, useState } from "react";
import { SourcePlaybackRateControls } from "@/app/_components/controls/SourcePlaybackRateControls";
import { ClipAudioControls } from "@/app/_components/stitchr/ClipAudioControls";
import { ClipPickerActionBar } from "@/app/_components/stitchr/ClipPickerActionBar";
import { DemoClipSelector } from "@/app/_components/stitchr/DemoClipSelector";
import { UgcClipSelector } from "@/app/_components/stitchr/UgcClipSelector";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import { ProductFilterSelect } from "@/app/_components/products/ProductFilterSelect";
import { SearchInput } from "@/app/_components/ui/SearchInput";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { StitchrMode } from "@/lib/clipstitchr/types/StitchrMode";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { filterClipsBySearchQuery } from "@/lib/clipstitchr/utils/filterClipsBySearchQuery";

type ClipPickerPanelProps = {
  selectedMusicTrack: SharedMusicTrack | null;
  mode: StitchrMode;
  demoPlaybackRate: VideoPlaybackRate;
  includeDemoAudio: boolean;
  includeUgcAudio: boolean;
  hasMoreClips?: boolean;
  isLoadingMoreClips?: boolean;
  products: ProductProfile[];
  ugcClips: VideoClipMetadata[];
  demoClips: VideoClipMetadata[];
  demoProductFilterId: string;
  selectedUgcIds: string[];
  selectedDemoId: string | null;
  selectedDemoIds: string[];
  selectedLongrCount: number;
  selectedUgcTrimRangesByClipId: Record<string, VideoTrimRange>;
  selectedDemoTrimRangesByClipId: Record<string, VideoTrimRange>;
  selectedDemoTrimRange: VideoTrimRange | null;
  ugcPlaybackRate: VideoPlaybackRate;
  onLoadClip: (id: string) => Promise<VideoClip | null>;
  onLoadPoster?: (id: string) => Promise<Blob | null>;
  onSelectUgc: (id: string) => void;
  onSelectDemo: (id: string) => void;
  onDemoProductFilterChange: (productId: string) => void;
  onModeChange: (mode: StitchrMode) => void;
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
  onDemoPlaybackRateChange: (playbackRate: VideoPlaybackRate) => void;
  onIncludeDemoAudioChange: (includeDemoAudio: boolean) => void;
  onIncludeUgcAudioChange: (includeUgcAudio: boolean) => void;
  onLoadMoreClips?: () => void;
  onSelectMusicTrack: (track: SharedMusicTrack) => void | Promise<void>;
  onStitch: () => void;
  onUgcPlaybackRateChange: (playbackRate: VideoPlaybackRate) => void;
};

export function ClipPickerPanel({
  selectedMusicTrack,
  mode,
  demoPlaybackRate,
  includeDemoAudio,
  includeUgcAudio,
  hasMoreClips = false,
  isLoadingMoreClips = false,
  products,
  ugcClips,
  demoClips,
  demoProductFilterId,
  selectedUgcIds,
  selectedDemoId,
  selectedDemoIds,
  selectedLongrCount,
  selectedUgcTrimRangesByClipId,
  selectedDemoTrimRangesByClipId,
  selectedDemoTrimRange,
  ugcPlaybackRate,
  onLoadClip,
  onLoadPoster,
  onSelectUgc,
  onSelectDemo,
  onDemoProductFilterChange,
  onModeChange,
  onUpdateUgcTrim,
  onUpdateDemoTrim,
  canStitch,
  isStitching,
  onDemoPlaybackRateChange,
  onIncludeDemoAudioChange,
  onIncludeUgcAudioChange,
  onLoadMoreClips,
  onSelectMusicTrack,
  onStitch,
  onUgcPlaybackRateChange,
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
      <div className="mb-4 grid gap-3 border-b border-border pb-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-end">
        <ClipPickerActionBar
          canStitch={canStitch}
          mode={mode}
          selectedUgcCount={selectedUgcIds.length}
          selectedLongrCount={selectedLongrCount}
          isStitching={isStitching}
          onModeChange={onModeChange}
          onStitch={onStitch}
        />
        <div className="grid gap-3 sm:grid-cols-2 sm:items-end">
          <ProductFilterSelect
            products={products}
            label="Demo product"
            value={demoProductFilterId}
            onChange={onDemoProductFilterChange}
          />
          <SearchInput
            label="Search clip picker videos"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search Hook/UGC clips and demos"
          />
        </div>
      </div>
      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <UgcClipSelector
          key={`ugc-${searchQuery}`}
          clips={filteredUgcClips}
          selectedIds={selectedUgcIds}
          selectedTrimRangesByClipId={selectedUgcTrimRangesByClipId}
          onLoadClip={onLoadClip}
          onLoadPoster={onLoadPoster}
          onSelect={onSelectUgc}
          onUpdateTrim={onUpdateUgcTrim}
        />
        <DemoClipSelector
          key={`demo-${searchQuery}`}
          clips={filteredDemoClips}
          products={products}
          selectionMode={mode === "longr" ? "multiple" : "single"}
          selectedId={selectedDemoId}
          selectedIds={selectedDemoIds}
          selectedTrimRange={selectedDemoTrimRange}
          selectedTrimRangesByClipId={selectedDemoTrimRangesByClipId}
          onLoadClip={onLoadClip}
          onLoadPoster={onLoadPoster}
          onSelect={onSelectDemo}
          onUpdateTrim={onUpdateDemoTrim}
        />
      </div>
      {hasMoreClips && onLoadMoreClips ? (
        <div className="mt-4 flex justify-center">
          <Button
            type="button"
            variant="secondary"
            isLoading={isLoadingMoreClips}
            onClick={onLoadMoreClips}
          >
            Load more clips
          </Button>
        </div>
      ) : null}
      <ClipAudioControls
        includeDemoAudio={includeDemoAudio}
        includeUgcAudio={includeUgcAudio}
        isStitching={isStitching}
        selectedMusicTrack={selectedMusicTrack}
        onIncludeDemoAudioChange={onIncludeDemoAudioChange}
        onIncludeUgcAudioChange={onIncludeUgcAudioChange}
        onSelectMusicTrack={onSelectMusicTrack}
      />
      <SourcePlaybackRateControls
        demoPlaybackRate={demoPlaybackRate}
        disabled={isStitching}
        ugcPlaybackRate={ugcPlaybackRate}
        onDemoPlaybackRateChange={onDemoPlaybackRateChange}
        onUgcPlaybackRateChange={onUgcPlaybackRateChange}
      />
    </Panel>
  );
}
