import { Gauge } from "lucide-react";
import type { StitchScore } from "@/lib/clipstitchr/types/StitchScore";
import { getStitchScoreLabel } from "@/lib/clipstitchr/utils/getStitchScoreLabel";

type StitchScoreBadgeProps = {
  score?: StitchScore;
};

export function StitchScoreBadge({ score }: StitchScoreBadgeProps) {
  if (!score) {
    return null;
  }

  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-1 rounded-md border border-purple-200 bg-purple-50 px-2 py-1 text-[11px] font-bold leading-none text-accent-dark">
      <Gauge aria-hidden className="h-3 w-3 shrink-0" />
      <span className="truncate">
        {getStitchScoreLabel(score.overallRetentionEstimate)} -{" "}
        {score.overallRetentionEstimate}
      </span>
    </span>
  );
}
