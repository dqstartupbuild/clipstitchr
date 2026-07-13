import { BlueprintCapacityFields } from "@/app/_components/tools/app-ad-creative-testing-blueprint-builder/BlueprintCapacityFields";
import { BlueprintContextFields } from "@/app/_components/tools/app-ad-creative-testing-blueprint-builder/BlueprintContextFields";
import { BlueprintStrategyFields } from "@/app/_components/tools/app-ad-creative-testing-blueprint-builder/BlueprintStrategyFields";
import { Panel } from "@/app/_components/ui/Panel";
import { PanelHeader } from "@/app/_components/ui/PanelHeader";
import type { AppAdCreativeTestingBlueprintInput } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/AppAdCreativeTestingBlueprintInput";

type AppAdCreativeTestingBlueprintFormProps = {
  value: AppAdCreativeTestingBlueprintInput;
  onChange: (value: AppAdCreativeTestingBlueprintInput) => void;
};

export function AppAdCreativeTestingBlueprintForm({
  onChange,
  value,
}: AppAdCreativeTestingBlueprintFormProps) {
  return (
    <Panel className="h-fit p-5 md:p-6">
      <PanelHeader
        eyebrow="Your learning brief"
        title="What should this testing program teach you?"
        description="The blueprint updates locally. Your strategy, costs, and asset counts stay in this browser."
      />
      <div className="mt-6 grid gap-8">
        <BlueprintContextFields value={value} onChange={onChange} />
        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-bold text-text-primary">
            Strategy and evidence
          </h3>
          <div className="mt-5">
            <BlueprintStrategyFields value={value} onChange={onChange} />
          </div>
        </div>
        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-bold text-text-primary">
            Source assets and capacity
          </h3>
          <div className="mt-5">
            <BlueprintCapacityFields value={value} onChange={onChange} />
          </div>
        </div>
      </div>
    </Panel>
  );
}
