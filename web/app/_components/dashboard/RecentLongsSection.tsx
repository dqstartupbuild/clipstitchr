"use client";

import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";
import { LongrVideoCard } from "@/app/_components/dashboard/LongrVideoCard";
import { SecondaryButtonLink } from "@/app/_components/SecondaryButtonLink";
import type { LongrVideo } from "@/lib/clipstitchr/types/LongrVideo";
import type { LongrVideoMetadata } from "@/lib/clipstitchr/types/LongrVideoMetadata";

type RecentLongsSectionProps = {
  longrVideos: LongrVideoMetadata[];
  onDelete: (id: string) => void | Promise<void>;
  onLoadLongrVideo: (id: string) => Promise<LongrVideo | null>;
  onLoadPoster?: (id: string) => Promise<Blob | null>;
};

export function RecentLongsSection({
  longrVideos,
  onDelete,
  onLoadLongrVideo,
  onLoadPoster,
}: RecentLongsSectionProps) {
  return (
    <section id="recent-longs">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-text-primary">Recent Longs</h2>
        <SecondaryButtonLink
          href="/dashboard/uploads?tab=longr"
          className="h-9 px-3 text-xs"
        >
          See all
        </SecondaryButtonLink>
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
          title="No Longs yet"
          description="Build a long-form video from Longr to save it here."
        />
      )}
    </section>
  );
}
