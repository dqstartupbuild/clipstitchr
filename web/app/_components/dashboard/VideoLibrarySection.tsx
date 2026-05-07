"use client";

import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";
import { VideoClipCard } from "@/app/_components/dashboard/VideoClipCard";
import type { VideoClip } from "@/lib/clipr/types/VideoClip";

type VideoLibrarySectionProps = {
  id: string;
  title: string;
  clips: VideoClip[];
  emptyDescription: string;
  onDelete: (id: string) => void | Promise<void>;
  onRename: (clip: VideoClip, name: string) => void | Promise<void>;
};

export function VideoLibrarySection({
  id,
  title,
  clips,
  emptyDescription,
  onDelete,
  onRename,
}: VideoLibrarySectionProps) {
  return (
    <section id={id}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">{title}</h2>
        <span className="text-sm font-semibold text-text-tertiary">
          {clips.length}
        </span>
      </div>
      {clips.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {clips.map((clip) => (
            <VideoClipCard
              key={clip.id}
              clip={clip}
              onDelete={onDelete}
              onRename={onRename}
            />
          ))}
        </div>
      ) : (
        <DashboardEmptyState title="No videos yet" description={emptyDescription} />
      )}
    </section>
  );
}
