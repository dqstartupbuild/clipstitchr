"use client";

import { useCallback, useMemo, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { automationToolOptions } from "@/lib/clipstitchr/constants/automationToolOptions";
import { defaultAutomationStitchrColorChoice } from "@/lib/clipstitchr/constants/defaultAutomationStitchrColorChoice";
import { defaultAutomationStitchrTextStyleChoice } from "@/lib/clipstitchr/constants/defaultAutomationStitchrTextStyleChoice";
import type { AutomationPreferencesInput } from "@/lib/clipstitchr/types/AutomationPreferencesInput";
import { getAutomationCliprGenerationMode } from "@/lib/clipstitchr/utils/getAutomationCliprGenerationMode";
import { filterEnabledAutomationTools } from "@/lib/clipstitchr/utils/filterEnabledAutomationTools";
import { getAutomationStitchrColorChoice } from "@/lib/clipstitchr/utils/getAutomationStitchrColorChoice";
import { getAutomationStitchrTextStyleChoice } from "@/lib/clipstitchr/utils/getAutomationStitchrTextStyleChoice";

const defaultPreferences: AutomationPreferencesInput = {
  enabled: false,
  enabledTools: automationToolOptions.map((tool) => tool.id),
  cliprGenerationMode: "reaction",
  stitchrTextStyleChoice: defaultAutomationStitchrTextStyleChoice,
  stitchrTextColorChoice: defaultAutomationStitchrColorChoice,
  stitchrTextBackgroundColorChoice: defaultAutomationStitchrColorChoice,
  productSelectionMode: "all",
  selectedProductIds: [],
  avatarSelectionMode: "all",
  selectedAvatarIds: [],
};

export function useAutomationPreferences() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const preferencesDocument = useQuery(
    api.automationPreferences.get,
    isAuthenticated ? {} : "skip",
  );
  const savePreferencesMutation = useMutation(api.automationPreferences.save);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const preferences = useMemo<AutomationPreferencesInput>(
    () =>
      preferencesDocument
        ? {
            enabled: preferencesDocument.enabled,
            enabledTools: filterEnabledAutomationTools(
              preferencesDocument.enabledTools,
            ),
            cliprGenerationMode:
              getAutomationCliprGenerationMode(
                preferencesDocument.cliprGenerationMode,
              ),
            stitchrTextStyleChoice: getAutomationStitchrTextStyleChoice(
              preferencesDocument.stitchrTextStyleChoice,
            ),
            stitchrTextColorChoice: getAutomationStitchrColorChoice(
              preferencesDocument.stitchrTextColorChoice,
            ),
            stitchrTextBackgroundColorChoice: getAutomationStitchrColorChoice(
              preferencesDocument.stitchrTextBackgroundColorChoice,
            ),
            productSelectionMode: preferencesDocument.productSelectionMode,
            selectedProductIds: preferencesDocument.selectedProductIds,
            avatarSelectionMode: preferencesDocument.avatarSelectionMode,
            selectedAvatarIds: preferencesDocument.selectedAvatarIds,
          }
        : defaultPreferences,
    [preferencesDocument],
  );
  const savePreferences = useCallback(
    async (nextPreferences: AutomationPreferencesInput) => {
      setIsSaving(true);
      setError(null);

      try {
        await savePreferencesMutation({
          ...nextPreferences,
          enabledTools: filterEnabledAutomationTools(
            nextPreferences.enabledTools,
          ),
          cliprGenerationMode: getAutomationCliprGenerationMode(
            nextPreferences.cliprGenerationMode,
          ),
          stitchrTextStyleChoice: getAutomationStitchrTextStyleChoice(
            nextPreferences.stitchrTextStyleChoice,
          ),
          stitchrTextColorChoice: getAutomationStitchrColorChoice(
            nextPreferences.stitchrTextColorChoice,
          ),
          stitchrTextBackgroundColorChoice: getAutomationStitchrColorChoice(
            nextPreferences.stitchrTextBackgroundColorChoice,
          ),
          updatedAt: new Date().toISOString(),
        });
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to save automation settings.",
        );
        throw nextError;
      } finally {
        setIsSaving(false);
      }
    },
    [savePreferencesMutation],
  );

  return {
    preferences,
    isLoading:
      isAuthLoading || (isAuthenticated && preferencesDocument === undefined),
    isSaving,
    error,
    savePreferences,
  };
}
