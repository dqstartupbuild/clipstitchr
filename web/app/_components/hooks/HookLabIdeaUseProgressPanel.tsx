"use client";

import { ArrowRight } from "lucide-react";
import { HookLabIdeaUseProgressSkeleton } from "@/app/_components/hooks/HookLabIdeaUseProgressSkeleton";
import { HookLabIdeaUseVariantRow } from "@/app/_components/hooks/HookLabIdeaUseVariantRow";
import { PrimaryButtonLink } from "@/app/_components/PrimaryButtonLink";
import { useHookLabIdeaUse } from "@/lib/clipstitchr/hooks/useHookLabIdeaUse";
import { useHookLabIdeaUseLifecycleAnalytics } from "@/lib/clipstitchr/hooks/useHookLabIdeaUseLifecycleAnalytics";
import { getHookLabIdeaUseStatusMessage } from "@/lib/clipstitchr/utils/getHookLabIdeaUseStatusMessage";

type HookLabIdeaUseProgressPanelProps = {
  useId: string;
};

export function HookLabIdeaUseProgressPanel({
  useId,
}: HookLabIdeaUseProgressPanelProps) {
  const { isLoading, progress } = useHookLabIdeaUse(useId);

  useHookLabIdeaUseLifecycleAnalytics(progress);

  if (isLoading) {
    return <HookLabIdeaUseProgressSkeleton />;
  }

  if (!progress) {
    return (
      <div
        aria-live="polite"
        className="mt-4 rounded-lg border border-border bg-surface-muted p-3"
      >
        <p className="text-pretty text-xs font-semibold text-text-secondary">
          This run is not available yet. Your finished Stitches will still show
          up in the Library.
        </p>
      </div>
    );
  }

  const terminalCount =
    progress.completedVariantCount + progress.failedVariantCount;

  return (
    <section
      aria-live="polite"
      aria-label="Current idea use progress"
      className="mt-4 rounded-lg border border-accent/30 bg-surface-muted p-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-accent-dark">Current use</p>
          <p className="mt-1 text-pretty text-sm font-semibold text-text-primary">
            {getHookLabIdeaUseStatusMessage(progress)}
          </p>
        </div>
        <span className="shrink-0 rounded-md border border-border bg-white px-2 py-1 text-xs font-bold text-text-secondary tabular-nums">
          {progress.completedVariantCount}/{progress.variationCount} ready
        </span>
      </div>
      <progress
        aria-label={`${terminalCount} of ${progress.variationCount} versions finished`}
        className="mt-3 h-2 w-full accent-accent"
        max={1}
        value={progress.progress}
      />
      <ul className="mt-3 grid gap-2">
        {progress.variants.map((variant) => (
          <HookLabIdeaUseVariantRow key={variant.id} variant={variant} />
        ))}
      </ul>
      {progress.completedVariantCount > 0 ? (
        <PrimaryButtonLink
          className="mt-3 w-full"
          href="/dashboard/library?tab=stitches"
          icon={<ArrowRight aria-hidden className="size-4" />}
        >
          Review Stitch
        </PrimaryButtonLink>
      ) : null}
    </section>
  );
}
