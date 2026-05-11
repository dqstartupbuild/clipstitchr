"use client";

import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";
import { SwiprSwipeCard } from "@/app/_components/dashboard/SwiprSwipeCard";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";

type SwiprSwipesSectionProps = {
  backgrounds: SwiprBackgroundAsset[];
  emptyDescription?: string;
  emptyTitle?: string;
  id?: string;
  swipes: SwiprSwipe[];
  title?: string;
  onDelete: (id: string) => void | Promise<void>;
};

export function SwiprSwipesSection({
  backgrounds,
  emptyDescription = "Save a carousel from Swipr to reuse and download it later.",
  emptyTitle = "No Swipes yet",
  id = "swipes",
  swipes,
  title = "Swipes",
  onDelete,
}: SwiprSwipesSectionProps) {
  const backgroundsById = new Map(
    backgrounds.map((background) => [background.id, background]),
  );
  const visibleSwipes = swipes.filter((swipe) =>
    backgroundsById.has(swipe.backgroundId),
  );

  return (
    <section id={id}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">{title}</h2>
        <span className="text-sm font-semibold text-text-tertiary">
          {visibleSwipes.length}
        </span>
      </div>
      {visibleSwipes.length ? (
        <div className="grid justify-items-center gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {visibleSwipes.map((swipe) => {
            const background = backgroundsById.get(swipe.backgroundId);

            if (!background) {
              return null;
            }

            return (
              <SwiprSwipeCard
                key={swipe.id}
                background={background}
                swipe={swipe}
                onDelete={onDelete}
              />
            );
          })}
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
