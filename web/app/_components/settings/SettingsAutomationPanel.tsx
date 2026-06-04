import { Bot, Clock } from "lucide-react";
import { AutomationStitchrTextStylePicker } from "@/app/_components/settings/AutomationStitchrTextStylePicker";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import { automationToolOptions } from "@/lib/clipstitchr/constants/automationToolOptions";
import type { AutomationStitchrTextStyleChoice } from "@/lib/clipstitchr/types/AutomationStitchrTextStyleChoice";
import type { AutomationPreferencesInput } from "@/lib/clipstitchr/types/AutomationPreferencesInput";
import type { AutomationTool } from "@/lib/clipstitchr/types/AutomationTool";

type SettingsAutomationPanelProps = {
  error: string | null;
  isLoading: boolean;
  isSaving: boolean;
  preferences: AutomationPreferencesInput;
  onSave: (preferences: AutomationPreferencesInput) => Promise<void>;
};

function toggleTool(tools: AutomationTool[], tool: AutomationTool) {
  return tools.includes(tool)
    ? tools.filter((enabledTool) => enabledTool !== tool)
    : [...tools, tool];
}

export function SettingsAutomationPanel({
  error,
  isLoading,
  isSaving,
  preferences,
  onSave,
}: SettingsAutomationPanelProps) {
  const handleEnabledChange = async () => {
    await onSave({ ...preferences, enabled: !preferences.enabled });
  };
  const handleToolChange = async (tool: AutomationTool) => {
    await onSave({
      ...preferences,
      enabledTools: toggleTool(preferences.enabledTools, tool),
    });
  };
  const handleStitchrTextStyleChange = async (
    stitchrTextStyleChoice: AutomationStitchrTextStyleChoice,
  ) => {
    await onSave({
      ...preferences,
      stitchrTextStyleChoice,
    });
  };

  return (
    <Panel className="p-5">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted text-accent">
              <Bot aria-hidden className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-accent-dark">
                Automation
              </p>
              <h2 className="mt-1 text-lg font-bold text-text-primary">
                Daily drafts
              </h2>
            </div>
          </div>
          <Button
            type="button"
            variant={preferences.enabled ? "secondary" : "primary"}
            isLoading={isSaving}
            disabled={isLoading}
            onClick={handleEnabledChange}
          >
            {preferences.enabled ? "Pause" : "Enable"}
          </Button>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-text-secondary">
          <Clock aria-hidden className="h-4 w-4 text-accent" />
          <span>09:00-13:00 UTC</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {automationToolOptions.map((tool) => (
            <label
              key={tool.id}
              className="flex min-h-11 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-primary"
            >
              <input
                type="checkbox"
                className="h-4 w-4 accent-accent"
                checked={preferences.enabledTools.includes(tool.id)}
                disabled={isLoading || isSaving}
                onChange={() => void handleToolChange(tool.id)}
              />
              {tool.label}
            </label>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-text-primary">
            Stitchr text style
          </p>
          <AutomationStitchrTextStylePicker
            disabled={isLoading || isSaving}
            value={preferences.stitchrTextStyleChoice}
            onChange={(value) => void handleStitchrTextStyleChange(value)}
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </Panel>
  );
}
