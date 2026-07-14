import { AppAdCostPerCreativePricingCta } from "@/app/_components/tools/app-ad-cost-per-creative-calculator/AppAdCostPerCreativePricingCta";
import { ToolMetricCard } from "@/app/_components/tools/ToolMetricCard";
import { Panel } from "@/app/_components/ui/Panel";
import type { AppAdCostPerCreativeResult } from "@/lib/clipstitchr/tools/appAdCostPerCreative/AppAdCostPerCreativeResult";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";
import { formatUsd } from "@/lib/clipstitchr/tools/numbers/formatUsd";

type AppAdCostPerCreativeResultsProps = {
  result: AppAdCostPerCreativeResult;
  variant?: PublicToolGateVariant;
};

export function AppAdCostPerCreativeResults({
  result,
  variant = "control",
}: AppAdCostPerCreativeResultsProps) {
  const changeDirection =
    result.dollarChangePerCreative === null ||
    result.dollarChangePerCreative === 0
      ? "the same"
      : result.dollarChangePerCreative > 0
        ? "lower"
        : "higher";
  const comparisonDirection =
    result.differenceVersusCurrentAverage !== null &&
    result.differenceVersusCurrentAverage > 0
      ? "lower"
      : "higher";

  return (
    <Panel className="p-5 md:p-6">
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        Cost estimate updated. Current production total is
        {` ${formatUsd(result.currentTotalCost)}`}.
      </p>
      <div className="border-b border-border pb-4">
        <p className="text-xs font-bold uppercase text-accent-dark">
          Current cost per publishable creative
        </p>
        <h2 className="mt-2 text-4xl font-bold text-text-primary">
          {result.currentCostPerCreative === null
            ? "Add current creatives"
            : formatUsd(result.currentCostPerCreative)}
        </h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          {result.currentCreativeCount > 0
            ? `${formatUsd(result.currentTotalCost)} divided across ${result.currentCreativeCount.toLocaleString("en-US")} genuinely usable ad versions.`
            : "Add the number of genuinely usable ad versions to calculate your current unit cost."}
        </p>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <ToolMetricCard
          label="Current production total"
          value={formatUsd(result.currentTotalCost)}
          description="Source footage, editing, internal time, and other entered cost."
        />
        <ToolMetricCard
          label="Current creatives"
          value={result.currentCreativeCount.toLocaleString("en-US")}
          description="The publishable creative count used for your current average."
        />
      </div>
      {result.hasReuseScenario ? (
        <section className="mt-6 border-t border-border pt-6">
          <p className="text-xs font-bold uppercase text-accent-dark">
            Reuse scenario
          </p>
          <h3 className="mt-2 text-3xl font-bold text-text-primary">
            {result.blendedCostPerCreative === null
              ? "Add a creative count"
              : `${formatUsd(result.blendedCostPerCreative)} blended cost per creative`}
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ToolMetricCard
              label="Added cost per creative"
              value={
                result.incrementalCostPerCreative === null
                  ? "Add creatives"
                  : formatUsd(result.incrementalCostPerCreative)
              }
              description={`${formatUsd(result.appliedAdditionalCost)} divided across ${result.additionalCreativeCount.toLocaleString("en-US")} additional versions.`}
            />
            <ToolMetricCard
              label="Projected production total"
              value={formatUsd(result.projectedTotalCost)}
              description={`${result.projectedCreativeCount.toLocaleString("en-US")} total publishable creatives in the entered scenario.`}
            />
          </div>
          {result.dollarChangePerCreative === null ? (
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
              Add the current creative count to compare this scenario with your
              current average.
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-accent/25 bg-accent/10 p-5">
              <p className="text-sm font-bold text-text-primary">
                Your entered scenario is {changeDirection} by
                {` ${formatUsd(Math.abs(result.dollarChangePerCreative))} `}
                per creative
                {result.percentageChange === null
                  ? "."
                  : ` (${Math.abs(result.percentageChange).toFixed(1)}%).`}
              </p>
              {result.differenceVersusCurrentAverage === null ? null : (
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {result.differenceVersusCurrentAverage === 0
                    ? `The projected total matches producing all ${result.projectedCreativeCount.toLocaleString("en-US")} versions at your current average.`
                    : `The projected total is ${comparisonDirection} by ${formatUsd(Math.abs(result.differenceVersusCurrentAverage))} compared with producing all ${result.projectedCreativeCount.toLocaleString("en-US")} versions at your current average.`}
                </p>
              )}
            </div>
          )}
        </section>
      ) : (
        <section className="mt-6 rounded-lg border border-dashed border-border bg-surface-muted/45 p-5">
          <h3 className="text-base font-bold text-text-primary">
            Add planned creatives to compare a reuse scenario.
          </h3>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            The extra finishing cost is not included until at least one
            additional creative is entered.
          </p>
        </section>
      )}
      <p className="mt-6 text-xs leading-5 text-text-tertiary">
        This comparison uses only your inputs. It does not include ad spend,
        predict performance, or promise that ClipStitchr will produce the same
        cost change.
      </p>
      <AppAdCostPerCreativePricingCta variant={variant} />
    </Panel>
  );
}
