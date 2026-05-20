"use client";

import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";
import { LongrVideoCard } from "@/app/_components/dashboard/LongrVideoCard";
import { Button } from "@/app/_components/ui/Button";
import type { LongrVideo } from "@/lib/clipstitchr/types/LongrVideo";
import type { LongrVideoMetadata } from "@/lib/clipstitchr/types/LongrVideoMetadata";

type LongrVideosSectionProps = {
  emptyDescription?: string;
  emptyTitle?: string;
  hasMoreItems?: boolean;
  id?: string;
  isLoadingMoreItems?: boolean;
  longrVideos: LongrVideoMetadata[];
  onDelete: (id: string) => void | Promise<void>;
  onLoadLongrVideo: (id: string) => Promise<LongrVideo | null>;
  onLoadMoreItems?: () => void;
  onLoadPoster?: (id: string) => Promise<Blob | null>;
  title?: string;
};

export function LongrVideosSection({
  emptyDescription = "Build a long-form video from Longr to save it here.",
  emptyTitle = "No Longs yet",
  hasMoreItems = false,
  id = "longr",
  isLoadingMoreItems = false,
  longrVideos,
  onDelete,
  onLoadLongrVideo,
  onLoadMoreItems,
  onLoadPoster,
  title = "Longs",
}: LongrVideosSectionProps) {
  return (
    <section id={id}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">{title}</h2>
        <span className="text-sm font-semibold text-text-tertiary">
          {longrVideos.length}
        </span>
      </div>
      {longrVideos.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {longrVideos.map((longrVideo) => (
            <LongrVideoCard
              key={longrVideo.id}
              longrVideo={longrVideo}
              onDelete={onDelete}
              onLoadLongrVideo={onLoadLongrVideo}
              onLoadPoster={onLoadPoster}
            />
          ))}
        </div>
      ) : (
        <DashboardEmptyState
          title={emptyTitle}
          description={emptyDescription}
        />
      )}
      {hasMoreItems && onLoadMoreItems ? (
        <div className="mt-4 flex justify-center">
          <Button
            type="button"
            variant="secondary"
            isLoading={isLoadingMoreItems}
            onClick={onLoadMoreItems}
          >
            Load more Longs
          </Button>
        </div>
      ) : null}
    </section>
  );
}
