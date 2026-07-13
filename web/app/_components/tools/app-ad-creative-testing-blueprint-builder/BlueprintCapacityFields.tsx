import { BlueprintNumberField } from "@/app/_components/tools/app-ad-creative-testing-blueprint-builder/BlueprintNumberField";
import type { AppAdCreativeTestingBlueprintInput } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/AppAdCreativeTestingBlueprintInput";
import { appAdCreativeTestingBlueprintFieldLimits } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/appAdCreativeTestingBlueprintFieldLimits";

type BlueprintCapacityFieldsProps = {
  value: AppAdCreativeTestingBlueprintInput;
  onChange: (value: AppAdCreativeTestingBlueprintInput) => void;
};

export function BlueprintCapacityFields({
  onChange,
  value,
}: BlueprintCapacityFieldsProps) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <BlueprintNumberField
          id="blueprint-ugc"
          label="UGC openings"
          description="Distinct opening source clips you can reuse."
          max={appAdCreativeTestingBlueprintFieldLimits.assetCount}
          value={value.ugcOpenings}
          onChange={(ugcOpenings) =>
            onChange({ ...value, ugcOpenings: ugcOpenings ?? 0 })
          }
        />
        <BlueprintNumberField
          id="blueprint-demos"
          label="Product-demo moments"
          description="Distinct, readable app actions or payoffs."
          max={appAdCreativeTestingBlueprintFieldLimits.assetCount}
          value={value.demos}
          onChange={(demos) => onChange({ ...value, demos: demos ?? 0 })}
        />
        <BlueprintNumberField
          id="blueprint-proof-assets"
          label="Approved proof assets"
          description="Count only evidence the team can honestly use."
          max={appAdCreativeTestingBlueprintFieldLimits.assetCount}
          value={value.proofAssets}
          onChange={(proofAssets) =>
            onChange({ ...value, proofAssets: proofAssets ?? 0 })
          }
        />
        <BlueprintNumberField
          id="blueprint-hooks"
          label="Hook directions"
          description="Different opening messages, not duplicate exports."
          max={appAdCreativeTestingBlueprintFieldLimits.assetCount}
          value={value.hooks}
          onChange={(hooks) => onChange({ ...value, hooks: hooks ?? 0 })}
        />
        <BlueprintNumberField
          id="blueprint-ctas"
          label="Calls to action"
          description="Honest next-step directions available to test."
          max={appAdCreativeTestingBlueprintFieldLimits.assetCount}
          value={value.ctas}
          onChange={(ctas) => onChange({ ...value, ctas: ctas ?? 0 })}
        />
        <BlueprintNumberField
          id="blueprint-production-capacity"
          label="Weekly production capacity"
          description="The blueprint activates at most nine cells."
          max={
            appAdCreativeTestingBlueprintFieldLimits.weeklyProductionCapacity
          }
          min={1}
          value={value.weeklyProductionCapacity}
          onChange={(weeklyProductionCapacity) =>
            onChange({
              ...value,
              weeklyProductionCapacity: weeklyProductionCapacity ?? 0,
            })
          }
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <BlueprintNumberField
          id="blueprint-budget"
          label="Weekly budget (optional)"
          description="Used only with your minimum spend assumption."
          max={appAdCreativeTestingBlueprintFieldLimits.money}
          optional
          step={0.01}
          value={value.weeklyBudget}
          onChange={(weeklyBudget) => onChange({ ...value, weeklyBudget })}
        />
        <BlueprintNumberField
          id="blueprint-minimum-spend"
          label="Minimum spend per cell (optional)"
          description="Your evidence floor, not a recommendation."
          max={appAdCreativeTestingBlueprintFieldLimits.money}
          optional
          step={0.01}
          value={value.minimumSpendPerVariant}
          onChange={(minimumSpendPerVariant) =>
            onChange({ ...value, minimumSpendPerVariant })
          }
        />
        <BlueprintNumberField
          id="blueprint-minimum-events"
          label="Conversion events before review (optional)"
          description="A visitor-defined floor for the Hold rule."
          max={appAdCreativeTestingBlueprintFieldLimits.conversionEvents}
          optional
          value={value.minimumConversionEvents}
          onChange={(minimumConversionEvents) =>
            onChange({ ...value, minimumConversionEvents })
          }
        />
      </div>
    </div>
  );
}
