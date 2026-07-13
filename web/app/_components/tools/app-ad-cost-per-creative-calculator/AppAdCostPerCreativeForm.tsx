import { ToolNumberField } from "@/app/_components/tools/ToolNumberField";
import { Panel } from "@/app/_components/ui/Panel";
import { PanelHeader } from "@/app/_components/ui/PanelHeader";
import type { AppAdCostPerCreativeInput } from "@/lib/clipstitchr/tools/appAdCostPerCreative/AppAdCostPerCreativeInput";
import { appAdCostPerCreativeInputLimits } from "@/lib/clipstitchr/tools/appAdCostPerCreative/appAdCostPerCreativeInputLimits";

type AppAdCostPerCreativeFormProps = {
  value: AppAdCostPerCreativeInput;
  onChange: (value: AppAdCostPerCreativeInput) => void;
};

export function AppAdCostPerCreativeForm({
  value,
  onChange,
}: AppAdCostPerCreativeFormProps) {
  return (
    <Panel className="h-fit p-5 md:p-6">
      <PanelHeader
        eyebrow="Your current production"
        title="What did the creatives really cost?"
        description="Use your own numbers. The example is not a market benchmark."
      />
      <div className="mt-6 grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <ToolNumberField
            id="app-ad-cost-source"
            label="Source-footage cost"
            description="Creator fees, a shoot, or source assets paid for this run."
            max={appAdCostPerCreativeInputLimits.money}
            step={0.01}
            suffix="USD"
            value={value.sourceFootageCost}
            onChange={(sourceFootageCost) =>
              onChange({ ...value, sourceFootageCost })
            }
          />
          <ToolNumberField
            id="app-ad-cost-editing"
            label="Editing and finishing"
            description="Outside or internal editing cost already assigned to the run."
            max={appAdCostPerCreativeInputLimits.money}
            step={0.01}
            suffix="USD"
            value={value.editingCost}
            onChange={(editingCost) => onChange({ ...value, editingCost })}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <ToolNumberField
            id="app-ad-cost-internal"
            label="Internal team cost"
            description="Briefing, reviews, handoffs, and other team time."
            max={appAdCostPerCreativeInputLimits.money}
            step={0.01}
            suffix="USD"
            value={value.internalCost}
            onChange={(internalCost) => onChange({ ...value, internalCost })}
          />
          <ToolNumberField
            id="app-ad-cost-other"
            label="Other allocated cost"
            description="Music, licenses, software, or another cost you want included."
            max={appAdCostPerCreativeInputLimits.money}
            step={0.01}
            suffix="USD"
            value={value.otherCost}
            onChange={(otherCost) => onChange({ ...value, otherCost })}
          />
        </div>
        <ToolNumberField
          id="app-ad-cost-current-creatives"
          label="Current publishable creatives"
          description="Count usable ad versions, not duplicate exports or file formats."
          max={appAdCostPerCreativeInputLimits.creativeCount}
          value={value.currentCreativeCount}
          onChange={(currentCreativeCount) =>
            onChange({ ...value, currentCreativeCount })
          }
        />
        <div className="border-t border-border pt-5">
          <p className="text-xs font-bold uppercase text-accent-dark">
            Reuse scenario
          </p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Estimate a second pass using the same source footage. Enter zero
            additional creatives to hide the comparison.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <ToolNumberField
            id="app-ad-cost-added-creatives"
            label="Additional creatives"
            description="New publishable versions planned from the same source assets."
            max={appAdCostPerCreativeInputLimits.creativeCount}
            value={value.additionalCreativeCount}
            onChange={(additionalCreativeCount) =>
              onChange({ ...value, additionalCreativeCount })
            }
          />
          <ToolNumberField
            id="app-ad-cost-added-finishing"
            label="Extra finishing cost"
            description="The added cost to turn those reused assets into finished versions."
            max={appAdCostPerCreativeInputLimits.money}
            step={0.01}
            suffix="USD"
            value={value.additionalFinishingCost}
            onChange={(additionalFinishingCost) =>
              onChange({ ...value, additionalFinishingCost })
            }
          />
        </div>
      </div>
    </Panel>
  );
}
