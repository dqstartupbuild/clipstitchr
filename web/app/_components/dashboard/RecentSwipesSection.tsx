"use client";

import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";
import { SwiprSwipeCard } from "@/app/_components/dashboard/SwiprSwipeCard";
import { SecondaryButtonLink } from "@/app/_components/SecondaryButtonLink";
import type { SaveSwiprSwipeInput } from "@/lib/clipstitchr/types/SwiprLibraryValue";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";

type RecentSwipesSectionProps = {
  backgrounds: SwiprBackgroundAsset[];
  isSaving?: boolean;
  swipes: SwiprSwipe[];
  onLoadBackgroundBlob: (id: string) => Promise<Blob>;
  onLoadPoster?: (id: string) => Promise<Blob | null>;
  onDelete: (id: string) => void | Promise<void>;
  onSave: (input: SaveSwiprSwipeInput) => Promise<SwiprSwipe>;
};

export function RecentSwipesSection({
  backgrounds,
  isSaving = false,
  swipes,
  onLoadBackgroundBlob,
  onLoadPoster,
  onDelete,
  onSave,
}: RecentSwipesSectionProps) {
  const backgroundsById = new Map(
    backgrounds.map((background) => [background.id, background]),
  );
  const visibleSwipes = swipes.filter((swipe) =>
    backgroundsById.has(swipe.backgroundId),
  );

  return (
    <section id="recent-swipes">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-text-primary">Recent Swipes</h2>
        <SecondaryButtonLink
          href="/dashboard/uploads?tab=swipes"
          className="h-9 px-3 text-xs"
        >
          See all
        </SecondaryButtonLink>
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
                backgrounds={backgrounds}
                isSaving={isSaving}
                swipe={swipe}
                onLoadBackgroundBlob={onLoadBackgroundBlob}
                onLoadPoster={onLoadPoster}
                onDelete={onDelete}
                onSave={onSave}
              />
            );
          })}
        </div>
      ) : (
        <DashboardEmptyState
          title="No Swipes yet"
          description="Save a carousel from Swipr to reuse and download it later."
        />
      )}
    </section>
  );
}
