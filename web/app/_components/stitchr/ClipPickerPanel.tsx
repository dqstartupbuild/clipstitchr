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
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { filterClipsBySearchQuery } from "@/lib/clipstitchr/utils/filterClipsBySearchQuery";

type ClipPickerPanelProps = {
  addMusic: boolean;
  selectedMusicTrack: SharedMusicTrack | null;
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
  selectedUgcTrimRangesByClipId: Record<string, VideoTrimRange>;
  selectedDemoTrimRange: VideoTrimRange | null;
  ugcPlaybackRate: VideoPlaybackRate;
  onLoadClip: (id: string) => Promise<VideoClip | null>;
  onLoadPoster?: (id: string) => Promise<Blob | null>;
  onSelectUgc: (id: string) => void;
  onSelectDemo: (id: string) => void;
  onDemoProductFilterChange: (productId: string) => void;
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
  onDemoPlaybackRateChange: (playbackRate: VideoPlaybackRate) => void;
  onIncludeDemoAudioChange: (includeDemoAudio: boolean) => void;
  onIncludeUgcAudioChange: (includeUgcAudio: boolean) => void;
  onLoadMoreClips?: () => void;
  onSelectMusicTrack: (track: SharedMusicTrack) => void | Promise<void>;
  onStitch: () => void;
  onUgcPlaybackRateChange: (playbackRate: VideoPlaybackRate) => void;
};

export function ClipPickerPanel({
  addMusic,
  selectedMusicTrack,
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
  selectedUgcTrimRangesByClipId,
  selectedDemoTrimRange,
  ugcPlaybackRate,
  onLoadClip,
  onLoadPoster,
  onSelectUgc,
  onSelectDemo,
  onDemoProductFilterChange,
  onUpdateUgcTrim,
  onUpdateDemoTrim,
  canStitch,
  isStitching,
  onAddMusicChange,
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
          selectedUgcCount={selectedUgcIds.length}
          isStitching={isStitching}
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
            placeholder="Search UGC and demo videos"
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
          selectedId={selectedDemoId}
          selectedTrimRange={selectedDemoTrimRange}
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
        addMusic={addMusic}
        includeDemoAudio={includeDemoAudio}
        includeUgcAudio={includeUgcAudio}
        isStitching={isStitching}
        selectedMusicTrack={selectedMusicTrack}
        onAddMusicChange={onAddMusicChange}
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
