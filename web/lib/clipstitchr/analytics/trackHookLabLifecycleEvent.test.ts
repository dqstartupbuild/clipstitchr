import { beforeEach, describe, expect, it, vi } from "vitest";
import { trackHookLabLifecycleEvent } from "@/lib/clipstitchr/analytics/trackHookLabLifecycleEvent";

const mocks = vi.hoisted(() => ({
  claimHookLabLifecycleEvent: vi.fn(),
  getHasAnalyticsConsent: vi.fn(),
  getIsPostHogConfigured: vi.fn(),
  trackPostHogEvent: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/analytics/claimHookLabLifecycleEvent", () => ({
  claimHookLabLifecycleEvent: mocks.claimHookLabLifecycleEvent,
}));

vi.mock("@/lib/clipstitchr/analytics/getHasAnalyticsConsent", () => ({
  getHasAnalyticsConsent: mocks.getHasAnalyticsConsent,
}));

vi.mock("@/lib/clipstitchr/analytics/getIsPostHogConfigured", () => ({
  getIsPostHogConfigured: mocks.getIsPostHogConfigured,
}));

vi.mock("@/lib/clipstitchr/analytics/trackPostHogEvent", () => ({
  trackPostHogEvent: mocks.trackPostHogEvent,
}));

describe("trackHookLabLifecycleEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.claimHookLabLifecycleEvent.mockReturnValue(true);
    mocks.getHasAnalyticsConsent.mockReturnValue(true);
    mocks.getIsPostHogConfigured.mockReturnValue(true);
  });

  it("captures a claimed lifecycle with safe properties", () => {
    trackHookLabLifecycleEvent({
      eventName: "hook_lab_idea_use_completed",
      lifecycleKey: "use_private_id",
      properties: {
        completed_variant_count: 1,
        variation_count: 1,
      },
    });

    expect(mocks.claimHookLabLifecycleEvent).toHaveBeenCalledWith(
      "hook_lab_idea_use_completed",
      "use_private_id",
    );
    expect(mocks.trackPostHogEvent).toHaveBeenCalledWith(
      "hook_lab_idea_use_completed",
      {
        completed_variant_count: 1,
        variation_count: 1,
      },
    );
  });

  it("does not claim or capture without analytics consent", () => {
    mocks.getHasAnalyticsConsent.mockReturnValue(false);

    trackHookLabLifecycleEvent({
      eventName: "hook_lab_idea_analysis_failed",
      lifecycleKey: "idea_private_id",
      properties: { terminal_status: "failed" },
    });

    expect(mocks.claimHookLabLifecycleEvent).not.toHaveBeenCalled();
    expect(mocks.trackPostHogEvent).not.toHaveBeenCalled();
  });

  it("does not capture a lifecycle already claimed in this session", () => {
    mocks.claimHookLabLifecycleEvent.mockReturnValue(false);

    trackHookLabLifecycleEvent({
      eventName: "hook_lab_idea_analysis_completed",
      lifecycleKey: "idea_private_id",
      properties: { terminal_status: "ready" },
    });

    expect(mocks.trackPostHogEvent).not.toHaveBeenCalled();
  });
});
