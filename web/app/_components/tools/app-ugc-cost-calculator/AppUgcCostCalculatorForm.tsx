import { AppUgcCostNumberField } from "@/app/_components/tools/app-ugc-cost-calculator/AppUgcCostNumberField";
import { Panel } from "@/app/_components/ui/Panel";
import { PanelHeader } from "@/app/_components/ui/PanelHeader";
import type { AppUgcCostInput } from "@/lib/clipstitchr/tools/appUgcCostCalculator/AppUgcCostInput";
import { appUgcCostInputLimits } from "@/lib/clipstitchr/tools/appUgcCostCalculator/appUgcCostInputLimits";

type AppUgcCostCalculatorFormProps = {
  value: AppUgcCostInput;
  onChange: (value: AppUgcCostInput) => void;
};

export function AppUgcCostCalculatorForm({
  value,
  onChange,
}: AppUgcCostCalculatorFormProps) {
  return (
    <Panel className="h-fit p-5 md:p-6">
      <PanelHeader
        eyebrow="One production cycle"
        title="What did this batch actually require?"
        description="Use your own costs. The calculator does not add rates or benchmarks."
      />
      <div className="mt-6 grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <AppUgcCostNumberField
            id="app-ugc-cost-creators"
            label="Creators"
            description="People paid to deliver source footage."
            max={appUgcCostInputLimits.count}
            value={value.creatorCount}
            onChange={(creatorCount) => onChange({ ...value, creatorCount })}
          />
          <AppUgcCostNumberField
            id="app-ugc-cost-fee"
            label="Fee per creator"
            description="Average fee for this production cycle."
            max={appUgcCostInputLimits.money}
            step={0.01}
            suffix="USD"
            value={value.feePerCreator}
            onChange={(feePerCreator) =>
              onChange({ ...value, feePerCreator })
            }
          />
        </div>
        <AppUgcCostNumberField
          id="app-ugc-cost-clips"
          label="Raw clips per creator"
          description="Separate hooks, reactions, b-roll moments, or other delivered files."
          max={appUgcCostInputLimits.clipCount}
          value={value.clipsPerCreator}
          onChange={(clipsPerCreator) =>
            onChange({ ...value, clipsPerCreator })
          }
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <AppUgcCostNumberField
            id="app-ugc-cost-edit-hours"
            label="Editing hours"
            description="Total hands-on editing time for the batch."
            max={appUgcCostInputLimits.hours}
            step={0.25}
            value={value.editingHours}
            onChange={(editingHours) =>
              onChange({ ...value, editingHours })
            }
          />
          <AppUgcCostNumberField
            id="app-ugc-cost-edit-rate"
            label="Editing hourly rate"
            description="Your editor's loaded hourly cost."
            max={appUgcCostInputLimits.money}
            step={0.01}
            suffix="USD"
            value={value.editingHourlyRate}
            onChange={(editingHourlyRate) =>
              onChange({ ...value, editingHourlyRate })
            }
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <AppUgcCostNumberField
            id="app-ugc-cost-revisions"
            label="Paid revisions"
            description="Revision requests that created an added cost."
            max={appUgcCostInputLimits.count}
            value={value.revisionCount}
            onChange={(revisionCount) =>
              onChange({ ...value, revisionCount })
            }
          />
          <AppUgcCostNumberField
            id="app-ugc-cost-revision-cost"
            label="Cost per revision"
            description="Average added cost for each revision."
            max={appUgcCostInputLimits.money}
            step={0.01}
            suffix="USD"
            value={value.costPerRevision}
            onChange={(costPerRevision) =>
              onChange({ ...value, costPerRevision })
            }
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <AppUgcCostNumberField
            id="app-ugc-cost-internal-hours"
            label="Internal coordination hours"
            description="Briefing, feedback, file handling, and team coordination."
            max={appUgcCostInputLimits.hours}
            step={0.25}
            value={value.internalHours}
            onChange={(internalHours) =>
              onChange({ ...value, internalHours })
            }
          />
          <AppUgcCostNumberField
            id="app-ugc-cost-internal-rate"
            label="Internal hourly cost"
            description="The value of the team's time spent on the cycle."
            max={appUgcCostInputLimits.money}
            step={0.01}
            suffix="USD"
            value={value.internalHourlyCost}
            onChange={(internalHourlyCost) =>
              onChange({ ...value, internalHourlyCost })
            }
          />
        </div>
        <AppUgcCostNumberField
          id="app-ugc-cost-unused"
          label="Estimated unused footage"
          description="The share of paid creator footage not used in a finished variant yet."
          max={appUgcCostInputLimits.percentage}
          step={0.1}
          suffix="%"
          value={value.unusedFootagePercentage}
          onChange={(unusedFootagePercentage) =>
            onChange({ ...value, unusedFootagePercentage })
          }
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <AppUgcCostNumberField
            id="app-ugc-cost-finished"
            label="Finished variants"
            description="Completed ads produced in this cycle."
            max={appUgcCostInputLimits.clipCount}
            value={value.finishedVariantCount}
            onChange={(finishedVariantCount) =>
              onChange({ ...value, finishedVariantCount })
            }
          />
          <AppUgcCostNumberField
            id="app-ugc-cost-monthly-batches"
            label="Batches per month (optional)"
            description="Enter zero to hide monthly and annual scenarios."
            max={appUgcCostInputLimits.batchesPerMonth}
            step={0.1}
            value={value.batchesPerMonth}
            onChange={(batchesPerMonth) =>
              onChange({ ...value, batchesPerMonth })
            }
          />
        </div>
      </div>
    </Panel>
  );
}
