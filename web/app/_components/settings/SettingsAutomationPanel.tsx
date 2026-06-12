"use client";

import { useMemo, useState } from "react";
import { Bot, Clock } from "lucide-react";
import { AutomationCliprModePicker } from "@/app/_components/settings/AutomationCliprModePicker";
import { AutomationStitchrColorChoicePicker } from "@/app/_components/settings/AutomationStitchrColorChoicePicker";
import { AutomationStitchrTextStylePicker } from "@/app/_components/settings/AutomationStitchrTextStylePicker";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import { automationToolOptions } from "@/lib/clipstitchr/constants/automationToolOptions";
import { TEXT_OVERLAY_STYLES } from "@/lib/clipstitchr/constants/textOverlayStyles";
import type { AutomationStitchrColorChoice } from "@/lib/clipstitchr/types/AutomationStitchrColorChoice";
import type { AutomationStitchrTextStyleChoice } from "@/lib/clipstitchr/types/AutomationStitchrTextStyleChoice";
import type { AutomationPreferencesInput } from "@/lib/clipstitchr/types/AutomationPreferencesInput";
import type { AutomationTool } from "@/lib/clipstitchr/types/AutomationTool";
import type { CliprGenerationMode } from "@/lib/clipstitchr/types/CliprGenerationMode";
import { getCssColorHex } from "@/lib/clipstitchr/utils/getCssColorHex";

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

function getAutomationPreferencesKey(preferences: AutomationPreferencesInput) {
  return JSON.stringify(preferences);
}

export function SettingsAutomationPanel({
  error,
  isLoading,
  isSaving,
  preferences,
  onSave,
}: SettingsAutomationPanelProps) {
  const preferencesKey = useMemo(
    () => getAutomationPreferencesKey(preferences),
    [preferences],
  );
  const [draftState, setDraftState] = useState({
    preferences,
    preferencesKey,
  });
  const draftPreferences =
    draftState.preferencesKey === preferencesKey
      ? draftState.preferences
      : preferences;
  const draftPreferencesKey = useMemo(
    () => getAutomationPreferencesKey(draftPreferences),
    [draftPreferences],
  );
  const selectedTextStyle =
    draftPreferences.stitchrTextStyleChoice === "any"
      ? undefined
      : TEXT_OVERLAY_STYLES.find(
          (style) => style.id === draftPreferences.stitchrTextStyleChoice,
        );
  const showsBackgroundColor =
    draftPreferences.stitchrTextStyleChoice === "any" ||
    Boolean(selectedTextStyle?.backgroundColor);
  const textColorFallback = getCssColorHex(
    selectedTextStyle?.color ?? "#ffffff",
    "#ffffff",
  );
  const backgroundColorFallback = getCssColorHex(
    selectedTextStyle?.backgroundColor ?? "rgba(2, 6, 23, 0.72)",
    "#020617",
  );
  const hasChanges = preferencesKey !== draftPreferencesKey;

  if (draftState.preferencesKey !== preferencesKey) {
    setDraftState({ preferences, preferencesKey });
  }

  const updateDraftPreferences = (
    nextPreferences: AutomationPreferencesInput,
  ) => {
    setDraftState({ preferences: nextPreferences, preferencesKey });
  };
  const handleEnabledChange = () => {
    updateDraftPreferences({
      ...draftPreferences,
      enabled: !draftPreferences.enabled,
    });
  };
  const handleToolChange = (tool: AutomationTool) => {
    updateDraftPreferences({
      ...draftPreferences,
      enabledTools: toggleTool(draftPreferences.enabledTools, tool),
    });
  };
  const handleStitchrTextStyleChange = (
    stitchrTextStyleChoice: AutomationStitchrTextStyleChoice,
  ) => {
    updateDraftPreferences({
      ...draftPreferences,
      stitchrTextStyleChoice,
    });
  };
  const handleStitchrTextColorChange = (
    stitchrTextColorChoice: AutomationStitchrColorChoice,
  ) => {
    updateDraftPreferences({
      ...draftPreferences,
      stitchrTextColorChoice,
    });
  };
  const handleStitchrBackgroundColorChange = (
    stitchrTextBackgroundColorChoice: AutomationStitchrColorChoice,
  ) => {
    updateDraftPreferences({
      ...draftPreferences,
      stitchrTextBackgroundColorChoice,
    });
  };
  const handleCliprModeChange = (cliprGenerationMode: CliprGenerationMode) => {
    updateDraftPreferences({
      ...draftPreferences,
      cliprGenerationMode,
    });
  };
  const handleSave = async () => {
    await onSave(draftPreferences);
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
            variant={draftPreferences.enabled ? "secondary" : "primary"}
            disabled={isLoading || isSaving}
            onClick={handleEnabledChange}
          >
            {draftPreferences.enabled ? "Pause" : "Enable"}
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
                checked={draftPreferences.enabledTools.includes(tool.id)}
                disabled={isLoading || isSaving}
                onChange={() => handleToolChange(tool.id)}
              />
              {tool.label}
            </label>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-text-primary">Clipr mode</p>
          <AutomationCliprModePicker
            disabled={isLoading || isSaving}
            value={draftPreferences.cliprGenerationMode}
            onChange={handleCliprModeChange}
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-text-primary">
            Stitchr text style
          </p>
          <AutomationStitchrTextStylePicker
            disabled={isLoading || isSaving}
            value={draftPreferences.stitchrTextStyleChoice}
            onChange={handleStitchrTextStyleChange}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <AutomationStitchrColorChoicePicker
            disabled={isLoading || isSaving}
            fallbackColor={textColorFallback}
            label="Text color"
            value={draftPreferences.stitchrTextColorChoice}
            onChange={handleStitchrTextColorChange}
          />
          {showsBackgroundColor ? (
            <AutomationStitchrColorChoicePicker
              disabled={isLoading || isSaving}
              fallbackColor={backgroundColorFallback}
              label="Background color"
              value={draftPreferences.stitchrTextBackgroundColorChoice}
              onChange={handleStitchrBackgroundColorChange}
            />
          ) : null}
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex justify-end">
          <Button
            type="button"
            variant="primary"
            isLoading={isSaving}
            disabled={isLoading || isSaving || !hasChanges}
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </div>
    </Panel>
  );
}
