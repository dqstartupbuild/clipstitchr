import { Gauge } from "lucide-react";
import type { ClipPerformanceScore } from "@/lib/clipstitchr/types/ClipPerformanceScore";
import { getClipPerformanceScoreLabel } from "@/lib/clipstitchr/utils/getClipPerformanceScoreLabel";

type ClipPerformanceScoreBadgeProps = {
  score?: ClipPerformanceScore;
};

export function ClipPerformanceScoreBadge({
  score,
}: ClipPerformanceScoreBadgeProps) {
  if (!score) {
    return null;
  }

  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-1 rounded-md border border-purple-200 bg-purple-50 px-2 py-1 text-[11px] font-bold leading-none text-accent-dark">
      <Gauge aria-hidden className="h-3 w-3 shrink-0" />
      <span className="truncate">
        {getClipPerformanceScoreLabel(score.overall)} - {score.overall}
      </span>
    </span>
  );
}
