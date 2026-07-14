import { beforeEach, describe, expect, it, vi } from "vitest";
import { trackPublicToolAnalyticsEvent } from "@/lib/clipstitchr/tools/publicToolGates/trackPublicToolAnalyticsEvent";

const mocks = vi.hoisted(() => ({
  recordPublicToolInteraction: vi.fn(),
  trackPostHogEvent: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/analytics/trackPostHogEvent", () => ({
  trackPostHogEvent: mocks.trackPostHogEvent,
}));

vi.mock(
  "@/lib/clipstitchr/tools/publicToolGates/recordPublicToolInteraction",
  () => ({
    recordPublicToolInteraction: mocks.recordPublicToolInteraction,
  }),
);

describe("trackPublicToolAnalyticsEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends one typed event without accepting arbitrary properties", () => {
    trackPublicToolAnalyticsEvent("tool_resource_unlocked", {
      gateMode: "gated-portability",
      toolKey: "app-hook-testing-matrix",
      variant: "hybrid-v1",
    });

    expect(mocks.trackPostHogEvent).toHaveBeenCalledWith(
      "tool_resource_unlocked",
      {
        event_type: "tool_resource_unlocked",
        experiment_variant: "hybrid-v1",
        gate_mode: "gated-portability",
        tool_key: "app-hook-testing-matrix",
      },
    );
    expect(mocks.recordPublicToolInteraction).toHaveBeenCalledWith(
      "app-hook-testing-matrix",
      "resourceUnlocked",
    );
  });

  it("does not create a server interaction for impression-only events", () => {
    trackPublicToolAnalyticsEvent("tool_gate_displayed", {
      gateMode: "gated-portability",
      toolKey: "app-hook-testing-matrix",
      variant: "hybrid-v1",
    });

    expect(mocks.recordPublicToolInteraction).not.toHaveBeenCalled();
  });

  it("pairs the paid CTA event with its server interaction", () => {
    trackPublicToolAnalyticsEvent("tool_paid_cta_clicked", {
      gateMode: "useful-preview",
      toolKey: "app-ad-hook-grader",
      variant: "hybrid-v1",
    });

    expect(mocks.trackPostHogEvent).toHaveBeenCalledWith(
      "tool_paid_cta_clicked",
      {
        event_type: "tool_paid_cta_clicked",
        experiment_variant: "hybrid-v1",
        gate_mode: "useful-preview",
        tool_key: "app-ad-hook-grader",
      },
    );
    expect(mocks.recordPublicToolInteraction).toHaveBeenCalledWith(
      "app-ad-hook-grader",
      "paidCtaClicked",
    );
  });
});
