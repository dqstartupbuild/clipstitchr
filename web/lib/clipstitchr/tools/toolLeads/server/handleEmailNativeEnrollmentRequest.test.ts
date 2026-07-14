import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/convex/_generated/api";
import { handleEmailNativeEnrollmentRequest } from "@/lib/clipstitchr/tools/toolLeads/server/handleEmailNativeEnrollmentRequest";

const mocks = vi.hoisted(() => {
  const convex = { mutation: vi.fn() };

  return {
    convex,
    createConvexHttpClient: vi.fn(() => convex),
    emailNativeReady: true,
    readBrowserRecognitionToken: vi.fn<() => string | null>(() =>
      "r".repeat(43),
    ),
    resolvePublicToolGateVariantForRequest: vi.fn(async () => "hybrid-v1"),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    toolLeads: {
      enrollEmailNative: {
        enrollEmailNative: "toolLeads.enrollEmailNative",
      },
    },
  },
}));

vi.mock("@/lib/clipstitchr/email/loops/getLoopsReadiness", () => ({
  getLoopsReadiness: () => ({
    emailNativeReady: mocks.emailNativeReady,
  }),
}));

vi.mock("@/lib/clipstitchr/server/convex/createConvexHttpClient", () => ({
  createConvexHttpClient: mocks.createConvexHttpClient,
}));

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

vi.mock(
  "@/lib/clipstitchr/tools/browserRecognition/readBrowserRecognitionToken",
  () => ({
    readBrowserRecognitionToken: mocks.readBrowserRecognitionToken,
  }),
);

vi.mock(
  "@/lib/clipstitchr/tools/browserRecognition/hashBrowserRecognitionToken",
  () => ({
    hashBrowserRecognitionToken: vi.fn(async () => "b".repeat(64)),
  }),
);

vi.mock(
  "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest",
  () => ({
    resolvePublicToolGateVariantForRequest:
      mocks.resolvePublicToolGateVariantForRequest,
  }),
);

vi.mock(
  "@/lib/clipstitchr/tools/toolLeads/server/createToolLeadClientKey",
  () => ({
    createToolLeadClientKey: vi.fn(() => "a".repeat(64)),
  }),
);

function createRequest(origin = "https://clipstitchr.test") {
  return new Request(
    "https://clipstitchr.test/api/tools/five-day-app-content-sprint/email-native-enrollment",
    {
      headers: {
        cookie: `clipstitchr_tool_recognition=${"r".repeat(43)}`,
        origin,
        "sec-fetch-site": origin.includes("clipstitchr.test")
          ? "same-origin"
          : "cross-site",
      },
      method: "POST",
    },
  );
}

describe("handleEmailNativeEnrollmentRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.emailNativeReady = true;
    mocks.convex.mutation.mockResolvedValue({ accepted: true });
    mocks.readBrowserRecognitionToken.mockReturnValue("r".repeat(43));
    mocks.resolvePublicToolGateVariantForRequest.mockResolvedValue(
      "hybrid-v1",
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("derives the approved workflow and uses only the HttpOnly token hash", async () => {
    const enrolledAt = Date.UTC(2026, 6, 13, 16);
    vi.spyOn(Date, "now").mockReturnValue(enrolledAt);

    const response = await handleEmailNativeEnrollmentRequest({
      request: createRequest(),
      source: "five-day-app-content-sprint",
    });

    const body = await response.json();

    expect(body).toEqual({ accepted: true });
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.toolLeads.enrollEmailNative.enrollEmailNative,
      {
        clientKey: "a".repeat(64),
        enrolledAt,
        gateVariant: "hybrid-v1",
        recognitionTokenHash: "b".repeat(64),
        secret: "rate-limit-secret",
        source: "five-day-app-content-sprint",
        workflowKey: "five_day_content_sprint_enrolled",
        workflowVersion: "v1",
      },
    );
    expect(JSON.stringify(body)).not.toMatch(
      /workflow|token|email/i,
    );
  });

  it("returns the same opaque acceptance when recognition is unavailable", async () => {
    mocks.readBrowserRecognitionToken.mockReturnValue(null);

    const response = await handleEmailNativeEnrollmentRequest({
      request: createRequest(),
      source: "five-day-app-content-sprint",
    });

    await expect(response.json()).resolves.toEqual({ accepted: true });
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
  });

  it("fails closed without mutation when readiness or rollout is disabled", async () => {
    mocks.emailNativeReady = false;
    const unreadyResponse = await handleEmailNativeEnrollmentRequest({
      request: createRequest(),
      source: "five-day-app-content-sprint",
    });

    mocks.emailNativeReady = true;
    mocks.resolvePublicToolGateVariantForRequest.mockResolvedValue("control");
    const controlResponse = await handleEmailNativeEnrollmentRequest({
      request: createRequest(),
      source: "five-day-app-content-sprint",
    });

    await expect(unreadyResponse.json()).resolves.toEqual({ accepted: true });
    await expect(controlResponse.json()).resolves.toEqual({ accepted: true });
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
  });

  it("rejects cross-site and non-email-native requests", async () => {
    const crossSiteResponse = await handleEmailNativeEnrollmentRequest({
      request: createRequest("https://attacker.test"),
      source: "five-day-app-content-sprint",
    });
    const wrongToolResponse = await handleEmailNativeEnrollmentRequest({
      request: createRequest(),
      source: "app-hook-generator",
    });

    expect(crossSiteResponse.status).toBe(403);
    expect(wrongToolResponse.status).toBe(404);
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
  });

  it("returns retry timing without exposing the internal rate bucket", async () => {
    mocks.convex.mutation.mockRejectedValue({
      data: {
        kind: "RateLimited",
        name: "emailNativeEnrollmentByContact",
        retryAfter: 2_500,
      },
    });

    const response = await handleEmailNativeEnrollmentRequest({
      request: createRequest(),
      source: "five-day-app-content-sprint",
    });
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("3");
    expect(JSON.stringify(body)).not.toContain(
      "emailNativeEnrollmentByContact",
    );
  });
});
