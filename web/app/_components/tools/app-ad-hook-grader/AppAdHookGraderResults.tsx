import Link from "next/link";
import { AppAdHookGradeDimensionCard } from "@/app/_components/tools/app-ad-hook-grader/AppAdHookGradeDimensionCard";
import { AppAdHookGraderPricingCta } from "@/app/_components/tools/app-ad-hook-grader/AppAdHookGraderPricingCta";
import { PublicToolGateContentBoundary } from "@/app/_components/tools/gates/PublicToolGateContentBoundary";
import { Panel } from "@/app/_components/ui/Panel";
import type { AppAdHookGraderResult } from "@/lib/clipstitchr/tools/appAdHookGrader/AppAdHookGraderResult";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";

type AppAdHookGraderResultsProps = {
  result: AppAdHookGraderResult;
  variant?: PublicToolGateVariant;
};

export function AppAdHookGraderResults({
  result,
  variant = "control",
}: AppAdHookGraderResultsProps) {
  return (
    <Panel className="p-5 md:p-6">
      <p className="sr-only" aria-atomic="true" aria-live="polite">
        Hook grade updated: {result.overallScore} out of 100. {result.status}.
      </p>
      <p className="marketing-eyebrow">Your hook grade</p>
      <div className="mt-4 flex flex-wrap items-end gap-4">
        <p className="marketing-heading text-6xl text-text-primary">
          {result.overallScore}
        </p>
        <div className="pb-1">
          <p className="text-lg font-bold text-text-primary">{result.status}</p>
          <p className="text-sm text-text-tertiary">out of 100</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-text-secondary">
        This is a writing check, not a prediction of views, clicks, installs,
        or sales.
      </p>
      {result.claimSignals.length ? (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-bold text-amber-900">Claims to review</p>
          <ul className="mt-2 grid gap-1 text-sm leading-6 text-amber-900">
            {result.claimSignals.map((signal) => (
              <li key={signal.kind}>{signal.message}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <PublicToolGateContentBoundary
        hasFunctionalUnlock
        publicContent={
          <section className="mt-6 border-t border-border pt-6">
            <h2 className="text-base font-bold text-text-primary">
              Fix these first
            </h2>
            <ol className="mt-3 grid gap-2">
              {result.fixes.slice(0, 1).map((fix) => (
                <li
                  className="flex gap-3 text-sm leading-6 text-text-secondary"
                  key={fix}
                >
                  <span className="font-bold text-accent-dark">1.</span>
                  {fix}
                </li>
              ))}
            </ol>
          </section>
        }
        toolKey="app-ad-hook-grader"
        unlockedContent={
          <>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {result.dimensions.map((dimension) => (
                <AppAdHookGradeDimensionCard
                  dimension={dimension}
                  key={dimension.key}
                />
              ))}
            </div>
            {result.fixes.length > 1 ? (
              <section className="mt-6 border-t border-border pt-6">
                <h2 className="text-base font-bold text-text-primary">
                  Complete rewrite plan
                </h2>
                <ol className="mt-3 grid gap-2">
                  {result.fixes.slice(1).map((fix, index) => (
                    <li
                      className="flex gap-3 text-sm leading-6 text-text-secondary"
                      key={fix}
                    >
                      <span className="font-bold text-accent-dark">
                        {index + 2}.
                      </span>
                      {fix}
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}
          </>
        }
        variant={variant}
      />
      <section className="mt-6 border-t border-border pt-6">
        <Link
          className="inline-flex font-bold text-accent-dark underline underline-offset-4"
          href="/tools/app-ad-hook-rewriter"
        >
          Rewrite this hook six ways
        </Link>
      </section>
      <AppAdHookGraderPricingCta variant={variant} />
    </Panel>
  );
}
