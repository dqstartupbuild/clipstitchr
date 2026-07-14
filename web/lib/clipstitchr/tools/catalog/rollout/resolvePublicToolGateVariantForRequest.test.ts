import { beforeEach, describe, expect, it, vi } from "vitest";
import { publicToolGateVisitorCookieName } from "@/lib/clipstitchr/tools/catalog/rollout/publicToolGateVisitorCookieName";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";

const mocks = vi.hoisted(() => ({
  cookieValue: undefined as string | undefined,
  getCookie: vi.fn((name: string) =>
    name === "clipstitchr_public_tool_visitor_v1" && mocks.cookieValue
      ? { value: mocks.cookieValue }
      : undefined,
  ),
}));

vi.mock("@/lib/clipstitchr/email/loops/getLoopsReadiness", () => ({
  getLoopsReadiness: () => ({
    emailNativeReady: false,
  }),
}));

vi.mock("server-only", () => ({}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ get: mocks.getCookie })),
}));

describe("resolvePublicToolGateVariantForRequest", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
    vi.stubEnv(
      "EMAIL_CONFIRMATION_TOKEN_SECRET",
      "development confirmation secret",
    );
    mocks.cookieValue = "550e8400-e29b-41d4-a716-446655440000";
  });

  it("uses the versioned visitor cookie and server rollout configuration", async () => {
    vi.stubEnv(
      "PUBLIC_TOOL_GATE_ROLLOUT",
      '{"variant":"hybrid-v1","tools":["app-hook-generator"],"allocationPercent":100}',
    );

    await expect(
      resolvePublicToolGateVariantForRequest("app-hook-generator", false),
    ).resolves.toBe("hybrid-v1");
    expect(mocks.getCookie).toHaveBeenCalledWith(
      publicToolGateVisitorCookieName,
    );
  });

  it("defaults to control for a missing or invalid server configuration", async () => {
    await expect(
      resolvePublicToolGateVariantForRequest("app-hook-generator", false),
    ).resolves.toBe("control");

    vi.stubEnv("PUBLIC_TOOL_GATE_ROLLOUT", "not-json");

    await expect(
      resolvePublicToolGateVariantForRequest("app-hook-generator", false),
    ).resolves.toBe("control");
  });

  it("keeps browser gates in control until the token secret is configured", async () => {
    vi.stubEnv(
      "PUBLIC_TOOL_GATE_ROLLOUT",
      '{"variant":"hybrid-v1","tools":["app-hook-generator"],"allocationPercent":100}',
    );
    vi.stubEnv("EMAIL_CONFIRMATION_TOKEN_SECRET", "");

    await expect(
      resolvePublicToolGateVariantForRequest("app-hook-generator", false),
    ).resolves.toBe("control");
  });

  it("defaults to control for a missing or invalid visitor cookie", async () => {
    vi.stubEnv(
      "PUBLIC_TOOL_GATE_ROLLOUT",
      '{"variant":"hybrid-v1","tools":["app-hook-generator"],"allocationPercent":100}',
    );
    mocks.cookieValue = undefined;

    await expect(
      resolvePublicToolGateVariantForRequest("app-hook-generator", false),
    ).resolves.toBe("control");

    mocks.cookieValue = "client-picked-bucket";

    await expect(
      resolvePublicToolGateVariantForRequest("app-hook-generator", false),
    ).resolves.toBe("control");
  });

  it("keeps an email-native tool in control until its provider is ready", async () => {
    vi.stubEnv(
      "PUBLIC_TOOL_GATE_ROLLOUT",
      '{"variant":"hybrid-v1","tools":["five-day-app-content-sprint"],"allocationPercent":100}',
    );

    await expect(
      resolvePublicToolGateVariantForRequest(
        "five-day-app-content-sprint",
        false,
      ),
    ).resolves.toBe("control");
    await expect(
      resolvePublicToolGateVariantForRequest(
        "five-day-app-content-sprint",
        true,
      ),
    ).resolves.toBe("hybrid-v1");
  });
});
