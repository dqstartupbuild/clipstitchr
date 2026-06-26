import { Gauge } from "lucide-react";
import type { StitchScore } from "@/lib/clipstitchr/types/StitchScore";
import { getStitchScoreLabel } from "@/lib/clipstitchr/utils/getStitchScoreLabel";

type StitchScoreDetailsProps = {
  score?: StitchScore;
};

export function StitchScoreDetails({ score }: StitchScoreDetailsProps) {
  if (!score) {
    return null;
  }

  const metricItems = [
    { label: "Retention estimate", value: score.overallRetentionEstimate },
    { label: "Hook to demo flow", value: score.hookToDemoFlow },
  ];
  const noteItems = [
    { label: "Drop-off risks", values: score.dropOffRiskPoints },
    { label: "Suggested trims", values: score.suggestedTrims },
  ].filter((item) => item.values.length);
  const reassessmentItems = [
    { label: "Fixed", values: score.reassessment?.completedImprovements ?? [] },
    {
      label: "Still needs work",
      values: score.reassessment?.remainingImprovements ?? [],
    },
  ].filter((item) => item.values.length);

  return (
    <section className="min-w-0 rounded-lg border border-border bg-surface-elevated p-4">
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-accent-dark">
            <Gauge aria-hidden className="h-4 w-4" />
            Stitch score
          </p>
          <h3 className="mt-2 text-lg font-bold text-text-primary">
            {getStitchScoreLabel(score.overallRetentionEstimate)}
          </h3>
          {score.summary ? (
            <p className="mt-2 break-words text-sm leading-6 text-text-secondary">
              {score.summary}
            </p>
          ) : null}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-3xl font-bold leading-none text-accent-dark">
            {score.overallRetentionEstimate}
          </p>
          <p className="mt-1 text-xs font-semibold text-accent-dark">
            out of 100
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {metricItems.map((item) => (
          <div key={item.label} className="min-w-0">
            <div className="flex items-center justify-between gap-3 text-xs font-semibold text-text-secondary">
              <span>{item.label}</span>
              <span>{item.value}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      {noteItems.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {noteItems.map((item) => (
            <div key={item.label} className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                {item.label}
              </p>
              <ul className="mt-2 space-y-1 text-sm leading-6 text-text-secondary">
                {item.values.map((value) => (
                  <li key={value} className="break-words">
                    {value}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
      {score.suggestedOpeningLine ? (
        <p className="mt-4 rounded-md border border-border bg-surface px-3 py-2 text-sm font-semibold text-text-primary">
          Stronger opening: {score.suggestedOpeningLine}
        </p>
      ) : null}
      {score.reassessment ? (
        <div className="mt-4 border-t border-border pt-4">
          <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
            Recheck
          </p>
          {score.reassessment.postingReadiness ? (
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {score.reassessment.postingReadiness}
            </p>
          ) : null}
          {reassessmentItems.length ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {reassessmentItems.map((item) => (
                <div key={item.label} className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                    {item.label}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm leading-6 text-text-secondary">
                    {item.values.map((value) => (
                      <li key={value} className="break-words">
                        {value}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
