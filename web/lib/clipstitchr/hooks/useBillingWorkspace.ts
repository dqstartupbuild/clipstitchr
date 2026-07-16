"use client";

import { useAction, useConvexAuth, useQuery } from "convex/react";
import { useCallback, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { PlanKey } from "@/lib/clipstitchr/billing/types/PlanKey";

type BillingAction = "checkout" | "portal" | "refill";

export function useBillingWorkspace() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const entitlement = useQuery(
    api.billing.getCurrentEntitlement.getCurrentEntitlement,
    isAuthenticated ? {} : "skip",
  );
  const usage = useQuery(
    api.usage.getCurrentUsage.getCurrentUsage,
    isAuthenticated ? {} : "skip",
  );
  const usageHistory = useQuery(
    api.usage.getUsageHistory.getUsageHistory,
    isAuthenticated ? { limit: 12 } : "skip",
  );
  const createSubscriptionCheckout = useAction(
    api.stripe.createSubscriptionCheckout.createSubscriptionCheckout,
  );
  const createCreditRefillCheckout = useAction(
    api.stripe.createCreditRefillCheckout.createCreditRefillCheckout,
  );
  const createPortalSession = useAction(
    api.stripe.createPortalSession.createPortalSession,
  );
  const [pendingAction, setPendingAction] = useState<BillingAction | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const openHostedUrl = useCallback((url: string) => {
    window.location.assign(url);
  }, []);

  const startPlan = useCallback(
    async (planKey: PlanKey) => {
      setError(null);
      setPendingAction("checkout");

      try {
        const result = await createSubscriptionCheckout({ planKey });
        openHostedUrl(result.url);
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to open secure checkout.",
        );
        setPendingAction(null);
      }
    },
    [createSubscriptionCheckout, openHostedUrl],
  );

  const manageBilling = useCallback(async () => {
    setError(null);
    setPendingAction("portal");

    try {
      const result = await createPortalSession({});
      openHostedUrl(result.url);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to open billing settings.",
      );
      setPendingAction(null);
    }
  }, [createPortalSession, openHostedUrl]);

  const buyRefill = useCallback(async () => {
    setError(null);
    setPendingAction("refill");

    try {
      const result = await createCreditRefillCheckout({});
      openHostedUrl(result.url);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to open refill checkout.",
      );
      setPendingAction(null);
    }
  }, [createCreditRefillCheckout, openHostedUrl]);

  return {
    buyRefill,
    entitlement,
    error,
    isLoading:
      isAuthLoading ||
      (isAuthenticated &&
        (entitlement === undefined ||
          usage === undefined ||
          usageHistory === undefined)),
    manageBilling,
    pendingAction,
    startPlan,
    usage,
    usageHistory,
  };
}
