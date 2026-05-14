"use client";

import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";
import { StitchCard } from "@/app/_components/dashboard/StitchCard";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { StitchMusicMetadata } from "@/lib/clipstitchr/types/StitchMusicMetadata";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";

type StitchesSectionProps = {
  stitches: Stitch[];
  emptyDescription?: string;
  emptyTitle?: string;
  id?: string;
  title?: string;
  onDelete: (id: string) => void | Promise<void>;
  onGenerateMusic: (stitch: Stitch) => Promise<StitchMusicMetadata | null>;
  onLoadClip: (id: string) => Promise<VideoClip | null>;
  onUpdateMusic: (
    stitch: Stitch,
    music: StitchMusicMetadata | null,
  ) => void | Promise<void>;
  onUpdateTextOverlay: (
    stitch: Stitch,
    textOverlay: TextOverlay | null,
  ) => void | Promise<void>;
};

export function StitchesSection({
  stitches,
  emptyDescription = "Stitch a video after you have at least one UGC and one demo video.",
  emptyTitle = "No stitches yet",
  id = "stitches",
  title = "Stitches",
  onDelete,
  onGenerateMusic,
  onLoadClip,
  onUpdateMusic,
  onUpdateTextOverlay,
}: StitchesSectionProps) {
  return (
    <section id={id}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">{title}</h2>
        <span className="text-sm font-semibold text-text-tertiary">
          {stitches.length}
        </span>
      </div>
      {stitches.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stitches.map((stitch) => (
            <StitchCard
              key={stitch.id}
              stitch={stitch}
              onDelete={onDelete}
              onGenerateMusic={onGenerateMusic}
              onLoadClip={onLoadClip}
              onUpdateMusic={onUpdateMusic}
              onUpdateTextOverlay={onUpdateTextOverlay}
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
