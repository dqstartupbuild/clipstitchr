import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsSubscriptionPanel } from "@/app/_components/settings/SettingsSubscriptionPanel";

const mocks = vi.hoisted(() => ({
  useBillingWorkspace: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/hooks/useBillingWorkspace", () => ({
  useBillingWorkspace: mocks.useBillingWorkspace,
}));

function createBillingWorkspace() {
  return {
    buyRefill: vi.fn(),
    entitlement: {
      activeGenerationLimit: 2,
      billingReviewRequired: false,
      canBuyRefill: false,
      cancelAtPeriodEnd: false,
      currentPeriodEnd: "2026-08-16T00:00:00.000Z",
      graceEndsAt: "2026-07-19T00:00:00.000Z",
      planKey: "pro" as const,
      planName: "Pro",
      state: "grace" as const,
    },
    error: null,
    isLoading: false,
    manageBilling: vi.fn(),
    pendingAction: null as "checkout" | "portal" | "refill" | null,
    pendingPlanKey: null as "starter" | "pro" | "agency" | null,
    startPlan: vi.fn(),
    usage: null,
    usageHistory: [],
  };
}

describe("SettingsSubscriptionPanel", () => {
  beforeEach(() => {
    mocks.useBillingWorkspace.mockReset();
  });

  it("presents the entitlement state in customer language", () => {
    mocks.useBillingWorkspace.mockReturnValue(createBillingWorkspace());

    const markup = renderToStaticMarkup(<SettingsSubscriptionPanel />);

    expect(markup).toContain("Pro</span>: Payment needs attention.");
    expect(markup).not.toContain("is grace");
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain('role="status"');
  });

  it("keeps the general portal button still during a plan-specific action", () => {
    mocks.useBillingWorkspace.mockReturnValue({
      ...createBillingWorkspace(),
      pendingAction: "portal",
      pendingPlanKey: "agency",
    });

    const markup = renderToStaticMarkup(<SettingsSubscriptionPanel />);

    expect(markup.match(/animate-spin/g)).toHaveLength(2);
  });

  it("shows progress on the general portal button for billing and invoices", () => {
    mocks.useBillingWorkspace.mockReturnValue({
      ...createBillingWorkspace(),
      pendingAction: "portal",
      pendingPlanKey: null,
    });

    const markup = renderToStaticMarkup(<SettingsSubscriptionPanel />);

    expect(markup.match(/animate-spin/g)).toHaveLength(1);
  });

  it("uses the canonical server decision for refill eligibility", () => {
    mocks.useBillingWorkspace.mockReturnValue({
      ...createBillingWorkspace(),
      entitlement: {
        ...createBillingWorkspace().entitlement,
        canBuyRefill: false,
        state: "active",
      },
      usage: {
        activeGenerations: 0,
        aiVideos: { consumed: 0, limit: 10, reserved: 0 },
        creationCredits: {
          available: 8_000,
          monthlyRemaining: 8_000,
          refillRemaining: 0,
          reserved: 0,
        },
      },
    });

    const markup = renderToStaticMarkup(<SettingsSubscriptionPanel />);

    expect(markup).toMatch(
      /<button[^>]*disabled=""[^>]*>Add 2,000 credits for \$29<\/button>/,
    );
  });
});
