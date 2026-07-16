import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnboardingBillingGate } from "@/app/_components/onboarding/OnboardingBillingGate";

const mocks = vi.hoisted(() => ({
  useBillingWorkspace: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/hooks/useBillingWorkspace", () => ({
  useBillingWorkspace: mocks.useBillingWorkspace,
}));

vi.mock("@/app/_components/onboarding/OnboardingBillingShell", () => ({
  OnboardingBillingShell: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe("OnboardingBillingGate", () => {
  beforeEach(() => {
    mocks.useBillingWorkspace.mockReturnValue({
      entitlement: null,
      error: null,
      isLoading: false,
      pendingAction: null,
      pendingPlanKey: null,
      startPlan: vi.fn(),
    });
  });

  it("shows the current support address while confirming payment", () => {
    const markup = renderToStaticMarkup(
      <OnboardingBillingGate billingReturn="success">
        Product setup
      </OnboardingBillingGate>,
    );

    expect(markup).toContain("Payment received. Confirming your plan.");
    expect(markup).toContain("support@followusai.com");
    expect(markup).toContain('href="mailto:support@followusai.com"');
  });
});
