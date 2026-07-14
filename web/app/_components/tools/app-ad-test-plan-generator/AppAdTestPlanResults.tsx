import { AppAdTestPlanMetricCard } from "@/app/_components/tools/app-ad-test-plan-generator/AppAdTestPlanMetricCard";
import { PublicToolGateContentBoundary } from "@/app/_components/tools/gates/PublicToolGateContentBoundary";
import { AppAdTestPlanPricingCta } from "@/app/_components/tools/app-ad-test-plan-generator/AppAdTestPlanPricingCta";
import { AppAdTestPlanWaveCard } from "@/app/_components/tools/app-ad-test-plan-generator/AppAdTestPlanWaveCard";
import { AppAdTestPlanWeekCard } from "@/app/_components/tools/app-ad-test-plan-generator/AppAdTestPlanWeekCard";
import { CopyTextButton } from "@/app/_components/ui/CopyTextButton";
import { Panel } from "@/app/_components/ui/Panel";
import type { AppAdTestPlanResult } from "@/lib/clipstitchr/tools/appAdTestPlan/AppAdTestPlanResult";
import { formatAppAdTestPlanText } from "@/lib/clipstitchr/tools/appAdTestPlan/formatAppAdTestPlanText";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";

type AppAdTestPlanResultsProps = {
  result: AppAdTestPlanResult;
  variant?: PublicToolGateVariant;
};

export function AppAdTestPlanResults({
  result,
  variant = "control",
}: AppAdTestPlanResultsProps) {
  return (
    <Panel className="p-5 md:p-6">
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        Test plan updated with {result.totalPlannedVariantCount} planned
        variants across {result.schedule.length} weeks.
      </p>
      <div className="border-b border-border pb-4">
        <div>
          <p className="text-xs font-bold uppercase text-accent-dark">
            Your creative test plan
          </p>
          <h2 className="mt-2 text-2xl font-bold text-text-primary">
            Change one thing, then keep what earns the next test.
          </h2>
        </div>
      </div>
      <p className="mt-5 leading-7 text-text-secondary">
        {result.hypothesis}
      </p>
      {result.waves[0] ? (
        <section className="mt-6">
          <h3 className="text-sm font-bold text-text-primary">
            First test wave
          </h3>
          <div className="mt-3">
            <AppAdTestPlanWaveCard wave={result.waves[0]} />
          </div>
        </section>
      ) : null}
      <PublicToolGateContentBoundary
        hasFunctionalUnlock
        toolKey="app-ad-test-plan-generator"
        variant={variant}
        publicContent={null}
        unlockedContent={<div className="mt-6 grid gap-6">
      <CopyTextButton
        className="justify-self-start"
        label="Copy full plan"
        copiedLabel="Plan copied"
        text={formatAppAdTestPlanText(result)}
      />
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <AppAdTestPlanMetricCard
          label="Full idea space"
          value={result.possibleCombinationCount}
          description="Every possible UGC, demo, hook, and CTA combination."
        />
        <AppAdTestPlanMetricCard
          label="Practical first batch"
          value={result.practicalFirstBatchCount}
          description="One demo paired with up to 20 UGC openings."
        />
        <AppAdTestPlanMetricCard
          label="Ready-wave output"
          value={result.totalPlannedVariantCount}
          description="The variants currently scheduled across the three waves."
        />
      </div>
      {result.preparationItems.length ? (
        <section className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-bold text-amber-900">
            Prepare these pieces first
          </h3>
          <ul className="mt-2 grid gap-1 text-sm leading-6 text-amber-800">
            {result.preparationItems.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </section>
      ) : null}
      <section className="mt-6">
        <h3 className="text-sm font-bold text-text-primary">
          Three-wave test matrix
        </h3>
        <div className="mt-3 grid gap-3">
          {result.waves.slice(1).map((wave) => (
            <AppAdTestPlanWaveCard key={wave.waveNumber} wave={wave} />
          ))}
        </div>
      </section>
      <section className="mt-6">
        <h3 className="text-sm font-bold text-text-primary">Weekly order</h3>
        {result.schedule.length ? (
          <ol className="mt-3 grid gap-3 sm:grid-cols-2">
            {result.schedule.map((week) => (
              <AppAdTestPlanWeekCard key={week.weekNumber} week={week} />
            ))}
          </ol>
        ) : (
          <p className="mt-3 rounded-lg border border-border bg-surface-muted/45 p-4 text-sm leading-6 text-text-secondary">
            No wave is ready yet. Use the preparation list, then the weekly
            order will appear here.
          </p>
        )}
      </section>
    </div>}
      />
      <p className="mt-6 text-xs leading-5 text-text-tertiary">
        Compare one variable at a time using the same measurement window and
        comparable delivery opportunity. Budget math is an even split, not a
        spend recommendation, and this plan does not predict a winner.
      </p>
      <AppAdTestPlanPricingCta variant={variant} />
    </Panel>
  );
}
