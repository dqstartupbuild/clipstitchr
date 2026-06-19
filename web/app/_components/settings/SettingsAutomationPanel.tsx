"use client";

import { useMemo, useState } from "react";
import { Bot, Clock } from "lucide-react";
import { AutomationCliprModePicker } from "@/app/_components/settings/AutomationCliprModePicker";
import { AutomationGenerationCountPicker } from "@/app/_components/settings/AutomationGenerationCountPicker";
import { AutomationStitchrTemplateAllocationPicker } from "@/app/_components/settings/AutomationStitchrTemplateAllocationPicker";
import { AutomationStitchrColorChoicePicker } from "@/app/_components/settings/AutomationStitchrColorChoicePicker";
import { AutomationStitchrTextStylePicker } from "@/app/_components/settings/AutomationStitchrTextStylePicker";
import { AutomationSwiprPackPicker } from "@/app/_components/settings/AutomationSwiprPackPicker";
import { AutomationToolConfigDisclosure } from "@/app/_components/settings/AutomationToolConfigDisclosure";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import { automationToolOptions } from "@/lib/clipstitchr/constants/automationToolOptions";
import { TEXT_OVERLAY_STYLES } from "@/lib/clipstitchr/constants/textOverlayStyles";
import type { AutomationGenerationCount } from "@/lib/clipstitchr/types/AutomationGenerationCount";
import type { AutomationStitchrColorChoice } from "@/lib/clipstitchr/types/AutomationStitchrColorChoice";
import type { AutomationStitchrTextStyleChoice } from "@/lib/clipstitchr/types/AutomationStitchrTextStyleChoice";
import type {
  AutomationCliprGenerationMode,
  AutomationPreferencesInput,
} from "@/lib/clipstitchr/types/AutomationPreferencesInput";
import type { AutomationTool } from "@/lib/clipstitchr/types/AutomationTool";
import type { StitchTemplate } from "@/lib/clipstitchr/types/StitchTemplate";
import type { SwiprLibraryPack } from "@/lib/clipstitchr/types/SwiprLibraryPack";
import { getCssColorHex } from "@/lib/clipstitchr/utils/getCssColorHex";
import { normalizeAutomationStitchrTemplateAllocations } from "@/lib/clipstitchr/utils/normalizeAutomationStitchrTemplateAllocations";

