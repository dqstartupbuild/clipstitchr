"use client";

import { useCallback, useMemo, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createStitchrHookPlanFromConvexDocument } from "@/lib/clipstitchr/backend/createStitchrHookPlanFromConvexDocument";
import type { StitchrHookVariant } from "@/lib/clipstitchr/types/StitchrHookVariant";
import { createId } from "@/lib/clipstitchr/utils/createId";

type SaveManualHookGenerationInput = {
  caption?: string;
  demoClipId?: string;
  demoClipName?: string;
  hashtags: string[];
  hookOptions: StitchrHookVariant[];
  productId?: string;
  productName?: string;
  selectedHook: string;
  socialCaption?: string;
  stitchId?: string;
  ugcClipId?: string;
  ugcClipName?: string;
};

export function useStitchrHookPlans(productId?: string, enabled = true) {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const documents = useQuery(
    api.stitchrHookPlans.list,
    isAuthenticated && enabled
      ? {
          ...(productId ? { productId } : {}),
        }
      : "skip",
  );
  const acceptMutation = useMutation(api.stitchrHookPlans.accept);
  const attachStitchMutation = useMutation(api.stitchrHookPlans.attachStitch);
  const rejectMutation = useMutation(api.stitchrHookPlans.reject);
  const saveManualGenerationMutation = useMutation(
    api.stitchrHookPlans.saveManualGeneration,
  );
  const selectOptionMutation = useMutation(api.stitchrHookPlans.selectOption);
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const plans = useMemo(
    () => documents?.map(createStitchrHookPlanFromConvexDocument) ?? [],
    [documents],
  );
  const accept = useCallback(
    async (id: string, hookText?: string) => {
      setSavingPlanId(id);
      setError(null);

      try {
        await acceptMutation({
          ...(hookText ? { hookText } : {}),
          id,
          updatedAt: new Date().toISOString(),
        });
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to save that hook.",
        );
        throw nextError;
      } finally {
        setSavingPlanId(null);
      }
    },
    [acceptMutation],
  );
  const reject = useCallback(
    async (id: string, hookText?: string) => {
      setSavingPlanId(id);
      setError(null);

      try {
        await rejectMutation({
          ...(hookText ? { hookText } : {}),
          id,
          updatedAt: new Date().toISOString(),
        });
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to update that hook.",
        );
        throw nextError;
      } finally {
        setSavingPlanId(null);
      }
    },
    [rejectMutation],
  );
  const attachStitch = useCallback(
    async (id: string, stitchId: string) => {
      setSavingPlanId(id);
      setError(null);

      try {
        await attachStitchMutation({
          id,
          stitchId,
          updatedAt: new Date().toISOString(),
        });
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to link that hook.",
        );
        throw nextError;
      } finally {
        setSavingPlanId(null);
      }
    },
    [attachStitchMutation],
  );
  const saveManualGeneration = useCallback(
    async (input: SaveManualHookGenerationInput) => {
      const id = createId();

      setSavingPlanId(id);
      setError(null);

      try {
        await saveManualGenerationMutation({
          plan: {
            id,
            ...input,
          },
          updatedAt: new Date().toISOString(),
        });

        return id;
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to save those hooks.",
        );
        throw nextError;
      } finally {
        setSavingPlanId(null);
      }
    },
    [saveManualGenerationMutation],
  );
  const selectOption = useCallback(
    async (id: string, hookText: string) => {
      setSavingPlanId(id);
      setError(null);

      try {
        await selectOptionMutation({
          hookText,
          id,
          updatedAt: new Date().toISOString(),
        });
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to switch that hook.",
        );
        throw nextError;
      } finally {
        setSavingPlanId(null);
      }
    },
    [selectOptionMutation],
  );

  return {
    accept,
    attachStitch,
    error,
    isLoading:
      isAuthLoading || (isAuthenticated && enabled && documents === undefined),
    plans,
    reject,
    saveManualGeneration,
    savingPlanId,
    selectOption,
  };
}
