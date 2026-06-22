import { CheckCircle2, Clock3 } from "lucide-react";
import { ClipPerformanceScoreBadge } from "@/app/_components/dashboard/ClipPerformanceScoreBadge";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";

type OnboardingClipReviewCardProps = {
  clip: VideoClipMetadata;
};

export function OnboardingClipReviewCard({
  clip,
}: OnboardingClipReviewCardProps) {
  const hasScore = Boolean(clip.performanceScore);

  return (
    <article className="min-w-0 rounded-lg border border-border bg-white p-4">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="truncate text-sm font-bold text-text-primary">
            {clip.name}
          </h4>
          <p className="mt-1 text-xs font-semibold text-text-tertiary">
            {formatDuration(clip.duration)} . {clip.width}x{clip.height}
          </p>
        </div>
        {hasScore ? (
          <ClipPerformanceScoreBadge score={clip.performanceScore} />
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-surface-muted px-2 py-1 text-[11px] font-bold leading-none text-text-secondary">
            <Clock3 aria-hidden className="h-3 w-3" />
            Scoring
          </span>
        )}
      </div>
      {clip.performanceScore?.summary ? (
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          {clip.performanceScore.summary}
        </p>
      ) : (
        <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-text-secondary">
          <CheckCircle2
            aria-hidden
            className="mt-0.5 h-4 w-4 shrink-0 text-accent"
          />
          The clip is normalized. The score will appear when analysis finishes.
        </p>
      )}
      {clip.performanceScore?.bestUse ? (
        <p className="mt-3 rounded-md border border-border bg-surface-muted px-3 py-2 text-sm font-semibold text-text-primary">
          Best use: {clip.performanceScore.bestUse}
        </p>
      ) : null}
    </article>
  );
}
