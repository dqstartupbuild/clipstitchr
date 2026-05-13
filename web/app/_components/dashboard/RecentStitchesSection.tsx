"use client";

import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";
import { StitchCard } from "@/app/_components/dashboard/StitchCard";
import { SecondaryButtonLink } from "@/app/_components/SecondaryButtonLink";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { StitchMusicMetadata } from "@/lib/clipstitchr/types/StitchMusicMetadata";

type RecentStitchesSectionProps = {
  stitches: Stitch[];
  onDelete: (id: string) => void | Promise<void>;
  onGenerateMusic: (stitch: Stitch) => Promise<StitchMusicMetadata | null>;
  onUpdateMusic: (
    stitch: Stitch,
    music: StitchMusicMetadata | null,
  ) => void | Promise<void>;
};

export function RecentStitchesSection({
  stitches,
  onDelete,
  onGenerateMusic,
  onUpdateMusic,
}: RecentStitchesSectionProps) {
  return (
    <section id="recent-stitches">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-text-primary">
          Recent Stitches
        </h2>
        <SecondaryButtonLink
          href="/dashboard/uploads?tab=stitches"
          className="h-9 px-3 text-xs"
        >
          See all
        </SecondaryButtonLink>
      </div>
      {stitches.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stitches.map((stitch) => (
            <StitchCard
              key={stitch.id}
              stitch={stitch}
              onDelete={onDelete}
              onGenerateMusic={onGenerateMusic}
              onUpdateMusic={onUpdateMusic}
            />
          ))}
        </div>
      ) : (
        <DashboardEmptyState
          title="No stitches yet"
          description="Create your first stitch after you have at least one UGC and one product demo."
        />
      )}
    </section>
  );
}
