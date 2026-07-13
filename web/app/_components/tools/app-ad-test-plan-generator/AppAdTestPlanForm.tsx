import { AppAdTestPlanNumberField } from "@/app/_components/tools/app-ad-test-plan-generator/AppAdTestPlanNumberField";
import { AppAdTestPlanTextField } from "@/app/_components/tools/app-ad-test-plan-generator/AppAdTestPlanTextField";
import { Panel } from "@/app/_components/ui/Panel";
import { PanelHeader } from "@/app/_components/ui/PanelHeader";
import type { AppAdTestPlanInput } from "@/lib/clipstitchr/tools/appAdTestPlan/AppAdTestPlanInput";
import { appAdTestPlanFieldLimits } from "@/lib/clipstitchr/tools/appAdTestPlan/appAdTestPlanFieldLimits";

type AppAdTestPlanFormProps = {
  value: AppAdTestPlanInput;
  onChange: (value: AppAdTestPlanInput) => void;
};

export function AppAdTestPlanForm({
  value,
  onChange,
}: AppAdTestPlanFormProps) {
  return (
    <Panel className="h-fit p-5 md:p-6">
      <PanelHeader
        eyebrow="Your current test material"
        title="What can you make and test now?"
        description="The plan updates immediately. Enter zero when an asset is still missing."
      />
      <div className="mt-6 grid gap-5">
        <AppAdTestPlanTextField
          id="app-ad-test-plan-name"
          label="App name"
          description="Used only to label your copyable plan."
          maxLength={appAdTestPlanFieldLimits.appName}
          placeholder="FocusFlow"
          value={value.appName}
          onChange={(appName) => onChange({ ...value, appName })}
        />
        <AppAdTestPlanTextField
          multiline
          id="app-ad-test-plan-goal"
          label="What do you need to learn?"
          description="Name the decision this test should make easier."
          maxLength={appAdTestPlanFieldLimits.goal}
          placeholder="Find the opening that earns attention for the demo"
          value={value.goal}
          onChange={(goal) => onChange({ ...value, goal })}
        />
        <AppAdTestPlanTextField
          multiline
          id="app-ad-test-plan-audience"
          label="Who should recognize the ad?"
          description="Keep the same audience context across the comparison."
          maxLength={appAdTestPlanFieldLimits.audience}
          placeholder="Bootstrapped app founders"
          value={value.audience}
          onChange={(audience) => onChange({ ...value, audience })}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <AppAdTestPlanNumberField
            id="app-ad-test-plan-ugc"
            label="UGC openings"
            description="Distinct Hook/UGC clips you can compare."
            max={appAdTestPlanFieldLimits.assetCount}
            value={value.ugcOpeningCount}
            onChange={(ugcOpeningCount) =>
              onChange({ ...value, ugcOpeningCount })
            }
          />
          <AppAdTestPlanNumberField
            id="app-ad-test-plan-demos"
            label="Product demos"
            description="Different product moments you can rotate later."
            max={appAdTestPlanFieldLimits.assetCount}
            value={value.demoCount}
            onChange={(demoCount) => onChange({ ...value, demoCount })}
          />
          <AppAdTestPlanNumberField
            id="app-ad-test-plan-hooks"
            label="Hook directions"
            description="Opening text or spoken ideas to compare in Wave 2."
            max={appAdTestPlanFieldLimits.assetCount}
            value={value.hookCount}
            onChange={(hookCount) => onChange({ ...value, hookCount })}
          />
          <AppAdTestPlanNumberField
            id="app-ad-test-plan-ctas"
            label="Calls to action"
            description="Different honest next steps for the final wave."
            max={appAdTestPlanFieldLimits.assetCount}
            value={value.callToActionCount}
            onChange={(callToActionCount) =>
              onChange({ ...value, callToActionCount })
            }
          />
        </div>
        <AppAdTestPlanNumberField
          id="app-ad-test-plan-capacity"
          label="Weekly production capacity"
          description="How many finished variants your team can prepare in one week, from 1 to 20."
          min={1}
          max={appAdTestPlanFieldLimits.weeklyProductionCapacity}
          value={value.weeklyProductionCapacity}
          onChange={(weeklyProductionCapacity) =>
            onChange({ ...value, weeklyProductionCapacity })
          }
        />
        <AppAdTestPlanNumberField
          id="app-ad-test-plan-budget"
          label="Weekly testing budget in USD (optional)"
          description="Enter zero to hide budget math. Any amount is divided evenly, not recommended."
          max={appAdTestPlanFieldLimits.weeklyTestingBudget}
          step={0.01}
          value={value.weeklyTestingBudget}
          onChange={(weeklyTestingBudget) =>
            onChange({ ...value, weeklyTestingBudget })
          }
        />
      </div>
    </Panel>
  );
}
