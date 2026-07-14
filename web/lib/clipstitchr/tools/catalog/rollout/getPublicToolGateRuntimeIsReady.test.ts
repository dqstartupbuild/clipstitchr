import { describe, expect, it } from "vitest";
import { getPublicToolGateRuntimeIsReady } from "@/lib/clipstitchr/tools/catalog/rollout/getPublicToolGateRuntimeIsReady";

describe("getPublicToolGateRuntimeIsReady", () => {
  it("requires only the confirmation token secret for browser gates", () => {
    expect(
      getPublicToolGateRuntimeIsReady("app-hook-generator", {
        emailNativeReady: false,
        hasConfirmationTokenSecret: false,
      }),
    ).toBe(false);
    expect(
      getPublicToolGateRuntimeIsReady("app-hook-generator", {
        emailNativeReady: false,
        hasConfirmationTokenSecret: true,
      }),
    ).toBe(true);
  });

  it("requires full provider readiness for email-native gates", () => {
    expect(
      getPublicToolGateRuntimeIsReady("five-day-app-content-sprint", {
        emailNativeReady: false,
        hasConfirmationTokenSecret: true,
      }),
    ).toBe(false);
    expect(
      getPublicToolGateRuntimeIsReady("five-day-app-content-sprint", {
        emailNativeReady: true,
        hasConfirmationTokenSecret: true,
      }),
    ).toBe(true);
  });
});
