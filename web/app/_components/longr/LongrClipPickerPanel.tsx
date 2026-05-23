"use client";

import { useMemo, useState } from "react";
import { SourcePlaybackRateControls } from "@/app/_components/controls/SourcePlaybackRateControls";
import { LongrClipLibraryCard } from "@/app/_components/longr/LongrClipLibraryCard";
import { LongrDurationMeter } from "@/app/_components/longr/LongrDurationMeter";
import { ProductFilterSelect } from "@/app/_components/products/ProductFilterSelect";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import { SearchInput } from "@/app/_components/ui/SearchInput";
import { longrMaxDurationSeconds } from "@/lib/clipstitchr/constants/longrMaxDurationSeconds";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import { filterClipsBySearchQuery } from "@/lib/clipstitchr/utils/filterClipsBySearchQuery";
import { getClipPlaybackRate } from "@/lib/clipstitchr/utils/getClipPlaybackRate";
import { getDefaultVideoTrimRange } from "@/lib/clipstitchr/utils/getDefaultVideoTrimRange";
import { getPlaybackRateDuration } from "@/lib/clipstitchr/utils/getPlaybackRateDuration";

type LongrClipPickerPanelProps = {
  clips: VideoClipMetadata[];
  demoPlaybackRate: VideoPlaybackRate;
  duration: number;
  products: ProductProfile[];
  demoProductFilterId: string;
  hasMoreClips?: boolean;
  isBuilding: boolean;
  isLoadingMoreClips?: boolean;
  selectedClipIds: string[];
  ugcPlaybackRate: VideoPlaybackRate;
  onAddClip: (clip: VideoClipMetadata) => void;
  onBuild: () => void;
  onDemoPlaybackRateChange: (playbackRate: VideoPlaybackRate) => void;
  onDemoProductFilterChange: (productId: string) => void;
  onLoadPoster?: (id: string) => Promise<Blob | null>;
  onLoadMoreClips?: () => void;
  onRemoveClip: (clipId: string) => void;
  onUgcPlaybackRateChange: (playbackRate: VideoPlaybackRate) => void;
};

export function LongrClipPickerPanel({
  clips,
  demoPlaybackRate,
  duration,
  products,
  demoProductFilterId,
  hasMoreClips = false,
  isBuilding,
  isLoadingMoreClips = false,
  selectedClipIds,
  ugcPlaybackRate,
  onAddClip,
  onBuild,
  onDemoPlaybackRateChange,
  onDemoProductFilterChange,
  onLoadPoster,
  onLoadMoreClips,
  onRemoveClip,
  onUgcPlaybackRateChange,
}: LongrClipPickerPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const filteredClips = useMemo(
    () => filterClipsBySearchQuery(clips, searchQuery),
    [clips, searchQuery],
  );
  const productNamesById = useMemo(
    () => new Map(products.map((product) => [product.id, product.name])),
    [products],
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
      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_160px] lg:items-end">
        <SearchInput
          label="Search Longr source clips"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search UGC and demo videos"
        />
        <ProductFilterSelect
          products={products}
          label="Demo product"
          value={demoProductFilterId}
          onChange={onDemoProductFilterChange}
        />
        <LongrDurationMeter duration={duration} />
      </div>
      <SourcePlaybackRateControls
        demoPlaybackRate={demoPlaybackRate}
        disabled={isBuilding}
        ugcPlaybackRate={ugcPlaybackRate}
        onDemoPlaybackRateChange={onDemoPlaybackRateChange}
        onUgcPlaybackRateChange={onUgcPlaybackRateChange}
      />
      <div className="mt-4 grid max-h-[560px] gap-3 overflow-y-auto pr-1">
        {filteredClips.map((clip) => {
          const isSelected = selectedClipIds.includes(clip.id);
          const clipPlaybackRate = getClipPlaybackRate(clip.clipType, {
            demoPlaybackRate,
            ugcPlaybackRate,
          });
          const clipDuration = getPlaybackRateDuration(
            getDefaultVideoTrimRange(clip),
            clipPlaybackRate,
          );

          return (
            <LongrClipLibraryCard
              key={clip.id}
              clip={clip}
              productName={
                clip.productId ? productNamesById.get(clip.productId) : undefined
              }
              disabled={duration + clipDuration > longrMaxDurationSeconds}
              playbackRate={clipPlaybackRate}
              isSelected={isSelected}
              onLoadPoster={onLoadPoster}
              onAdd={onAddClip}
              onRemove={(selectedClip) => onRemoveClip(selectedClip.id)}
            />
          );
        })}
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
    </Panel>
  );
}
