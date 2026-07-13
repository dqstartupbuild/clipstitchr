import type { FormEvent } from "react";
import { Gauge } from "lucide-react";
import { ToolTextField } from "@/app/_components/tools/ToolTextField";
import { ToolTextareaField } from "@/app/_components/tools/ToolTextareaField";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import { PanelHeader } from "@/app/_components/ui/PanelHeader";
import type { AppAdHookGraderInput } from "@/lib/clipstitchr/tools/appAdHookGrader/AppAdHookGraderInput";
import { appAdHookGraderFieldLimits } from "@/lib/clipstitchr/tools/appAdHookGrader/appAdHookGraderFieldLimits";

type AppAdHookGraderFormProps = {
  value: AppAdHookGraderInput;
  onSubmit: () => void;
  onValueChange: (value: AppAdHookGraderInput) => void;
};

export function AppAdHookGraderForm({
  onSubmit,
  onValueChange,
  value,
}: AppAdHookGraderFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <Panel className="h-fit p-5 md:p-6">
      <PanelHeader
        eyebrow="Your opening"
        title="Give the hook enough context to grade fairly."
        description="The optional first visual makes the handoff check more useful."
      />
      <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
        <ToolTextareaField
          id="app-ad-hook-grader-hook"
          label="Hook"
          maxLength={appAdHookGraderFieldLimits.hook}
          value={value.hook}
          onChange={(hook) => onValueChange({ ...value, hook })}
        />
        <ToolTextField
          id="app-ad-hook-grader-app"
          label="App name or category"
          maxLength={appAdHookGraderFieldLimits.appContext}
          value={value.appContext}
          onChange={(appContext) => onValueChange({ ...value, appContext })}
        />
        <ToolTextField
          id="app-ad-hook-grader-audience"
          label="Target audience"
          maxLength={appAdHookGraderFieldLimits.audience}
          value={value.audience}
          onChange={(audience) => onValueChange({ ...value, audience })}
        />
        <ToolTextareaField
          id="app-ad-hook-grader-outcome"
          label="Desired outcome"
          maxLength={appAdHookGraderFieldLimits.desiredOutcome}
          value={value.desiredOutcome}
          onChange={(desiredOutcome) =>
            onValueChange({ ...value, desiredOutcome })
          }
        />
        <ToolTextareaField
          description="Leave this blank if the opening shot is not planned yet."
          id="app-ad-hook-grader-visual"
          label="First visual (optional)"
          maxLength={appAdHookGraderFieldLimits.firstVisual}
          required={false}
          value={value.firstVisual}
          onChange={(firstVisual) => onValueChange({ ...value, firstVisual })}
        />
        <Button
          className="w-full sm:w-fit"
          icon={<Gauge aria-hidden className="h-4 w-4" />}
          type="submit"
        >
          Grade this hook
        </Button>
      </form>
    </Panel>
  );
}
