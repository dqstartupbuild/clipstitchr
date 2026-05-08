"use client";

import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";
import { StitchCard } from "@/app/_components/dashboard/StitchCard";
import { SecondaryButtonLink } from "@/app/_components/SecondaryButtonLink";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";

type RecentStitchesSectionProps = {
  stitches: Stitch[];
  onDelete: (id: string) => void | Promise<void>;
};

export function RecentStitchesSection({
  stitches,
  onDelete,
}: RecentStitchesSectionProps) {
  return (
    <section id="recent-stitches">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-text-primary">
          Recent Stitches
        </h2>
        <SecondaryButtonLink
          href="/dashboard/stitches"
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
            />
          ))}
        </div>
      ) : (
        <DashboardEmptyState
          title="No stitches yet"
          description="Stitch a video after you have at least one UGC clip and one demo video."
        />
      )}
    </section>
  );
}
