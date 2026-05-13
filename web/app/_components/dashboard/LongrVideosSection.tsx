"use client";

import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";
import { LongrVideoCard } from "@/app/_components/dashboard/LongrVideoCard";
import type { LongrVideo } from "@/lib/clipstitchr/types/LongrVideo";

type LongrVideosSectionProps = {
  emptyDescription?: string;
  emptyTitle?: string;
  id?: string;
  longrVideos: LongrVideo[];
  onDelete: (id: string) => void | Promise<void>;
  title?: string;
};

export function LongrVideosSection({
  emptyDescription = "Build a long-form video from Longr to save it here.",
  emptyTitle = "No Longr videos yet",
  id = "longr",
  longrVideos,
  onDelete,
  title = "Longr",
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
