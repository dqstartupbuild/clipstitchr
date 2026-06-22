"use client";

import { RefreshCw } from "lucide-react";
import { OnboardingClipReviewCard } from "@/app/_components/onboarding/OnboardingClipReviewCard";
import { IconButton } from "@/app/_components/ui/IconButton";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

type OnboardingClipReviewListProps = {
  clips: VideoClipMetadata[];
  emptyDescription: string;
  emptyTitle: string;
  title: string;
  onRefresh: () => void | Promise<void>;
};

export function OnboardingClipReviewList({
  clips,
  emptyDescription,
  emptyTitle,
  title,
  onRefresh,
}: OnboardingClipReviewListProps) {
  const scoredCount = clips.filter((clip) => clip.performanceScore).length;
  const pendingCount = clips.length - scoredCount;

  return (
    <section className="rounded-lg border border-border bg-surface-muted p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-text-primary">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-text-secondary">
            {clips.length
              ? `${scoredCount} scored, ${pendingCount} still processing.`
              : emptyDescription}
          </p>
        </div>
        <IconButton
          type="button"
          label="Refresh clips"
          icon={<RefreshCw aria-hidden className="h-4 w-4" />}
          onClick={() => {
            void onRefresh();
          }}
        />
      </div>
      {clips.length ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {clips.map((clip) => (
            <OnboardingClipReviewCard key={clip.id} clip={clip} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-border bg-white p-5">
          <p className="text-sm font-bold text-text-primary">{emptyTitle}</p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {emptyDescription}
          </p>
        </div>
      )}
    </section>
  );
}
