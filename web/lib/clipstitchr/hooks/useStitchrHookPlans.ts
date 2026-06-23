"use client";

import { useCallback, useMemo, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createStitchrHookPlanFromConvexDocument } from "@/lib/clipstitchr/backend/createStitchrHookPlanFromConvexDocument";

export function useStitchrHookPlans(productId?: string) {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const documents = useQuery(
    api.stitchrHookPlans.list,
    isAuthenticated
      ? {
          ...(productId ? { productId } : {}),
        }
      : "skip",
  );
  const acceptMutation = useMutation(api.stitchrHookPlans.accept);
  const rejectMutation = useMutation(api.stitchrHookPlans.reject);
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const plans = useMemo(
    () => documents?.map(createStitchrHookPlanFromConvexDocument) ?? [],
    [documents],
  );
  const accept = useCallback(
    async (id: string) => {
      setSavingPlanId(id);
      setError(null);

      try {
        await acceptMutation({
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
    async (id: string) => {
      setSavingPlanId(id);
      setError(null);

      try {
        await rejectMutation({
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

  return {
    accept,
    error,
    isLoading: isAuthLoading || (isAuthenticated && documents === undefined),
    plans,
    reject,
    savingPlanId,
  };
}
