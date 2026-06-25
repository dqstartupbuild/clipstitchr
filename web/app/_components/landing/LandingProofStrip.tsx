import Link from "next/link";
import { ArrowRight } from "lucide-react";

type ProofMetric = {
  label: string;
  value: string;
};

type LandingProofStripProps = {
  metrics: ReadonlyArray<ProofMetric>;
  caseStudyHref: string;
  caseStudyLabel: string;
};

export function LandingProofStrip({
  metrics,
  caseStudyHref,
  caseStudyLabel,
}: LandingProofStripProps) {
  if (metrics.length === 0) {
    return null;
  }

  return (
    <section className="border-b border-border bg-white px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-accent-dark">
              Real results from a real experiment
            </p>
            <p className="mt-1 text-lg font-bold text-text-primary">
              Guppy Calisthenics, 30-day short-form experiment
            </p>
          </div>
          <Link
            href={caseStudyHref}
            className="inline-flex items-center gap-1 text-sm font-semibold text-accent-dark transition-colors hover:text-accent"
          >
            {caseStudyLabel}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl border border-border bg-surface px-4 py-3"
            >
              <p className="text-2xl font-bold text-text-primary md:text-3xl">
                {metric.value}
              </p>
              <p className="mt-1 text-xs text-text-tertiary">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}