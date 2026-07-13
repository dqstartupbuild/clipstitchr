import type { FormEvent } from "react";
import { PanelsTopLeft } from "lucide-react";
import { HookVisualPreferredOpeningField } from "@/app/_components/tools/hook-to-visual-matchmaker/HookVisualPreferredOpeningField";
import { ToolTextField } from "@/app/_components/tools/ToolTextField";
import { ToolTextareaField } from "@/app/_components/tools/ToolTextareaField";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import { PanelHeader } from "@/app/_components/ui/PanelHeader";
import type { HookVisualMatchmakerInput } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/HookVisualMatchmakerInput";
import { hookVisualMatchmakerFieldLimits } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/hookVisualMatchmakerFieldLimits";

type HookVisualMatchmakerFormProps = {
  value: HookVisualMatchmakerInput;
  onSubmit: () => void;
  onValueChange: (value: HookVisualMatchmakerInput) => void;
};

export function HookVisualMatchmakerForm({
  onSubmit,
  onValueChange,
  value,
}: HookVisualMatchmakerFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <Panel className="h-fit p-5 md:p-6">
      <PanelHeader
        eyebrow="Your hook and footage"
        title="Describe only what you can actually show."
        description="Leave a footage field blank when that asset does not exist yet."
      />
      <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
        <ToolTextareaField
          id="hook-visual-hook"
          label="Hook"
          maxLength={hookVisualMatchmakerFieldLimits.hook}
          value={value.hook}
          onChange={(hook) => onValueChange({ ...value, hook })}
        />
        <ToolTextField
          id="hook-visual-app"
          label="App name or category"
          maxLength={hookVisualMatchmakerFieldLimits.appContext}
          value={value.appContext}
          onChange={(appContext) => onValueChange({ ...value, appContext })}
        />
        <ToolTextField
          id="hook-visual-audience"
          label="Audience"
          maxLength={hookVisualMatchmakerFieldLimits.audience}
          value={value.audience}
          onChange={(audience) => onValueChange({ ...value, audience })}
        />
        <ToolTextField
          id="hook-visual-action"
          label="Desired viewer action"
          maxLength={hookVisualMatchmakerFieldLimits.desiredAction}
          value={value.desiredAction}
          onChange={(desiredAction) =>
            onValueChange({ ...value, desiredAction })
          }
        />
        <ToolTextareaField
          description="Describe the UGC, founder, reaction, or real-life footage already available."
          id="hook-visual-ugc"
          label="Available UGC footage"
          maxLength={hookVisualMatchmakerFieldLimits.ugcFootage}
          required={false}
          value={value.ugcFootage}
          onChange={(ugcFootage) => onValueChange({ ...value, ugcFootage })}
        />
        <ToolTextareaField
          description="Describe the exact app action and visible change already captured."
          id="hook-visual-demo"
          label="Available demo moment"
          maxLength={hookVisualMatchmakerFieldLimits.demoMoment}
          required={false}
          value={value.demoMoment}
          onChange={(demoMoment) => onValueChange({ ...value, demoMoment })}
        />
        <HookVisualPreferredOpeningField
          value={value.preferredOpening}
          onChange={(preferredOpening) =>
            onValueChange({ ...value, preferredOpening })
          }
        />
        <Button
          className="w-full sm:w-fit"
          icon={<PanelsTopLeft aria-hidden className="h-4 w-4" />}
          type="submit"
        >
          Build the opening
        </Button>
      </form>
    </Panel>
  );
}
