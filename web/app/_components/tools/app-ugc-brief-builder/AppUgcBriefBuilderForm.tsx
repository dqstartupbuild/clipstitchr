import { AppUgcBriefSelectField } from "@/app/_components/tools/app-ugc-brief-builder/AppUgcBriefSelectField";
import { AppUgcBriefTextField } from "@/app/_components/tools/app-ugc-brief-builder/AppUgcBriefTextField";
import { Panel } from "@/app/_components/ui/Panel";
import { PanelHeader } from "@/app/_components/ui/PanelHeader";
import type { AppUgcBriefCreatorStyle } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/AppUgcBriefCreatorStyle";
import type { AppUgcBriefDeliverableSize } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/AppUgcBriefDeliverableSize";
import type { AppUgcBriefInput } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/AppUgcBriefInput";
import type { AppUgcBriefTone } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/AppUgcBriefTone";
import { appUgcBriefCreatorStyleOptions } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/appUgcBriefCreatorStyleOptions";
import { appUgcBriefDeliverableSizeOptions } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/appUgcBriefDeliverableSizeOptions";
import { appUgcBriefFieldLimits } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/appUgcBriefFieldLimits";
import { appUgcBriefToneOptions } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/appUgcBriefToneOptions";

type AppUgcBriefBuilderFormProps = {
  value: AppUgcBriefInput;
  onChange: (value: AppUgcBriefInput) => void;
};

export function AppUgcBriefBuilderForm({
  value,
  onChange,
}: AppUgcBriefBuilderFormProps) {
  return (
    <Panel className="h-fit p-5 md:p-6">
      <PanelHeader
        eyebrow="Your creator direction"
        title="What should this footage help communicate?"
        description="Use plain language you would feel comfortable sending to a real creator. Your brief updates as you type."
      />
      <div className="mt-6 grid gap-5">
        <AppUgcBriefTextField
          id="app-ugc-brief-name"
          label="App name"
          description="The product the later demo will show."
          maxLength={appUgcBriefFieldLimits.appName}
          placeholder="FocusFlow"
          value={value.appName}
          onChange={(appName) => onChange({ ...value, appName })}
        />
        <AppUgcBriefTextField
          multiline
          id="app-ugc-brief-audience"
          label="Who is the ad for?"
          description="Name the person and situation they recognize."
          maxLength={appUgcBriefFieldLimits.audience}
          placeholder="Indie app founders who make their own ads"
          value={value.audience}
          onChange={(audience) => onChange({ ...value, audience })}
        />
        <AppUgcBriefTextField
          multiline
          id="app-ugc-brief-problem"
          label="What frustrating moment should the opening recognize?"
          description="Keep it specific enough to film or say naturally."
          maxLength={appUgcBriefFieldLimits.problem}
          placeholder="Every new ad starts from an empty editing timeline"
          value={value.problem}
          onChange={(problem) => onChange({ ...value, problem })}
        />
        <AppUgcBriefTextField
          multiline
          id="app-ugc-brief-outcome"
          label="What do they want instead?"
          description="Describe the useful outcome without a guarantee."
          maxLength={appUgcBriefFieldLimits.desiredOutcome}
          placeholder="Reuse good footage across more app ads"
          value={value.desiredOutcome}
          onChange={(desiredOutcome) =>
            onChange({ ...value, desiredOutcome })
          }
        />
        <AppUgcBriefTextField
          multiline
          id="app-ugc-brief-feature"
          label="What product moment should the demo show?"
          description="Choose one feature or action the footage can hand off to."
          maxLength={appUgcBriefFieldLimits.keyFeature}
          placeholder="Pairing a saved UGC opening with a product demo"
          value={value.keyFeature}
          onChange={(keyFeature) => onChange({ ...value, keyFeature })}
        />
        <AppUgcBriefTextField
          multiline
          required={false}
          id="app-ugc-brief-proof"
          label="What proof can you honestly support? (optional)"
          description="Leave this blank and the brief will tell the creator not to invent proof."
          maxLength={appUgcBriefFieldLimits.proofPoint}
          placeholder="Only include a fact or quote you have approved"
          value={value.proofPoint}
          onChange={(proofPoint) => onChange({ ...value, proofPoint })}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <AppUgcBriefSelectField
            id="app-ugc-brief-style"
            label="Creator style"
            description="The balance of spoken and silent source footage."
            options={appUgcBriefCreatorStyleOptions}
            value={value.creatorStyle}
            onChange={(creatorStyle) =>
              onChange({
                ...value,
                creatorStyle: creatorStyle as AppUgcBriefCreatorStyle,
              })
            }
          />
          <AppUgcBriefSelectField
            id="app-ugc-brief-tone"
            label="Tone"
            description="How the creator should feel, not a rigid performance."
            options={appUgcBriefToneOptions}
            value={value.tone}
            onChange={(tone) =>
              onChange({ ...value, tone: tone as AppUgcBriefTone })
            }
          />
        </div>
        <AppUgcBriefTextField
          multiline
          id="app-ugc-brief-cta"
          label="Call to action"
          description="The honest next step the creator can invite."
          maxLength={appUgcBriefFieldLimits.callToAction}
          placeholder="See how the app works"
          value={value.callToAction}
          onChange={(callToAction) => onChange({ ...value, callToAction })}
        />
        <AppUgcBriefSelectField
          id="app-ugc-brief-deliverables"
          label="Desired deliverables"
          description="Every item is requested as its own file so it can be reused."
          options={appUgcBriefDeliverableSizeOptions.map((option) => ({
            label: `${option.label} — ${option.description}`,
            value: option.value,
          }))}
          value={value.deliverableSize}
          onChange={(deliverableSize) =>
            onChange({
              ...value,
              deliverableSize:
                deliverableSize as AppUgcBriefDeliverableSize,
            })
          }
        />
      </div>
    </Panel>
  );
}
