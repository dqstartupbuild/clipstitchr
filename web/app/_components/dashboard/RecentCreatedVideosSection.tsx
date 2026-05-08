"use client";

import { CreatedVideoCard } from "@/app/_components/dashboard/CreatedVideoCard";
import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";
import { SecondaryButtonLink } from "@/app/_components/SecondaryButtonLink";
import type { CreatedVideo } from "@/lib/clipstitchr/types/CreatedVideo";

type RecentCreatedVideosSectionProps = {
  createdVideos: CreatedVideo[];
  onDelete: (id: string) => void | Promise<void>;
};

export function RecentCreatedVideosSection({
  createdVideos,
  onDelete,
}: RecentCreatedVideosSectionProps) {
  return (
    <section id="recent-created-videos">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-text-primary">
          Recent Stitches
        </h2>
        <SecondaryButtonLink
          href="/dashboard/created"
          className="h-9 px-3 text-xs"
        >
          See all
        </SecondaryButtonLink>
      </div>
      {createdVideos.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {createdVideos.map((createdVideo) => (
            <CreatedVideoCard
              key={createdVideo.id}
              createdVideo={createdVideo}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <DashboardEmptyState
          title="No created videos yet"
          description="Stitch a video after you have at least one UGC clip and one demo video."
        />
      )}
    </section>
  );
}
