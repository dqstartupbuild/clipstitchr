"use client";

import { CreatedVideoCard } from "@/app/_components/dashboard/CreatedVideoCard";
import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";
import type { CreatedVideo } from "@/lib/clipstitchr/types/CreatedVideo";

type CreatedVideosSectionProps = {
  createdVideos: CreatedVideo[];
  emptyDescription?: string;
  emptyTitle?: string;
  onDelete: (id: string) => void | Promise<void>;
};

export function CreatedVideosSection({
  createdVideos,
  emptyDescription = "Stitch a video after you have at least one UGC clip and one demo video.",
  emptyTitle = "No created videos yet",
  onDelete,
}: CreatedVideosSectionProps) {
  return (
    <section id="created-videos">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary"></h2>
        <span className="text-sm font-semibold text-text-tertiary">
          {createdVideos.length}
        </span>
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
          title={emptyTitle}
          description={emptyDescription}
        />
      )}
    </section>
  );
}
