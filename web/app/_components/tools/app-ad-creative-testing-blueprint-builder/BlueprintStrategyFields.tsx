import { BlueprintNumberField } from "@/app/_components/tools/app-ad-creative-testing-blueprint-builder/BlueprintNumberField";
import { BlueprintSelectField } from "@/app/_components/tools/app-ad-creative-testing-blueprint-builder/BlueprintSelectField";
import { ToolTextField } from "@/app/_components/tools/ToolTextField";
import type { AppAdCreativeTestingBlueprintInput } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/AppAdCreativeTestingBlueprintInput";
import type { BlueprintCampaignStage } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintCampaignStage";
import type { BlueprintMetricDirection } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintMetricDirection";
import type { BlueprintTestingObjective } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintTestingObjective";
import { appAdCreativeTestingBlueprintFieldLimits } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/appAdCreativeTestingBlueprintFieldLimits";
import { blueprintCampaignStageOptions } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/blueprintCampaignStageOptions";
import { blueprintMetricDirectionOptions } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/blueprintMetricDirectionOptions";
import { blueprintTestingObjectiveOptions } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/blueprintTestingObjectiveOptions";

type BlueprintStrategyFieldsProps = {
  value: AppAdCreativeTestingBlueprintInput;
  onChange: (value: AppAdCreativeTestingBlueprintInput) => void;
};

export function BlueprintStrategyFields({
  onChange,
  value,
}: BlueprintStrategyFieldsProps) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <BlueprintSelectField
          id="blueprint-objective"
          label="Testing objective"
          description="This chooses the three questions the blueprint should answer."
          options={blueprintTestingObjectiveOptions}
          value={value.objective}
          onChange={(objective) =>
            onChange({
              ...value,
              objective: objective as BlueprintTestingObjective,
            })
          }
        />
        <BlueprintSelectField
          id="blueprint-stage"
          label="Campaign stage"
          description="Stage changes which learning question comes first."
          options={blueprintCampaignStageOptions}
          value={value.campaignStage}
          onChange={(campaignStage) =>
            onChange({
              ...value,
              campaignStage: campaignStage as BlueprintCampaignStage,
            })
          }
        />
      </div>
      <ToolTextField
        id="blueprint-primary-metric"
        label="Primary metric"
        description="Use the metric your team already trusts. This tool does not supply a benchmark."
        maxLength={appAdCreativeTestingBlueprintFieldLimits.primaryMetric}
        placeholder="Cost per trial start"
        value={value.primaryMetric}
        onChange={(primaryMetric) => onChange({ ...value, primaryMetric })}
      />
      <BlueprintSelectField
        id="blueprint-metric-direction"
        label="What counts as improvement?"
        description="The decision rubric uses this direction without predicting performance."
        options={blueprintMetricDirectionOptions}
        value={value.metricDirection}
        onChange={(metricDirection) =>
          onChange({
            ...value,
            metricDirection: metricDirection as BlueprintMetricDirection,
          })
        }
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <BlueprintNumberField
          id="blueprint-baseline"
          label="Current baseline (optional)"
          description="Use the same unit as the primary metric."
          max={appAdCreativeTestingBlueprintFieldLimits.metricValue}
          optional
          step={0.01}
          value={value.baseline}
          onChange={(baseline) => onChange({ ...value, baseline })}
        />
        <BlueprintNumberField
          id="blueprint-target"
          label="Visitor-set target (optional)"
          description="Your target becomes a decision rule, not a ClipStitchr recommendation."
          max={appAdCreativeTestingBlueprintFieldLimits.metricValue}
          optional
          step={0.01}
          value={value.target}
          onChange={(target) => onChange({ ...value, target })}
        />
      </div>
    </div>
  );
}
