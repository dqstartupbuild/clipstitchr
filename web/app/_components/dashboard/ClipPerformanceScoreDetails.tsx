import { Gauge } from "lucide-react";
import type { ClipPerformanceScore } from "@/lib/clipstitchr/types/ClipPerformanceScore";
import { getClipPerformanceScoreLabel } from "@/lib/clipstitchr/utils/getClipPerformanceScoreLabel";

type ClipPerformanceScoreDetailsProps = {
  score?: ClipPerformanceScore;
};

export function ClipPerformanceScoreDetails({
  score,
}: ClipPerformanceScoreDetailsProps) {
  if (!score) {
    return null;
  }

  const metricItems = [
    { label: "Hook", value: score.hook },
    { label: "On camera", value: score.cameraPresence },
    { label: "Pace", value: score.pacing },
    { label: "Easy to get", value: score.clarity },
    { label: "Platform fit", value: score.platformFit },
    { label: "Stitch fit", value: score.stitchFit },
  ].filter(
    (item): item is { label: string; value: number } =>
      typeof item.value === "number",
  );

  return (
    <section className="min-w-0 rounded-lg border border-emerald-200 bg-emerald-50/70 p-4">
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-700">
            <Gauge aria-hidden className="h-4 w-4" />
            Clip score
          </p>
          <h3 className="mt-2 text-lg font-bold text-text-primary">
            {getClipPerformanceScoreLabel(score.overall)}
          </h3>
          {score.summary ? (
            <p className="mt-2 break-words text-sm leading-6 text-text-secondary">
              {score.summary}
            </p>
          ) : null}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-3xl font-bold leading-none text-emerald-700">
            {score.overall}
          </p>
          <p className="mt-1 text-xs font-semibold text-emerald-700">
            out of 100
          </p>
        </div>
      </div>
      {score.bestUse ? (
        <p className="mt-3 rounded-md bg-white/80 px-3 py-2 text-sm font-semibold text-text-primary">
          Best use: {score.bestUse}
        </p>
      ) : null}
      {metricItems.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {metricItems.map((item) => (
            <div key={item.label} className="min-w-0">
              <div className="flex items-center justify-between gap-3 text-xs font-semibold text-text-secondary">
                <span>{item.label}</span>
                <span>{item.value}</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {score.strengths.length || score.fixes.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {score.strengths.length ? (
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                What works
              </p>
              <ul className="mt-2 space-y-1 text-sm leading-6 text-text-secondary">
                {score.strengths.map((strength) => (
                  <li key={strength} className="break-words">
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {score.fixes.length ? (
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                Quick fixes
              </p>
              <ul className="mt-2 space-y-1 text-sm leading-6 text-text-secondary">
                {score.fixes.map((fix) => (
                  <li key={fix} className="break-words">
                    {fix}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
