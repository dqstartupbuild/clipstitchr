"use client";

import { useAction, useConvexAuth, useQuery } from "convex/react";
import { useCallback, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { PlanKey } from "@/lib/clipstitchr/billing/types/PlanKey";
import type { BillingPortalFlow } from "@/lib/clipstitchr/billing/types/BillingPortalFlow";
import type { SubscriptionCheckoutReturnTarget } from "@/lib/clipstitchr/billing/types/SubscriptionCheckoutReturnTarget";
import { getCanceledCheckoutIntentIdFromSearch } from "@/lib/clipstitchr/client/getCanceledCheckoutIntentIdFromSearch";

type BillingAction = "checkout" | "portal" | "refill";

type PendingBillingAction = {
  action: BillingAction;
  planKey?: PlanKey;
};

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
  const [pendingBillingAction, setPendingBillingAction] =
    useState<PendingBillingAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openHostedUrl = useCallback((url: string) => {
    window.location.assign(url);
  }, []);

  const startPlan = useCallback(
    async (
      planKey: PlanKey,
      returnTarget: SubscriptionCheckoutReturnTarget = "settings",
      replaceCheckoutIntentId?: string,
    ) => {
      setError(null);
      setPendingBillingAction({ action: "checkout", planKey });

      try {
        const canceledCheckoutIntentId =
          replaceCheckoutIntentId ??
          getCanceledCheckoutIntentIdFromSearch(window.location.search);
        const result = await createSubscriptionCheckout({
          planKey,
          ...(canceledCheckoutIntentId
            ? { replaceCheckoutIntentId: canceledCheckoutIntentId }
            : {}),
          returnTarget,
        });
        openHostedUrl(result.url);
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to open secure checkout.",
        );
        setPendingBillingAction(null);
      }
    },
    [createSubscriptionCheckout, openHostedUrl],
  );

  const manageBilling = useCallback(
    async (flow: BillingPortalFlow = "home", planKey?: PlanKey) => {
      setError(null);
      setPendingBillingAction({ action: "portal", planKey });

      try {
        const result = await createPortalSession({ flow });
        openHostedUrl(result.url);
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to open billing settings.",
        );
        setPendingBillingAction(null);
      }
    },
    [createPortalSession, openHostedUrl],
  );

  const buyRefill = useCallback(async () => {
    setError(null);
    setPendingBillingAction({ action: "refill" });

    try {
      const result = await createCreditRefillCheckout({});
      openHostedUrl(result.url);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to open refill checkout.",
      );
      setPendingBillingAction(null);
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
    pendingAction: pendingBillingAction?.action ?? null,
    pendingPlanKey: pendingBillingAction?.planKey ?? null,
    startPlan,
    usage,
    usageHistory,
  };
}
