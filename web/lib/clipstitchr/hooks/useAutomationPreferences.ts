"use client";

import { useCallback, useMemo, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { automationToolOptions } from "@/lib/clipstitchr/constants/automationToolOptions";
import type { AutomationPreferencesInput } from "@/lib/clipstitchr/types/AutomationPreferencesInput";

const defaultPreferences: AutomationPreferencesInput = {
  enabled: false,
  enabledTools: automationToolOptions.map((tool) => tool.id),
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
            enabledTools: preferencesDocument.enabledTools,
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
