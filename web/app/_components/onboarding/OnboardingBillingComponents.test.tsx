import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { OnboardingPlanCheckout } from "@/app/_components/onboarding/OnboardingPlanCheckout";
import { OnboardingPlanSelection } from "@/app/_components/onboarding/OnboardingPlanSelection";

describe("onboarding billing components", () => {
  it("offers every canonical plan when signup has no selection", () => {
    const markup = renderToStaticMarkup(
      <OnboardingPlanSelection isStarting={false} onSelect={vi.fn()} />,
    );

    expect(markup).toContain("Choose your monthly plan");
    expect(markup).toContain("Choose Starter");
    expect(markup).toContain("Choose Pro");
    expect(markup).toContain("Choose Agency");
    expect(markup).toContain("$99/month");
  });

  it("keeps a canceled pricing selection ready for secure Checkout", () => {
    const markup = renderToStaticMarkup(
      <OnboardingPlanCheckout
        canceledCheckoutIntentId="6bc7d459-5b0a-4d9f-a62f-389fdf2b4af9"
        error={null}
        isCanceled
        isStarting={false}
        planKey="pro"
        onCheckout={vi.fn()}
      />,
    );

    expect(markup).toContain("Nothing was charged");
    expect(markup).toContain("Pro is selected");
    expect(markup).toContain("$99 per month");
    expect(markup).toContain("Continue to secure checkout");
    expect(markup).toContain(
      'href="/dashboard/onboarding?billing=canceled&amp;checkout_intent=6bc7d459-5b0a-4d9f-a62f-389fdf2b4af9"',
    );
    expect(markup).toContain("Change plan");
  });

  it("shows a Checkout error while choosing a plan", () => {
    const markup = renderToStaticMarkup(
      <OnboardingPlanSelection
        error="Secure checkout could not open."
        isStarting={false}
        onSelect={vi.fn()}
      />,
    );

    expect(markup).toContain('role="alert"');
    expect(markup).toContain("Secure checkout could not open.");
  });

  it("shows progress only on the plan opening Checkout", () => {
    const markup = renderToStaticMarkup(
      <OnboardingPlanSelection
        isStarting
        pendingPlanKey="pro"
        onSelect={vi.fn()}
      />,
    );

    expect(markup.match(/animate-spin/g)).toHaveLength(1);
    expect(markup.match(/aria-busy="true"/g)).toHaveLength(1);
  });
});