type SettingsAutomationPanelProps = {
  error: string | null;
  isLoading: boolean;
  isSaving: boolean;
  productName?: string;
  preferences: AutomationPreferencesInput;
  stitchTemplates: StitchTemplate[];
  swiprPacks: SwiprLibraryPack[];
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
  productName,
  preferences,
  stitchTemplates,
  swiprPacks,
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
  const selectedStitchrTextStyle =
    draftPreferences.stitchrTextStyleChoice === "any"
      ? undefined
      : TEXT_OVERLAY_STYLES.find(
          (style) => style.id === draftPreferences.stitchrTextStyleChoice,
        );
  const selectedSwiprTextStyle =
    draftPreferences.swiprTextStyleChoice === "any"
      ? undefined
      : TEXT_OVERLAY_STYLES.find(
          (style) => style.id === draftPreferences.swiprTextStyleChoice,
        );
  const showsStitchrBackgroundColor =
    draftPreferences.stitchrTextStyleChoice === "any" ||
    Boolean(selectedStitchrTextStyle?.backgroundColor);
  const showsSwiprBackgroundColor =
    draftPreferences.swiprTextStyleChoice === "any" ||
    Boolean(selectedSwiprTextStyle?.backgroundColor);
  const showsStitchrStrokeColor =
    draftPreferences.stitchrTextStyleChoice === "any" ||
    Boolean(selectedStitchrTextStyle?.strokeColor);
  const showsSwiprStrokeColor =
    draftPreferences.swiprTextStyleChoice === "any" ||
    Boolean(selectedSwiprTextStyle?.strokeColor);
  const stitchrTextColorFallback = getCssColorHex(
    selectedStitchrTextStyle?.color ?? "#ffffff",
    "#ffffff",
  );
  const stitchrBackgroundColorFallback = getCssColorHex(
    selectedStitchrTextStyle?.backgroundColor ?? "rgba(2, 6, 23, 0.72)",
    "#020617",
  );
  const stitchrStrokeColorFallback = getCssColorHex(
    selectedStitchrTextStyle?.strokeColor ?? "#020617",
    "#020617",
  );
  const swiprTextColorFallback = getCssColorHex(
    selectedSwiprTextStyle?.color ?? "#ffffff",
    "#ffffff",
  );
  const swiprBackgroundColorFallback = getCssColorHex(
    selectedSwiprTextStyle?.backgroundColor ?? "rgba(2, 6, 23, 0.72)",
    "#020617",
  );
  const swiprStrokeColorFallback = getCssColorHex(
    selectedSwiprTextStyle?.strokeColor ?? "#020617",
    "#020617",
  );
  const isCliprSelected = draftPreferences.enabledTools.includes("clipr");
  const isStitchrSelected = draftPreferences.enabledTools.includes("stitchr");
  const isSwiprSelected = draftPreferences.enabledTools.includes("swipr");
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
  const handleStitchrGenerationCountChange = (
    stitchrGenerationCount: AutomationGenerationCount,
  ) => {
    updateDraftPreferences({
      ...draftPreferences,
      stitchrGenerationCount,
      stitchrTemplateAllocations:
        normalizeAutomationStitchrTemplateAllocations(
          draftPreferences.stitchrTemplateAllocations,
          stitchrGenerationCount,
          new Set(stitchTemplates.map((template) => template.id)),
        ),
    });
  };
  const handleStitchrTemplateAllocationsChange = (
    stitchrTemplateAllocations: AutomationPreferencesInput["stitchrTemplateAllocations"],
  ) => {
    updateDraftPreferences({
      ...draftPreferences,
      stitchrTemplateAllocations,
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
  const handleStitchrStrokeColorChange = (
    stitchrTextStrokeColorChoice: AutomationStitchrColorChoice,
  ) => {
    updateDraftPreferences({
      ...draftPreferences,
      stitchrTextStrokeColorChoice,
    });
  };
  const handleSwiprGenerationCountChange = (
    swiprGenerationCount: AutomationGenerationCount,
  ) => {
    updateDraftPreferences({
      ...draftPreferences,
      swiprGenerationCount,
    });
  };
  const handleSwiprTextStyleChange = (
    swiprTextStyleChoice: AutomationStitchrTextStyleChoice,
  ) => {
    updateDraftPreferences({
      ...draftPreferences,
      swiprTextStyleChoice,
    });
  };
  const handleSwiprTextColorChange = (
    swiprTextColorChoice: AutomationStitchrColorChoice,
  ) => {
    updateDraftPreferences({
      ...draftPreferences,
      swiprTextColorChoice,
    });
  };
  const handleSwiprBackgroundColorChange = (
    swiprTextBackgroundColorChoice: AutomationStitchrColorChoice,
  ) => {
    updateDraftPreferences({
      ...draftPreferences,
      swiprTextBackgroundColorChoice,
    });
  };
  const handleSwiprStrokeColorChange = (
    swiprTextStrokeColorChoice: AutomationStitchrColorChoice,
  ) => {
    updateDraftPreferences({
      ...draftPreferences,
      swiprTextStrokeColorChoice,
    });
  };
  const handleSwiprPackNamesChange = (
    swiprSelectedLibraryPackNames: string[],
  ) => {
    updateDraftPreferences({
      ...draftPreferences,
      swiprSelectedLibraryPackNames,
    });
  };
  const handleCliprModeChange = (
    cliprGenerationMode: AutomationCliprGenerationMode,
  ) => {
    updateDraftPreferences({
      ...draftPreferences,
      cliprGenerationMode,
    });
  };
  const handleSave = async () => {
    await onSave({
      ...draftPreferences,
      stitchrTemplateAllocations:
        normalizeAutomationStitchrTemplateAllocations(
          draftPreferences.stitchrTemplateAllocations,
          draftPreferences.stitchrGenerationCount,
          new Set(stitchTemplates.map((template) => template.id)),
        ),
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
              <p className="mt-1 text-sm text-text-secondary">
                {productName
                  ? `For ${productName}`
                  : "For the active product"}
              </p>
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
        {isCliprSelected ? (
          <AutomationToolConfigDisclosure
            disabled={isLoading || isSaving}
            label="Clipr Config"
          >
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-text-primary">
                Clipr mode
              </p>
              <AutomationCliprModePicker
                disabled={isLoading || isSaving}
                value={draftPreferences.cliprGenerationMode}
                onChange={handleCliprModeChange}
              />
            </div>
          </AutomationToolConfigDisclosure>
        ) : null}
        {isStitchrSelected ? (
          <AutomationToolConfigDisclosure
            disabled={isLoading || isSaving}
            label="Stitchr Config"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <AutomationGenerationCountPicker
                disabled={isLoading || isSaving}
                label="Stitchr drafts"
                value={draftPreferences.stitchrGenerationCount}
                onChange={handleStitchrGenerationCountChange}
              />
              <AutomationStitchrTemplateAllocationPicker
                allocations={draftPreferences.stitchrTemplateAllocations}
                disabled={isLoading || isSaving}
                generationCount={draftPreferences.stitchrGenerationCount}
                templates={stitchTemplates}
                onChange={handleStitchrTemplateAllocationsChange}
              />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-text-primary">
                Stitchr text style
              </p>
              <AutomationStitchrTextStylePicker
                disabled={isLoading || isSaving}
                previewBackgroundColor={
                  draftPreferences.stitchrTextBackgroundColorChoice === "any"
                    ? undefined
                    : draftPreferences.stitchrTextBackgroundColorChoice
                }
                previewStrokeColor={
                  draftPreferences.stitchrTextStrokeColorChoice === "any"
                    ? undefined
                    : draftPreferences.stitchrTextStrokeColorChoice
                }
                previewTextColor={
                  draftPreferences.stitchrTextColorChoice === "any"
                    ? undefined
                    : draftPreferences.stitchrTextColorChoice
                }
                value={draftPreferences.stitchrTextStyleChoice}
                onChange={handleStitchrTextStyleChange}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <AutomationStitchrColorChoicePicker
                disabled={isLoading || isSaving}
                fallbackColor={stitchrTextColorFallback}
                label="Text color"
                value={draftPreferences.stitchrTextColorChoice}
                onChange={handleStitchrTextColorChange}
              />
              {showsStitchrBackgroundColor ? (
                <AutomationStitchrColorChoicePicker
                  disabled={isLoading || isSaving}
                  fallbackColor={stitchrBackgroundColorFallback}
                  label="Background color"
                  value={draftPreferences.stitchrTextBackgroundColorChoice}
                  onChange={handleStitchrBackgroundColorChange}
                />
              ) : null}
              {showsStitchrStrokeColor ? (
                <AutomationStitchrColorChoicePicker
                  disabled={isLoading || isSaving}
                  fallbackColor={stitchrStrokeColorFallback}
                  label="Outline color"
                  value={draftPreferences.stitchrTextStrokeColorChoice}
                  onChange={handleStitchrStrokeColorChange}
                />
              ) : null}
            </div>
          </AutomationToolConfigDisclosure>
        ) : null}
        {isSwiprSelected ? (
          <AutomationToolConfigDisclosure
            disabled={isLoading || isSaving}
            label="Swipr Config"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <AutomationGenerationCountPicker
                disabled={isLoading || isSaving}
                label="Swipr drafts"
                value={draftPreferences.swiprGenerationCount}
                onChange={handleSwiprGenerationCountChange}
              />
              <AutomationSwiprPackPicker
                disabled={isLoading || isSaving}
                packs={swiprPacks}
                selectedPackNames={
                  draftPreferences.swiprSelectedLibraryPackNames
                }
                onChange={handleSwiprPackNamesChange}
              />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-text-primary">
                Swipr text style
              </p>
              <AutomationStitchrTextStylePicker
                disabled={isLoading || isSaving}
                previewBackgroundColor={
                  draftPreferences.swiprTextBackgroundColorChoice === "any"
                    ? undefined
                    : draftPreferences.swiprTextBackgroundColorChoice
                }
                previewStrokeColor={
                  draftPreferences.swiprTextStrokeColorChoice === "any"
                    ? undefined
                    : draftPreferences.swiprTextStrokeColorChoice
                }
                previewTextColor={
                  draftPreferences.swiprTextColorChoice === "any"
                    ? undefined
                    : draftPreferences.swiprTextColorChoice
                }
                value={draftPreferences.swiprTextStyleChoice}
                onChange={handleSwiprTextStyleChange}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <AutomationStitchrColorChoicePicker
                disabled={isLoading || isSaving}
                fallbackColor={swiprTextColorFallback}
                label="Text color"
                value={draftPreferences.swiprTextColorChoice}
                onChange={handleSwiprTextColorChange}
              />
              {showsSwiprBackgroundColor ? (
                <AutomationStitchrColorChoicePicker
                  disabled={isLoading || isSaving}
                  fallbackColor={swiprBackgroundColorFallback}
                  label="Background color"
                  value={draftPreferences.swiprTextBackgroundColorChoice}
                  onChange={handleSwiprBackgroundColorChange}
                />
              ) : null}
              {showsSwiprStrokeColor ? (
                <AutomationStitchrColorChoicePicker
                  disabled={isLoading || isSaving}
                  fallbackColor={swiprStrokeColorFallback}
                  label="Outline color"
                  value={draftPreferences.swiprTextStrokeColorChoice}
                  onChange={handleSwiprStrokeColorChange}
                />
              ) : null}
            </div>
          </AutomationToolConfigDisclosure>
        ) : null}
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
