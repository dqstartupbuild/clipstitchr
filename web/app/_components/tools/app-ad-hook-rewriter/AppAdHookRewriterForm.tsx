import type { FormEvent } from "react";
import { RefreshCw } from "lucide-react";
import { ToolTextField } from "@/app/_components/tools/ToolTextField";
import { ToolTextareaField } from "@/app/_components/tools/ToolTextareaField";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import { PanelHeader } from "@/app/_components/ui/PanelHeader";
import type { AppAdHookRewriterInput } from "@/lib/clipstitchr/tools/appAdHookRewriter/AppAdHookRewriterInput";
import { appAdHookRewriterFieldLimits } from "@/lib/clipstitchr/tools/appAdHookRewriter/appAdHookRewriterFieldLimits";

type AppAdHookRewriterFormProps = {
  value: AppAdHookRewriterInput;
  onSubmit: () => void;
  onValueChange: (value: AppAdHookRewriterInput) => void;
};

export function AppAdHookRewriterForm({
  onSubmit,
  onValueChange,
  value,
}: AppAdHookRewriterFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <Panel className="h-fit p-5 md:p-6">
      <PanelHeader
        eyebrow="Your current idea"
        title="Keep the context honest and specific."
        description="The current line guides the intent. Your real app context grounds every alternative."
      />
      <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
        <ToolTextareaField
          id="app-ad-hook-rewriter-hook"
          label="Current hook"
          maxLength={appAdHookRewriterFieldLimits.currentHook}
          value={value.currentHook}
          onChange={(currentHook) => onValueChange({ ...value, currentHook })}
        />
        <ToolTextField
          id="app-ad-hook-rewriter-app"
          label="App name or category"
          maxLength={appAdHookRewriterFieldLimits.appContext}
          value={value.appContext}
          onChange={(appContext) => onValueChange({ ...value, appContext })}
        />
        <ToolTextField
          id="app-ad-hook-rewriter-audience"
          label="Target audience"
          maxLength={appAdHookRewriterFieldLimits.audience}
          value={value.audience}
          onChange={(audience) => onValueChange({ ...value, audience })}
        />
        <ToolTextareaField
          id="app-ad-hook-rewriter-problem"
          label="Problem"
          maxLength={appAdHookRewriterFieldLimits.problem}
          value={value.problem}
          onChange={(problem) => onValueChange({ ...value, problem })}
        />
        <ToolTextareaField
          id="app-ad-hook-rewriter-outcome"
          label="Desired outcome"
          maxLength={appAdHookRewriterFieldLimits.desiredOutcome}
          value={value.desiredOutcome}
          onChange={(desiredOutcome) =>
            onValueChange({ ...value, desiredOutcome })
          }
        />
        <ToolTextareaField
          description="Optional. Use this to keep the rewrite connected to the first shot."
          id="app-ad-hook-rewriter-visual"
          label="First visual"
          maxLength={appAdHookRewriterFieldLimits.firstVisual}
          required={false}
          value={value.firstVisual}
          onChange={(firstVisual) => onValueChange({ ...value, firstVisual })}
        />
        <Button
          className="w-full sm:w-fit"
          icon={<RefreshCw aria-hidden className="h-4 w-4" />}
          type="submit"
        >
          Rewrite this hook
        </Button>
      </form>
    </Panel>
  );
}
