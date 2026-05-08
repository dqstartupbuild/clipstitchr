"use client";

import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";
import { VideoClipCard } from "@/app/_components/dashboard/VideoClipCard";
import { SecondaryButtonLink } from "@/app/_components/SecondaryButtonLink";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

type RecentUploadsSectionProps = {
  clips: VideoClip[];
  onDelete: (id: string) => void | Promise<void>;
  onRename: (clip: VideoClip, name: string) => void | Promise<void>;
  onUpdateTrim: (
    clip: VideoClip,
    trimRange: VideoTrimRange,
  ) => void | Promise<void>;
};

export function RecentUploadsSection({
  clips,
  onDelete,
  onRename,
  onUpdateTrim,
}: RecentUploadsSectionProps) {
  return (
    <section id="recent-uploads">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-text-primary">Recent Uploads</h2>
        <SecondaryButtonLink
          href="/dashboard/uploads"
          className="h-9 px-3 text-xs"
        >
          See all
        </SecondaryButtonLink>
      </div>
      {clips.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {clips.map((clip) => (
            <VideoClipCard
              key={clip.id}
              clip={clip}
              onDelete={onDelete}
              onRename={onRename}
              onUpdateTrim={onUpdateTrim}
            />
          ))}
        </div>
      ) : (
        <DashboardEmptyState
          title="No uploads yet"
          description="Upload UGC clips or demo videos to see recent files here."
        />
      )}
    </section>
  );
}
