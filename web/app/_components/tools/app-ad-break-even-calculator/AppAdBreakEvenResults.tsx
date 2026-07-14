import { AppAdBreakEvenCostSplit } from "@/app/_components/tools/app-ad-break-even-calculator/AppAdBreakEvenCostSplit";
import { AppAdBreakEvenPricingCta } from "@/app/_components/tools/app-ad-break-even-calculator/AppAdBreakEvenPricingCta";
import { ToolMetricCard } from "@/app/_components/tools/ToolMetricCard";
import { Panel } from "@/app/_components/ui/Panel";
import type { AppAdBreakEvenResult } from "@/lib/clipstitchr/tools/appAdBreakEven/AppAdBreakEvenResult";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";
import { getAppAdBreakEvenRevenueWindowLabel } from "@/lib/clipstitchr/tools/appAdBreakEven/getAppAdBreakEvenRevenueWindowLabel";
import { formatUsd } from "@/lib/clipstitchr/tools/numbers/formatUsd";

type AppAdBreakEvenResultsProps = {
  result: AppAdBreakEvenResult;
  variant?: PublicToolGateVariant;
};

export function AppAdBreakEvenResults({
  result,
  variant = "control",
}: AppAdBreakEvenResultsProps) {
  const revenueWindowLabel = getAppAdBreakEvenRevenueWindowLabel(
    result.revenueWindow,
  );
  const customerTarget =
    result.breakEvenCustomers === null
      ? result.breakEvenCustomerStatus === "outside-range"
        ? "Outside useful range"
        : "Add customer value"
      : result.breakEvenCustomers.toLocaleString("en-US");
  const installTarget =
    result.breakEvenInstalls === null
      ? result.breakEvenInstallStatus === "outside-range"
        ? "Outside useful range"
        : result.breakEvenInstallStatus === "missing-conversion-rate"
          ? "Add conversion rate"
          : "Add customer value"
      : result.breakEvenInstalls.toLocaleString("en-US");
  const customerTargetDescription =
    result.breakEvenCustomers !== null
      ? `${customerTarget} paying customers inside the ${revenueWindowLabel.toLowerCase()} revenue window cover the entered cost at your contribution margin.`
      : result.breakEvenCustomerStatus === "outside-range"
        ? "These assumptions produce a whole-customer target larger than this calculator can show safely."
        : "Add positive revenue per customer and contribution margin to calculate this target.";
  const installTargetDescription =
    result.breakEvenInstalls !== null
      ? `Uses the entered ${result.installToPaidPercentage.toFixed(2).replace(/\.00$/, "")}% install-to-paid rate and rounds upward.`
      : result.breakEvenInstallStatus === "outside-range"
        ? "These assumptions produce a whole-install target larger than this calculator can show safely."
        : "A positive customer value and install-to-paid rate are required.";

  return (
    <Panel className="p-5 md:p-6">
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        Break-even estimate updated. Total entered investment is
        {` ${formatUsd(result.totalAcquisitionInvestment)}`}.
      </p>
      <div className="border-b border-border pb-4">
        <p className="text-xs font-bold uppercase text-accent-dark">
          Break-even paying customers
        </p>
        <h2 className="mt-2 text-4xl font-bold text-text-primary">
          {customerTarget}
        </h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          {customerTargetDescription}
        </p>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <ToolMetricCard
          label="Total acquisition investment"
          value={formatUsd(result.totalAcquisitionInvestment)}
          description="Entered media spend plus entered creative production cost."
        />
        <ToolMetricCard
          label="Contribution per customer"
          value={formatUsd(result.contributionPerCustomer)}
          description={`${formatUsd(result.revenuePerPayingCustomer)} revenue at a ${result.contributionMarginPercentage.toFixed(2).replace(/\.00$/, "")}% contribution margin.`}
        />
        <ToolMetricCard
          label="Break-even installs"
          value={installTarget}
          description={installTargetDescription}
        />
        <ToolMetricCard
          label="Minimum customer revenue"
          value={
            result.minimumRevenueNeeded === null
              ? "Add contribution margin"
              : formatUsd(result.minimumRevenueNeeded)
          }
          description={`Revenue needed in the ${revenueWindowLabel.toLowerCase()} window to cover the entered investment.`}
        />
        <ToolMetricCard
          label="Maximum blended CAC"
          value={formatUsd(result.maximumBlendedCac)}
          description="Media plus creative cost per paying customer at break-even."
        />
        <ToolMetricCard
          label="Maximum blended CPI"
          value={
            result.maximumBlendedCpi === null
              ? "Add conversion rate"
              : formatUsd(result.maximumBlendedCpi)
          }
          description="The blended customer value multiplied by the entered install-to-paid rate."
        />
      </div>
      <section className="mt-6 rounded-lg border border-accent/25 bg-accent/10 p-5">
        <p className="text-xs font-bold uppercase text-accent-dark">
          Revenue and media view
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-text-secondary">
              Break-even media ROAS
            </p>
            <p className="mt-1 text-2xl font-bold text-text-primary">
              {result.breakEvenMediaRoas === null
                ? "Add media spend"
                : `${result.breakEvenMediaRoas.toFixed(2)}x`}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-text-secondary">
              Revenue at whole-customer target
            </p>
            <p className="mt-1 text-2xl font-bold text-text-primary">
              {result.revenueAtWholeCustomerThreshold === null
                ? "Add customer value"
                : formatUsd(result.revenueAtWholeCustomerThreshold)}
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-text-secondary">
          Ad platforms usually divide revenue by media spend. This target asks
          that revenue to cover both media and the creative cost entered here.
        </p>
      </section>
      <AppAdBreakEvenCostSplit result={result} />
      <p className="mt-6 text-xs leading-5 text-text-tertiary">
        This is planning arithmetic, not a spend recommendation or financial
        forecast. It does not predict attribution, retention, conversion, cash
        flow, taxes, refunds, app-store fees, servicing cost, or ad performance
        unless those effects are already reflected in your inputs.
      </p>
      <AppAdBreakEvenPricingCta variant={variant} />
    </Panel>
  );
}
