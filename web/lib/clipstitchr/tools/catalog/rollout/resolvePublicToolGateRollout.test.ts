import { describe, expect, it } from "vitest";
import { getPublicToolGateRolloutBucket } from "@/lib/clipstitchr/tools/catalog/rollout/getPublicToolGateRolloutBucket";
import type { PublicToolGateRolloutConfiguration } from "@/lib/clipstitchr/tools/catalog/rollout/PublicToolGateRolloutConfiguration";
import { resolvePublicToolGateRollout } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateRollout";

const fullRollout = {
  allocationPercent: 100,
  tools: ["app-hook-generator", "five-day-app-content-sprint"],
  variant: "hybrid-v1",
} satisfies PublicToolGateRolloutConfiguration;

describe("resolvePublicToolGateRollout", () => {
  it("keeps control as the default for absent, unselected, or unusable input", () => {
    expect(
      resolvePublicToolGateRollout({
        configuration: null,
        emailProviderReady: true,
        opaqueVisitorKey: "visitor_opaque_123",
        toolKey: "app-hook-generator",
      }),
    ).toBe("control");
    expect(
      resolvePublicToolGateRollout({
        configuration: fullRollout,
        emailProviderReady: true,
        opaqueVisitorKey: "visitor_opaque_123",
        toolKey: "app-ad-hook-grader",
      }),
    ).toBe("control");
    expect(
      resolvePublicToolGateRollout({
        configuration: fullRollout,
        emailProviderReady: true,
        opaqueVisitorKey: "   ",
        toolKey: "app-hook-generator",
      }),
    ).toBe("control");
  });

  it("activates only the approved variant for a selected non-email tool", () => {
    expect(
      resolvePublicToolGateRollout({
        configuration: fullRollout,
        emailProviderReady: false,
        opaqueVisitorKey: "visitor_opaque_123",
        toolKey: "app-hook-generator",
      }),
    ).toBe("hybrid-v1");
  });

  it("requires explicit provider readiness for email-native activation", () => {
    expect(
      resolvePublicToolGateRollout({
        configuration: fullRollout,
        emailProviderReady: false,
        opaqueVisitorKey: "visitor_opaque_123",
        toolKey: "five-day-app-content-sprint",
      }),
    ).toBe("control");
    expect(
      resolvePublicToolGateRollout({
        configuration: fullRollout,
        emailProviderReady: true,
        opaqueVisitorKey: "visitor_opaque_123",
        toolKey: "five-day-app-content-sprint",
      }),
    ).toBe("hybrid-v1");
  });

  it("uses a deterministic visitor allocation and honors zero percent", () => {
    const configuration = {
      allocationPercent: 50,
      tools: ["app-hook-generator", "app-ad-hook-grader"],
      variant: "hybrid-v1",
    } satisfies PublicToolGateRolloutConfiguration;
    const opaqueVisitorKey = "visitor_opaque_allocation";
    const expected =
      getPublicToolGateRolloutBucket(opaqueVisitorKey) < 5_000
        ? "hybrid-v1"
        : "control";

    expect(
      resolvePublicToolGateRollout({
        configuration,
        emailProviderReady: true,
        opaqueVisitorKey,
        toolKey: "app-hook-generator",
      }),
    ).toBe(expected);
    expect(
      resolvePublicToolGateRollout({
        configuration,
        emailProviderReady: true,
        opaqueVisitorKey,
        toolKey: "app-ad-hook-grader",
      }),
    ).toBe(expected);
    expect(
      resolvePublicToolGateRollout({
        configuration: { ...configuration, allocationPercent: 0 },
        emailProviderReady: true,
        opaqueVisitorKey,
        toolKey: "app-hook-generator",
      }),
    ).toBe("control");
  });
});
