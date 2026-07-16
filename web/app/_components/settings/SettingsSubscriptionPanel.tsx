"use client";

import { CreditCard } from "lucide-react";
import { BillingPlanComparison } from "@/app/_components/settings/BillingPlanComparison";
import { BillingReturnNotice } from "@/app/_components/settings/BillingReturnNotice";
import { BillingUsageHistory } from "@/app/_components/settings/BillingUsageHistory";
import { BillingUsageSummary } from "@/app/_components/settings/BillingUsageSummary";
import { getBillingEntitlementStateLabel } from "@/app/_components/settings/getBillingEntitlementStateLabel";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import { useBillingWorkspace } from "@/lib/clipstitchr/hooks/useBillingWorkspace";

export function SettingsSubscriptionPanel() {
  const billing = useBillingWorkspace();
  const entitlement = billing.entitlement;
  const usage = billing.usage;
  const hasManagedSubscription = Boolean(
    entitlement && entitlement.state !== "inactive",
  );

  return (
    <Panel className="scroll-mt-6 p-5" id="plan-and-usage">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <CreditCard
              aria-hidden
              className="mt-1 h-6 w-6 shrink-0 text-accent-dark"
            />
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                Plan and usage
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">
                Pick the room you need now. Credits renew monthly, and Clipr
                plus Swapr share one video allowance.
              </p>
            </div>
          </div>
          {entitlement ? (
            <Button
              size="sm"
              variant="secondary"
              isLoading={
                billing.pendingAction === "portal" &&
                billing.pendingPlanKey === null
              }
              disabled={billing.pendingAction !== null}
              onClick={() => void billing.manageBilling()}
            >
              Billing &amp; invoices
            </Button>
          ) : null}
        </div>

        <BillingReturnNotice />

        {billing.error ? (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
          >
            {billing.error}
          </p>
        ) : null}

        {billing.isLoading ? (
          <p
            className="py-6 text-sm font-semibold text-text-secondary"
            role="status"
          >
            Loading your billing details...
          </p>
        ) : (
          <>
            {entitlement ? (
              <div
                aria-live="polite"
                className="rounded-lg bg-surface-muted px-4 py-3 text-sm text-text-secondary"
                role="status"
              >
                <span className="font-bold text-text-primary">
                  {entitlement.planName}
                </span>
                : {getBillingEntitlementStateLabel(entitlement.state)}.
                {entitlement.cancelAtPeriodEnd
                  ? ` It stays available through ${new Intl.DateTimeFormat(
                      "en-US",
                      { dateStyle: "medium", timeZone: "UTC" },
                    ).format(new Date(entitlement.currentPeriodEnd))}.`
                  : ""}
                {entitlement.state === "grace" && entitlement.graceEndsAt
                  ? ` Fix payment by ${new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "UTC",
                    }).format(
                      new Date(entitlement.graceEndsAt),
                    )} UTC to keep creating.`
                  : ""}
                {entitlement.billingReviewRequired
                  ? " Billing needs a quick review before new creations can start."
                  : ""}
              </div>
            ) : (
              <p className="rounded-lg bg-surface-muted px-4 py-3 text-sm leading-6 text-text-secondary">
                Choose a plan to unlock saved products and new creations.
                Checkout stays on Stripe, and your plan starts only after
                payment is confirmed.
              </p>
            )}

            <BillingPlanComparison
              currentPlanKey={entitlement?.planKey}
              hasManagedSubscription={hasManagedSubscription}
              isManagingPlan={billing.pendingAction === "portal"}
              isStartingPlan={billing.pendingAction === "checkout"}
              pendingPlanKey={billing.pendingPlanKey}
              onManagePlan={(planKey) =>
                void billing.manageBilling("subscription_update", planKey)
              }
              onStartPlan={(planKey) => void billing.startPlan(planKey)}
            />

            {usage && entitlement ? (
              <BillingUsageSummary
                activeGenerationLimit={entitlement.activeGenerationLimit}
                activeGenerations={usage.activeGenerations}
                availableCredits={usage.creationCredits.available}
                canBuyRefill={entitlement.canBuyRefill}
                isBuyingRefill={billing.pendingAction === "refill"}
                monthlyRemaining={usage.creationCredits.monthlyRemaining}
                nextRefillExpiryAt={usage.creationCredits.nextRefillExpiryAt}
                refillRemaining={usage.creationCredits.refillRemaining}
                videoConsumed={usage.aiVideos.consumed}
                videoLimit={usage.aiVideos.limit}
                videoReserved={usage.aiVideos.reserved}
                onBuyRefill={() => void billing.buyRefill()}
              />
            ) : null}

            <BillingUsageHistory entries={billing.usageHistory ?? []} />
          </>
        )}
      </div>
    </Panel>
  );
}
