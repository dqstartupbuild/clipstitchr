import { Sparkles } from "lucide-react";
import type { FormEvent } from "react";
import { AppHookGeneratorEdgeField } from "@/app/_components/tools/app-hook-generator/AppHookGeneratorEdgeField";
import { AppHookGeneratorTextArea } from "@/app/_components/tools/app-hook-generator/AppHookGeneratorTextArea";
import { AppHookGeneratorTextInput } from "@/app/_components/tools/app-hook-generator/AppHookGeneratorTextInput";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import { PanelHeader } from "@/app/_components/ui/PanelHeader";
import { appHookGeneratorFieldLimits } from "@/lib/clipstitchr/tools/appHookGenerator/appHookGeneratorFieldLimits";
import type { AppHookGeneratorInput } from "@/lib/clipstitchr/tools/appHookGenerator/AppHookGeneratorInput";

type AppHookGeneratorFormProps = {
  error: string;
  isLoading: boolean;
  value: AppHookGeneratorInput;
  onSubmit: () => void;
  onValueChange: (value: AppHookGeneratorInput) => void;
};

export function AppHookGeneratorForm({
  error,
  isLoading,
  value,
  onSubmit,
  onValueChange,
}: AppHookGeneratorFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <Panel className="h-fit p-5 md:p-6">
      <PanelHeader
        eyebrow="Tell us about your app"
        title="Give each hook something real to say."
        description="Short, plain-English answers work best. Nothing you type is added to analytics events."
      />
      <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <AppHookGeneratorTextInput
            id="app-hook-name"
            label="App name"
            description="The name people will see in the hook."
            maxLength={appHookGeneratorFieldLimits.appName}
            placeholder="ClipStitchr"
            value={value.appName}
            onChange={(appName) => onValueChange({ ...value, appName })}
          />
          <AppHookGeneratorTextInput
            id="app-hook-audience"
            label="Who is it for?"
            description="Be specific enough that they recognize themselves."
            maxLength={appHookGeneratorFieldLimits.audience}
            placeholder="Bootstrapped app founders"
            value={value.audience}
            onChange={(audience) => onValueChange({ ...value, audience })}
          />
        </div>
        <AppHookGeneratorTextArea
          id="app-hook-problem"
          label="What problem does it help with?"
          description="Describe the frustrating moment your audience already knows."
          maxLength={appHookGeneratorFieldLimits.problem}
          placeholder="Turning product demos into short-form ads takes too long"
          value={value.problem}
          onChange={(problem) => onValueChange({ ...value, problem })}
        />
        <AppHookGeneratorTextArea
          id="app-hook-outcome"
          label="What do they want instead?"
          description="Name the useful result without adding made-up numbers or promises."
          maxLength={appHookGeneratorFieldLimits.desiredOutcome}
          placeholder="Launch more ad ideas without starting from a blank timeline"
          value={value.desiredOutcome}
          onChange={(desiredOutcome) =>
            onValueChange({ ...value, desiredOutcome })
          }
        />
        <AppHookGeneratorEdgeField
          value={value.edgeLevel}
          onChange={(edgeLevel) => onValueChange({ ...value, edgeLevel })}
        />
        {error ? (
          <p
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <Button
          className="h-11 w-full"
          icon={<Sparkles aria-hidden className="h-4 w-4" />}
          isLoading={isLoading}
          type="submit"
        >
          {isLoading ? "Building your hooks…" : "Generate 8 hooks"}
        </Button>
      </form>
    </Panel>
  );
}
