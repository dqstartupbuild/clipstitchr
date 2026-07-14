import { AppUgcCostBreakdown } from "@/app/_components/tools/app-ugc-cost-calculator/AppUgcCostBreakdown";
import { AppUgcCostMetricCard } from "@/app/_components/tools/app-ugc-cost-calculator/AppUgcCostMetricCard";
import { AppUgcCostPricingCta } from "@/app/_components/tools/app-ugc-cost-calculator/AppUgcCostPricingCta";
import { Panel } from "@/app/_components/ui/Panel";
import type { AppUgcCostResult } from "@/lib/clipstitchr/tools/appUgcCostCalculator/AppUgcCostResult";
import { formatAppUgcCostUsd } from "@/lib/clipstitchr/tools/appUgcCostCalculator/formatAppUgcCostUsd";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";

type AppUgcCostCalculatorResultsProps = {
  result: AppUgcCostResult;
  variant?: PublicToolGateVariant;
};

export function AppUgcCostCalculatorResults({
  result,
  variant = "control",
}: AppUgcCostCalculatorResultsProps) {
  return (
    <Panel className="p-5 md:p-6">
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        Cost estimate updated. Production subtotal is {formatAppUgcCostUsd(result.totalBatchCost)}.
      </p>
      <div className="border-b border-border pb-4">
        <p className="text-xs font-bold uppercase text-accent-dark">
          Estimated production subtotal
        </p>
        <h2 className="mt-2 text-4xl font-bold text-text-primary">
          {formatAppUgcCostUsd(result.totalBatchCost)}
        </h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Based only on the creator, editing, revision, and internal costs you
          entered for one cycle.
        </p>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <AppUgcCostMetricCard
          label="Cost per raw clip"
          value={
            result.costPerRawClip === null
              ? "Add raw clips"
              : formatAppUgcCostUsd(result.costPerRawClip)
          }
          description={`${result.rawClipCount.toLocaleString("en-US")} raw clips in this estimate.`}
        />
        <AppUgcCostMetricCard
          label="Cost per finished variant"
          value={
            result.costPerFinishedVariant === null
              ? "Add finished variants"
              : formatAppUgcCostUsd(result.costPerFinishedVariant)
          }
          description={`${result.finishedVariantCount.toLocaleString("en-US")} finished variants in this cycle.`}
        />
      </div>
      <AppUgcCostBreakdown result={result} />
      <section className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5">
        <p className="text-xs font-bold uppercase text-amber-800">
          Creator spend tied to unused footage
        </p>
        <p className="mt-2 text-3xl font-bold text-amber-950">
          {formatAppUgcCostUsd(result.estimatedUnusedFootageCost)}
        </p>
        <p className="mt-2 text-sm leading-6 text-amber-800">
          This is {result.unusedFootagePercentage}% of creator spend. It is
          already inside the subtotal above and is not added a second time.
        </p>
      </section>
      {result.monthlyCost === null || result.annualCost === null ? null : (
        <section className="mt-6">
          <h3 className="text-sm font-bold text-text-primary">
            Production cadence scenario
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <AppUgcCostMetricCard
              label="Estimated monthly"
              value={formatAppUgcCostUsd(result.monthlyCost)}
              description="Batch subtotal multiplied by the monthly cadence you entered."
            />
            <AppUgcCostMetricCard
              label="Estimated annual"
              value={formatAppUgcCostUsd(result.annualCost)}
              description="The monthly arithmetic repeated for 12 months."
            />
          </div>
        </section>
      )}
      <p className="mt-6 text-xs leading-5 text-text-tertiary">
        This estimate excludes ad spend, usage or licensing fees, reshoots,
        taxes, software, and any other cost you did not enter. It does not use
        creator-rate benchmarks or promise savings.
      </p>
      <AppUgcCostPricingCta variant={variant} />
    </Panel>
  );
}
