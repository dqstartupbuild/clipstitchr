"use client";

import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";
import { StitchCard } from "@/app/_components/dashboard/StitchCard";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";

type StitchesSectionProps = {
  stitches: Stitch[];
  emptyDescription?: string;
  emptyTitle?: string;
  onDelete: (id: string) => void | Promise<void>;
};

export function StitchesSection({
  stitches,
  emptyDescription = "Stitch a video after you have at least one UGC clip and one demo video.",
  emptyTitle = "No stitches yet",
  onDelete,
}: StitchesSectionProps) {
  return (
    <section id="stitches">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary"></h2>
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
