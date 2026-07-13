import { AppAdBreakEvenRevenueWindowField } from "@/app/_components/tools/app-ad-break-even-calculator/AppAdBreakEvenRevenueWindowField";
import { ToolNumberField } from "@/app/_components/tools/ToolNumberField";
import { Panel } from "@/app/_components/ui/Panel";
import { PanelHeader } from "@/app/_components/ui/PanelHeader";
import type { AppAdBreakEvenInput } from "@/lib/clipstitchr/tools/appAdBreakEven/AppAdBreakEvenInput";
import { appAdBreakEvenInputLimits } from "@/lib/clipstitchr/tools/appAdBreakEven/appAdBreakEvenInputLimits";

type AppAdBreakEvenFormProps = {
  value: AppAdBreakEvenInput;
  onChange: (value: AppAdBreakEvenInput) => void;
};

export function AppAdBreakEvenForm({
  value,
  onChange,
}: AppAdBreakEvenFormProps) {
  return (
    <Panel className="h-fit p-5 md:p-6">
      <PanelHeader
        eyebrow="Your campaign assumptions"
        title="What must this spend earn back?"
        description="Enter your own numbers. The calculator does not supply performance benchmarks."
      />
      <div className="mt-6 grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <ToolNumberField
            id="app-ad-break-even-media-spend"
            label="Planned media spend"
            description="The ad-platform spend in this scenario."
            max={appAdBreakEvenInputLimits.mediaSpend}
            step={0.01}
            suffix="USD"
            value={value.mediaSpend}
            onChange={(mediaSpend) => onChange({ ...value, mediaSpend })}
          />
          <ToolNumberField
            id="app-ad-break-even-creative-cost"
            label="Creative production cost"
            description="The cost to make the ads used by this campaign."
            max={appAdBreakEvenInputLimits.creativeCost}
            step={0.01}
            suffix="USD"
            value={value.creativeProductionCost}
            onChange={(creativeProductionCost) =>
              onChange({ ...value, creativeProductionCost })
            }
          />
        </div>
        <ToolNumberField
          id="app-ad-break-even-customer-revenue"
          label="Revenue per paying customer"
          description="Use revenue from the same time window selected below."
          max={appAdBreakEvenInputLimits.customerRevenue}
          step={0.01}
          suffix="USD"
          value={value.revenuePerPayingCustomer}
          onChange={(revenuePerPayingCustomer) =>
            onChange({ ...value, revenuePerPayingCustomer })
          }
        />
        <AppAdBreakEvenRevenueWindowField
          value={value.revenueWindow}
          onChange={(revenueWindow) => onChange({ ...value, revenueWindow })}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <ToolNumberField
            id="app-ad-break-even-margin"
            label="Contribution margin"
            description="The share left after app-store fees, refunds, servicing, and other variable costs you include."
            max={appAdBreakEvenInputLimits.percentage}
            step={0.01}
            suffix="%"
            value={value.contributionMarginPercentage}
            onChange={(contributionMarginPercentage) =>
              onChange({ ...value, contributionMarginPercentage })
            }
          />
          <ToolNumberField
            id="app-ad-break-even-paid-rate"
            label="Install-to-paying-customer rate"
            description="The share of acquired installs expected to become paying customers."
            max={appAdBreakEvenInputLimits.percentage}
            step={0.01}
            suffix="%"
            value={value.installToPaidPercentage}
            onChange={(installToPaidPercentage) =>
              onChange({ ...value, installToPaidPercentage })
            }
          />
        </div>
      </div>
    </Panel>
  );
}
