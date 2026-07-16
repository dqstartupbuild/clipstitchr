import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BillingPlanComparison } from "@/app/_components/settings/BillingPlanComparison";

describe("BillingPlanComparison", () => {
  it("shows explicit Stripe plan-change actions for a managed subscription", () => {
    const markup = renderToStaticMarkup(
      <BillingPlanComparison
        currentPlanKey="starter"
        hasManagedSubscription
        isManagingPlan={false}
        isStartingPlan={false}
        onManagePlan={vi.fn()}
        onStartPlan={vi.fn()}
      />,
    );

    expect(markup).toContain("Current plan");
    expect(markup).toContain("Upgrade to Pro in Stripe");
    expect(markup).toContain("Upgrade to Agency in Stripe");
  });

  it("shows hosted Checkout actions before the first subscription", () => {
    const markup = renderToStaticMarkup(
      <BillingPlanComparison
        hasManagedSubscription={false}
        isManagingPlan={false}
        isStartingPlan={false}
        onManagePlan={vi.fn()}
        onStartPlan={vi.fn()}
      />,
    );

    expect(markup).toContain("Choose Starter");
    expect(markup).toContain("Choose Pro");
    expect(markup).toContain("Choose Agency");
  });

  it("shows restart Checkout actions for an inactive former subscription", () => {
    const markup = renderToStaticMarkup(
      <BillingPlanComparison
        currentPlanKey="pro"
        hasManagedSubscription={false}
        isManagingPlan={false}
        isStartingPlan={false}
        onManagePlan={vi.fn()}
        onStartPlan={vi.fn()}
      />,
    );

    expect(markup).toContain("Choose Starter");
    expect(markup).toContain("Choose Pro");
    expect(markup).toContain("Choose Agency");
    expect(markup).not.toContain("Current plan");
  });

  it("keeps plan details and actions visible in the stacked comparison", () => {
    const markup = renderToStaticMarkup(
      <BillingPlanComparison
        currentPlanKey="pro"
        hasManagedSubscription
        isManagingPlan={false}
        isStartingPlan={false}
        onManagePlan={vi.fn()}
        onStartPlan={vi.fn()}
      />,
    );

    expect(markup.match(/<dl/g)).toHaveLength(3);
    expect(markup).toContain("<table");
    expect(markup).toContain("Clipr + Swapr");
    expect(markup).toContain("Daily drafts");
    expect(markup).toContain("xl:hidden");
    expect(markup).not.toContain("aria-hidden");
    expect(markup).not.toContain("min-w-[940px]");
    expect(markup).toContain(
      "Compare ClipStitchr monthly plans and allowances",
    );
    expect(markup).toContain('scope="col"');
    expect(markup).toContain('scope="row"');
  });

  it("shows progress only on the selected plan action", () => {
    const markup = renderToStaticMarkup(
      <BillingPlanComparison
        hasManagedSubscription={false}
        isManagingPlan={false}
        isStartingPlan
        pendingPlanKey="agency"
        onManagePlan={vi.fn()}
        onStartPlan={vi.fn()}
      />,
    );

    expect(markup.match(/animate-spin/g)).toHaveLength(2);
  });
});
