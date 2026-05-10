"use client";

import { useCallback, useMemo, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { WorkspaceSettings } from "@/lib/clipstitchr/types/WorkspaceSettings";
import type { WorkspaceSettingsUpdate } from "@/lib/clipstitchr/types/WorkspaceSettingsUpdate";

export function useWorkspaceSettings() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const settingsDocument = useQuery(
    api.workspaceSettings.get,
    isAuthenticated ? {} : "skip",
  );
  const saveSettingsMutation = useMutation(api.workspaceSettings.save);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const settings = useMemo<WorkspaceSettings | null>(
    () =>
      settingsDocument
        ? {
            productDetails: settingsDocument.productDetails,
            audienceDetails: settingsDocument.audienceDetails,
            createdAt: settingsDocument.createdAt,
            updatedAt: settingsDocument.updatedAt,
          }
        : null,
    [settingsDocument],
  );
  const saveSettings = useCallback(
    async ({ productDetails, audienceDetails }: WorkspaceSettingsUpdate) => {
      setIsSaving(true);
      setError(null);

      try {
        await saveSettingsMutation({
          productDetails,
          audienceDetails,
          updatedAt: new Date().toISOString(),
        });
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to save settings.",
        );
        throw nextError;
      } finally {
        setIsSaving(false);
      }
    },
    [saveSettingsMutation],
  );

  return {
    settings,
    isLoading:
      isAuthLoading || (isAuthenticated && settingsDocument === undefined),
    isSaving,
    error,
    saveSettings,
  };
}
