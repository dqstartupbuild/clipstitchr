import { ToolTextField } from "@/app/_components/tools/ToolTextField";
import { ToolTextareaField } from "@/app/_components/tools/ToolTextareaField";
import type { AppAdCreativeTestingBlueprintInput } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/AppAdCreativeTestingBlueprintInput";
import { appAdCreativeTestingBlueprintFieldLimits } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/appAdCreativeTestingBlueprintFieldLimits";

type BlueprintContextFieldsProps = {
  value: AppAdCreativeTestingBlueprintInput;
  onChange: (value: AppAdCreativeTestingBlueprintInput) => void;
};

export function BlueprintContextFields({
  onChange,
  value,
}: BlueprintContextFieldsProps) {
  return (
    <div className="grid gap-5">
      <ToolTextField
        id="blueprint-app-name"
        label="App name"
        maxLength={appAdCreativeTestingBlueprintFieldLimits.appName}
        placeholder="FocusFlow"
        value={value.appName}
        onChange={(appName) => onChange({ ...value, appName })}
      />
      <ToolTextareaField
        id="blueprint-audience"
        label="Who should recognize the ad?"
        description="Name one specific audience for a fair comparison."
        maxLength={appAdCreativeTestingBlueprintFieldLimits.audience}
        placeholder="Busy app founders who lose focus to scattered tasks"
        value={value.audience}
        onChange={(audience) => onChange({ ...value, audience })}
      />
      <ToolTextareaField
        id="blueprint-outcome"
        label="What product outcome should the ad make clear?"
        maxLength={appAdCreativeTestingBlueprintFieldLimits.productOutcome}
        placeholder="Finish the day's most important work with less task switching"
        value={value.productOutcome}
        onChange={(productOutcome) => onChange({ ...value, productOutcome })}
      />
      <ToolTextareaField
        id="blueprint-objection"
        label="What is the main objection or hesitation?"
        maxLength={appAdCreativeTestingBlueprintFieldLimits.mainObjection}
        placeholder="Another productivity app will add more setup"
        value={value.mainObjection}
        onChange={(mainObjection) => onChange({ ...value, mainObjection })}
      />
      <ToolTextareaField
        id="blueprint-proof"
        label="Approved proof you can honestly support (optional)"
        description="Leave this blank if the proof has not been captured or verified."
        maxLength={appAdCreativeTestingBlueprintFieldLimits.approvedProof}
        placeholder="A demo can show one task moving from capture to done"
        required={false}
        value={value.approvedProof}
        onChange={(approvedProof) => onChange({ ...value, approvedProof })}
      />
    </div>
  );
}
