import { ClipStitchrSavingsPlanField } from "@/app/_components/tools/clipstitchr-savings-report/ClipStitchrSavingsPlanField";
import { ToolNumberField } from "@/app/_components/tools/ToolNumberField";
import { Panel } from "@/app/_components/ui/Panel";
import { PanelHeader } from "@/app/_components/ui/PanelHeader";
import type { ClipStitchrSavingsInput } from "@/lib/clipstitchr/tools/clipStitchrSavings/ClipStitchrSavingsInput";
import { clipStitchrSavingsInputLimits } from "@/lib/clipstitchr/tools/clipStitchrSavings/clipStitchrSavingsInputLimits";

type ClipStitchrSavingsFormProps = {
  onChange: (value: ClipStitchrSavingsInput) => void;
  value: ClipStitchrSavingsInput;
};

export function ClipStitchrSavingsForm({
  onChange,
  value,
}: ClipStitchrSavingsFormProps) {
  return (
    <Panel className="p-5 md:p-6">
      <PanelHeader
        eyebrow="Your two scenarios"
        title="Compare the full monthly workflow"
        description="Use your own output, labor, footage, and cost assumptions."
      />
      <div className="mt-6 grid gap-6">
        <fieldset className="rounded-lg border border-border bg-surface-muted/30 p-4">
          <legend className="px-2 text-sm font-bold text-text-primary">
            Shared workflow inputs
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <ToolNumberField
              id="savings-source-cost"
              label="Monthly source-footage cost"
              description="Creator fees, shoots, or other source material used in both scenarios."
              max={clipStitchrSavingsInputLimits.money}
              step={0.01}
              suffix="USD"
              value={value.monthlySourceFootageCost}
              onChange={(monthlySourceFootageCost) =>
                onChange({ ...value, monthlySourceFootageCost })
              }
            />
            <ToolNumberField
              id="savings-hourly-cost"
              label="Loaded team cost per hour"
              description="Your internal or outside hourly cost for editing and revisions."
              max={clipStitchrSavingsInputLimits.money}
              step={0.01}
              suffix="USD"
              value={value.hourlyTeamCost}
              onChange={(hourlyTeamCost) =>
                onChange({ ...value, hourlyTeamCost })
              }
            />
            <ToolNumberField
              id="savings-usable-clips"
              label="Usable source clips"
              description="The monthly source inventory available to either scenario."
              max={clipStitchrSavingsInputLimits.count}
              value={value.usableSourceClipCount}
              onChange={(usableSourceClipCount) =>
                onChange({ ...value, usableSourceClipCount })
              }
            />
          </div>
        </fieldset>
        <fieldset className="rounded-lg border border-border bg-surface-muted/30 p-4">
          <legend className="px-2 text-sm font-bold text-text-primary">
            Current workflow
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <ToolNumberField
              id="savings-current-creatives"
              label="Monthly finished creatives"
              description="Your current genuinely publishable output."
              max={clipStitchrSavingsInputLimits.count}
              value={value.currentMonthlyCreativeCount}
              onChange={(currentMonthlyCreativeCount) =>
                onChange({ ...value, currentMonthlyCreativeCount })
              }
            />
            <ToolNumberField
              id="savings-current-edit-hours"
              label="Editing hours per creative"
              description="Average current hands-on editing time."
              max={clipStitchrSavingsInputLimits.hours}
              step={0.1}
              suffix="hours"
              value={value.currentEditingHoursPerCreative}
              onChange={(currentEditingHoursPerCreative) =>
                onChange({ ...value, currentEditingHoursPerCreative })
              }
            />
            <ToolNumberField
              id="savings-current-revisions"
              label="Monthly revision hours"
              description="Current revision and rework time outside first edits."
              max={clipStitchrSavingsInputLimits.hours}
              step={0.1}
              suffix="hours"
              value={value.currentMonthlyRevisionHours}
              onChange={(currentMonthlyRevisionHours) =>
                onChange({ ...value, currentMonthlyRevisionHours })
              }
            />
            <ToolNumberField
              id="savings-current-software"
              label="Current monthly software cost"
              description="Tools included in the workflow being replaced or compared."
              max={clipStitchrSavingsInputLimits.money}
              step={0.01}
              suffix="USD"
              value={value.currentMonthlySoftwareCost}
              onChange={(currentMonthlySoftwareCost) =>
                onChange({ ...value, currentMonthlySoftwareCost })
              }
            />
            <ToolNumberField
              id="savings-current-used-clips"
              label="Source clips currently used"
              description="How many usable clips make it into your current output."
              max={clipStitchrSavingsInputLimits.count}
              value={value.usedSourceClipCount}
              onChange={(usedSourceClipCount) =>
                onChange({ ...value, usedSourceClipCount })
              }
            />
          </div>
        </fieldset>
        <fieldset className="rounded-lg border border-accent/25 bg-accent/5 p-4">
          <legend className="px-2 text-sm font-bold text-text-primary">
            ClipStitchr scenario
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <ClipStitchrSavingsPlanField
                value={value}
                onChange={(plan) => onChange({ ...value, ...plan })}
              />
            </div>
            <ToolNumberField
              id="savings-modeled-creatives"
              label="Modeled monthly creatives"
              description="Your own scenario output, not a ClipStitchr promise."
              max={clipStitchrSavingsInputLimits.count}
              value={value.modeledMonthlyCreativeCount}
              onChange={(modeledMonthlyCreativeCount) =>
                onChange({ ...value, modeledMonthlyCreativeCount })
              }
            />
            <ToolNumberField
              id="savings-modeled-edit-hours"
              label="Modeled editing hours per creative"
              description="Your own expected hands-on time in this scenario."
              max={clipStitchrSavingsInputLimits.hours}
              step={0.1}
              suffix="hours"
              value={value.modeledEditingHoursPerCreative}
              onChange={(modeledEditingHoursPerCreative) =>
                onChange({ ...value, modeledEditingHoursPerCreative })
              }
            />
            <ToolNumberField
              id="savings-modeled-revisions"
              label="Modeled monthly revision hours"
              description="Your own expected revision and rework time."
              max={clipStitchrSavingsInputLimits.hours}
              step={0.1}
              suffix="hours"
              value={value.modeledMonthlyRevisionHours}
              onChange={(modeledMonthlyRevisionHours) =>
                onChange({ ...value, modeledMonthlyRevisionHours })
              }
            />
            <ToolNumberField
              id="savings-modeled-used-clips"
              label="Modeled source clips used"
              description="How many usable source clips your scenario reuses."
              max={clipStitchrSavingsInputLimits.count}
              value={value.modeledUsedSourceClipCount}
              onChange={(modeledUsedSourceClipCount) =>
                onChange({ ...value, modeledUsedSourceClipCount })
              }
            />
          </div>
        </fieldset>
      </div>
    </Panel>
  );
}
