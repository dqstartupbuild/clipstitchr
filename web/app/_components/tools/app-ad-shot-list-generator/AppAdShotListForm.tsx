import { AppAdShotListSelectField } from "@/app/_components/tools/app-ad-shot-list-generator/AppAdShotListSelectField";
import { ToolTextField } from "@/app/_components/tools/ToolTextField";
import { ToolTextareaField } from "@/app/_components/tools/ToolTextareaField";
import { Panel } from "@/app/_components/ui/Panel";
import { PanelHeader } from "@/app/_components/ui/PanelHeader";
import type { AppUgcBriefCreatorStyle } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/AppUgcBriefCreatorStyle";
import { appUgcBriefCreatorStyleOptions } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/appUgcBriefCreatorStyleOptions";
import type { AppAdShotListInput } from "@/lib/clipstitchr/tools/appAdShotList/AppAdShotListInput";
import type { AppAdShotListOpeningAngle } from "@/lib/clipstitchr/tools/appAdShotList/AppAdShotListOpeningAngle";
import type { AppAdShotListOpeningCount } from "@/lib/clipstitchr/tools/appAdShotList/AppAdShotListOpeningCount";
import { appAdShotListFieldLimits } from "@/lib/clipstitchr/tools/appAdShotList/appAdShotListFieldLimits";
import { appAdShotListOpeningAngleOptions } from "@/lib/clipstitchr/tools/appAdShotList/appAdShotListOpeningAngleOptions";
import { appAdShotListOpeningCountOptions } from "@/lib/clipstitchr/tools/appAdShotList/appAdShotListOpeningCountOptions";

type AppAdShotListFormProps = {
  onChange: (input: AppAdShotListInput) => void;
  value: AppAdShotListInput;
};

export function AppAdShotListForm({ onChange, value }: AppAdShotListFormProps) {
  return (
    <Panel className="h-fit p-5 md:p-6">
      <PanelHeader
        eyebrow="Your shoot"
        title="What should each file help show?"
        description="Keep each answer focused on one app-ad concept. The capture list updates as you type."
      />
      <div className="mt-6 grid gap-5">
        <ToolTextField
          id="shot-list-app"
          label="App name"
          maxLength={appAdShotListFieldLimits.appName}
          value={value.appName}
          onChange={(appName) => onChange({ ...value, appName })}
        />
        <ToolTextareaField
          id="shot-list-audience"
          label="Who should recognize this ad?"
          maxLength={appAdShotListFieldLimits.audience}
          value={value.audience}
          onChange={(audience) => onChange({ ...value, audience })}
        />
        <ToolTextareaField
          id="shot-list-problem"
          label="What frustrating moment should the footage recognize?"
          maxLength={appAdShotListFieldLimits.problem}
          value={value.problem}
          onChange={(problem) => onChange({ ...value, problem })}
        />
        <ToolTextareaField
          id="shot-list-demo"
          label="What one product moment should the demo show?"
          maxLength={appAdShotListFieldLimits.productMoment}
          value={value.productMoment}
          onChange={(productMoment) => onChange({ ...value, productMoment })}
        />
        <ToolTextareaField
          id="shot-list-outcome"
          label="What useful outcome do they want?"
          maxLength={appAdShotListFieldLimits.desiredOutcome}
          value={value.desiredOutcome}
          onChange={(desiredOutcome) => onChange({ ...value, desiredOutcome })}
        />
        <ToolTextareaField
          id="shot-list-proof"
          label="What proof can you honestly support? (optional)"
          required={false}
          maxLength={appAdShotListFieldLimits.proofPoint}
          value={value.proofPoint}
          onChange={(proofPoint) => onChange({ ...value, proofPoint })}
        />
        <ToolTextareaField
          id="shot-list-cta"
          label="Call to action"
          maxLength={appAdShotListFieldLimits.callToAction}
          value={value.callToAction}
          onChange={(callToAction) => onChange({ ...value, callToAction })}
        />
        <AppAdShotListSelectField
          id="shot-list-style"
          label="Creator style"
          description="This changes the framing and whether openings are spoken or visual."
          options={appUgcBriefCreatorStyleOptions}
          value={value.creatorStyle}
          onChange={(creatorStyle) =>
            onChange({
              ...value,
              creatorStyle: creatorStyle as AppUgcBriefCreatorStyle,
            })
          }
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <AppAdShotListSelectField
            id="shot-list-angle"
            label="Opening angle"
            description="The idea the first captured beat should lead with."
            options={appAdShotListOpeningAngleOptions}
            value={value.openingAngle}
            onChange={(openingAngle) =>
              onChange({
                ...value,
                openingAngle: openingAngle as AppAdShotListOpeningAngle,
              })
            }
          />
          <AppAdShotListSelectField
            id="shot-list-count"
            label="Openings to capture"
            description="Each opening becomes its own reusable source file."
            options={appAdShotListOpeningCountOptions}
            value={value.openingCount}
            onChange={(openingCount) =>
              onChange({
                ...value,
                openingCount: Number(openingCount) as AppAdShotListOpeningCount,
              })
            }
          />
        </div>
      </div>
    </Panel>
  );
}
