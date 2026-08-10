"use client";

import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";
import { SwiprSwipeCard } from "@/app/_components/dashboard/SwiprSwipeCard";
import { SecondaryButtonLink } from "@/app/_components/SecondaryButtonLink";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";

type RecentSwipesSectionProps = {
  backgrounds: SwiprBackgroundAsset[];
  swipes: SwiprSwipe[];
  onLoadBackgroundBlob: (id: string) => Promise<Blob>;
  onLoadPoster?: (id: string) => Promise<Blob | null>;
  onDelete: (id: string) => void | Promise<void>;
  onSocialPublishingScheduled?: () => void | Promise<void>;
  onUpdatePostedStatus?: (
    swipe: SwiprSwipe,
    isPosted: boolean,
  ) => void | Promise<void>;
};

export function RecentSwipesSection({
  backgrounds,
  swipes,
  onLoadBackgroundBlob,
  onLoadPoster,
  onDelete,
  onSocialPublishingScheduled,
  onUpdatePostedStatus,
}: RecentSwipesSectionProps) {
  const backgroundsById = new Map(
    backgrounds.map((background) => [background.id, background]),
  );
  return (
    <section id="recent-swipes" className="dashboard-content-section">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-text-primary">
          Carousel drafts
        </h2>
        <SecondaryButtonLink
          href="/dashboard/library?tab=swipes"
          className="h-9 px-3 text-xs"
        >
          See Swipes
        </SecondaryButtonLink>
      </div>
      {swipes.length ? (
        <div className="grid justify-items-center gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {swipes.map((swipe) => {
            return (
              <SwiprSwipeCard
                key={swipe.id}
                background={backgroundsById.get(swipe.backgroundId)}
                backgrounds={backgrounds}
                swipe={swipe}
                onLoadBackgroundBlob={onLoadBackgroundBlob}
                onLoadPoster={onLoadPoster}
                onDelete={onDelete}
                onSocialPublishingScheduled={onSocialPublishingScheduled}
                onUpdatePostedStatus={onUpdatePostedStatus}
              />
            );
          })}
        </div>
      ) : (
        <DashboardEmptyState
          title="No carousel drafts yet"
          description="Save a Swipe from Swipr when an idea works better as slides than another video."
        />
      )}
    </section>
  );
}
