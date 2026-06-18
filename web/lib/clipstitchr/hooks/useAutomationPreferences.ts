"use client";

import { useCallback, useMemo, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { automationToolOptions } from "@/lib/clipstitchr/constants/automationToolOptions";
import { defaultAutomationCliprGenerationMode } from "@/lib/clipstitchr/constants/defaultAutomationCliprGenerationMode";
import { defaultAutomationGenerationCount } from "@/lib/clipstitchr/constants/defaultAutomationGenerationCount";
import { defaultAutomationStitchrColorChoice } from "@/lib/clipstitchr/constants/defaultAutomationStitchrColorChoice";
import { defaultAutomationStitchrTextStyleChoice } from "@/lib/clipstitchr/constants/defaultAutomationStitchrTextStyleChoice";
import type { AutomationPreferencesInput } from "@/lib/clipstitchr/types/AutomationPreferencesInput";
import { getAutomationGenerationCount } from "@/lib/clipstitchr/utils/getAutomationGenerationCount";
import { getAutomationCliprGenerationMode } from "@/lib/clipstitchr/utils/getAutomationCliprGenerationMode";
import { filterEnabledAutomationTools } from "@/lib/clipstitchr/utils/filterEnabledAutomationTools";
import { getAutomationStitchrColorChoice } from "@/lib/clipstitchr/utils/getAutomationStitchrColorChoice";
import { getAutomationStitchrTextStyleChoice } from "@/lib/clipstitchr/utils/getAutomationStitchrTextStyleChoice";
import { normalizeAutomationSwiprSelectedLibraryPackNames } from "@/lib/clipstitchr/utils/normalizeAutomationSwiprSelectedLibraryPackNames";

function getDefaultPreferences(productId?: string): AutomationPreferencesInput {
  return {
  enabled: false,
  enabledTools: automationToolOptions.map((tool) => tool.id),
  cliprGenerationMode: defaultAutomationCliprGenerationMode,
  productId,
  stitchrGenerationCount: defaultAutomationGenerationCount,
  stitchrTextStyleChoice: defaultAutomationStitchrTextStyleChoice,
  stitchrTextColorChoice: defaultAutomationStitchrColorChoice,
  stitchrTextBackgroundColorChoice: defaultAutomationStitchrColorChoice,
  stitchrTextStrokeColorChoice: defaultAutomationStitchrColorChoice,
  swiprGenerationCount: defaultAutomationGenerationCount,
  swiprSelectedLibraryPackNames: [],
  swiprTextStyleChoice: defaultAutomationStitchrTextStyleChoice,
  swiprTextColorChoice: defaultAutomationStitchrColorChoice,
  swiprTextBackgroundColorChoice: defaultAutomationStitchrColorChoice,
  swiprTextStrokeColorChoice: defaultAutomationStitchrColorChoice,
  productSelectionMode: productId ? "selected" : "all",
  selectedProductIds: productId ? [productId] : [],
  avatarSelectionMode: "all",
  selectedAvatarIds: [],
};
}

export function useAutomationPreferences(productId?: string) {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const preferencesDocument = useQuery(
    api.automationPreferences.get,
    isAuthenticated ? { productId } : "skip",
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
            productId,
            stitchrGenerationCount: getAutomationGenerationCount(
              preferencesDocument.stitchrGenerationCount,
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
            stitchrTextStrokeColorChoice: getAutomationStitchrColorChoice(
              preferencesDocument.stitchrTextStrokeColorChoice,
            ),
            swiprGenerationCount: getAutomationGenerationCount(
              preferencesDocument.swiprGenerationCount,
            ),
            swiprSelectedLibraryPackNames:
              normalizeAutomationSwiprSelectedLibraryPackNames(
                preferencesDocument.swiprSelectedLibraryPackNames ?? [],
              ),
            swiprTextStyleChoice: getAutomationStitchrTextStyleChoice(
              preferencesDocument.swiprTextStyleChoice,
            ),
            swiprTextColorChoice: getAutomationStitchrColorChoice(
              preferencesDocument.swiprTextColorChoice,
            ),
            swiprTextBackgroundColorChoice: getAutomationStitchrColorChoice(
              preferencesDocument.swiprTextBackgroundColorChoice,
            ),
            swiprTextStrokeColorChoice: getAutomationStitchrColorChoice(
              preferencesDocument.swiprTextStrokeColorChoice,
            ),
            productSelectionMode: productId
              ? "selected"
              : preferencesDocument.productSelectionMode,
            selectedProductIds: productId
              ? [productId]
              : preferencesDocument.selectedProductIds,
            avatarSelectionMode: preferencesDocument.avatarSelectionMode,
            selectedAvatarIds: preferencesDocument.selectedAvatarIds,
          }
        : getDefaultPreferences(productId),
    [preferencesDocument, productId],
  );
  const savePreferences = useCallback(
    async (nextPreferences: AutomationPreferencesInput) => {
      setIsSaving(true);
      setError(null);

      try {
        await savePreferencesMutation({
          ...nextPreferences,
          productId,
          enabledTools: filterEnabledAutomationTools(
            nextPreferences.enabledTools,
          ),
          cliprGenerationMode: getAutomationCliprGenerationMode(
            nextPreferences.cliprGenerationMode,
          ),
          stitchrTextStyleChoice: getAutomationStitchrTextStyleChoice(
            nextPreferences.stitchrTextStyleChoice,
          ),
          stitchrGenerationCount: getAutomationGenerationCount(
            nextPreferences.stitchrGenerationCount,
          ),
          stitchrTextColorChoice: getAutomationStitchrColorChoice(
            nextPreferences.stitchrTextColorChoice,
          ),
          stitchrTextBackgroundColorChoice: getAutomationStitchrColorChoice(
            nextPreferences.stitchrTextBackgroundColorChoice,
          ),
          stitchrTextStrokeColorChoice: getAutomationStitchrColorChoice(
            nextPreferences.stitchrTextStrokeColorChoice,
          ),
          swiprGenerationCount: getAutomationGenerationCount(
            nextPreferences.swiprGenerationCount,
          ),
          swiprSelectedLibraryPackNames:
            normalizeAutomationSwiprSelectedLibraryPackNames(
              nextPreferences.swiprSelectedLibraryPackNames,
            ),
          swiprTextStyleChoice: getAutomationStitchrTextStyleChoice(
            nextPreferences.swiprTextStyleChoice,
          ),
          swiprTextColorChoice: getAutomationStitchrColorChoice(
            nextPreferences.swiprTextColorChoice,
          ),
          swiprTextBackgroundColorChoice: getAutomationStitchrColorChoice(
            nextPreferences.swiprTextBackgroundColorChoice,
          ),
          swiprTextStrokeColorChoice: getAutomationStitchrColorChoice(
            nextPreferences.swiprTextStrokeColorChoice,
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
    [productId, savePreferencesMutation],
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
