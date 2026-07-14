import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handleToolLeadRequest } from "@/lib/clipstitchr/tools/toolLeads/server/handleToolLeadRequest";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => {
  const convex = { mutation: vi.fn() };

  return {
    convex,
    createConvexHttpClient: vi.fn(() => convex),
    createToolLeadClientKey: vi.fn(() => "a".repeat(64)),
    getLoopsReadiness: vi.fn(() => ({
      confirmationReady: true,
      emailNativeReady: false,
    })),
    resolvePublicToolGateVariantForRequest: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    toolLeads: {
      submit: {
        submit: "toolLeads.submit",
      },
      submitControl: {
        submitControl: "toolLeads.submitControl",
      },
    },
  },
}));

vi.mock("@/lib/clipstitchr/email/loops/getLoopsReadiness", () => ({
  getLoopsReadiness: mocks.getLoopsReadiness,
}));

vi.mock("@/lib/clipstitchr/server/convex/createConvexHttpClient", () => ({
  createConvexHttpClient: mocks.createConvexHttpClient,
}));

vi.mock(
  "@/lib/clipstitchr/tools/toolLeads/server/createToolLeadClientKey",
  () => ({
    createToolLeadClientKey: mocks.createToolLeadClientKey,
  }),
);

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

vi.mock(
  "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest",
  () => ({
    resolvePublicToolGateVariantForRequest:
      mocks.resolvePublicToolGateVariantForRequest,
  }),
);

function createRequest({
  body = JSON.stringify({
    email: " Founder@Example.COM ",
    name: "  Ada   Founder  ",
  }),
  contentType = "application/json",
  origin = "https://clipstitchr.test",
  secFetchSite = "same-origin",
}: {
  body?: BodyInit;
  contentType?: string;
  origin?: string;
  secFetchSite?: string;
} = {}) {
  return new Request(
    "https://clipstitchr.test/api/tools/app-hook-generator/lead",
    {
      body,
      headers: {
        "content-type": contentType,
        origin,
        "sec-fetch-site": secFetchSite,
      },
      method: "POST",
    },
  );
}

describe("handleToolLeadRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.convex.mutation.mockResolvedValue({ accepted: true });
    mocks.resolvePublicToolGateVariantForRequest.mockResolvedValue("control");
    mocks.getLoopsReadiness.mockReturnValue({
      confirmationReady: true,
      emailNativeReady: false,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns one opaque field after the secret-gated mutation accepts", async () => {
    const request = createRequest();
    const response = await handleToolLeadRequest({
      request,
      source: "app-hook-generator",
    });

    await expect(response.json()).resolves.toEqual({ accepted: true });
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.toolLeads.submitControl.submitControl,
      {
        clientKey: "a".repeat(64),
        email: "founder@example.com",
        name: "Ada Founder",
        secret: "rate-limit-secret",
        source: "app-hook-generator",
      },
    );
    expect(response.headers.get("Set-Cookie")).toBeNull();
  });

  it("persists a strict hybrid envelope and sets only the opaque cookie", async () => {
    const capturedAt = Date.UTC(2026, 6, 13, 12);
    vi.spyOn(Date, "now").mockReturnValue(capturedAt);
    vi.stubEnv(
      "EMAIL_CONFIRMATION_TOKEN_SECRET",
      "a long development-only confirmation secret",
    );
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://clipstitchr.test");
    mocks.resolvePublicToolGateVariantForRequest.mockResolvedValue("hybrid-v1");

    const request = createRequest();
    const response = await handleToolLeadRequest({
      request,
      source: "app-hook-generator",
    });

    await expect(response.json()).resolves.toEqual({ accepted: true });
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.toolLeads.submit.submit,
      expect.objectContaining({
        capturedAt,
        clientKey: "a".repeat(64),
        confirmationExpiresAt: capturedAt + 48 * 60 * 60 * 1_000,
        consentCopyVersion: "public-tools-v1",
        email: "founder@example.com",
        gateMode: "useful-preview",
        gateVariant: "hybrid-v1",
        name: "Ada Founder",
        providerContactKey: expect.stringMatching(/^[A-Za-z0-9_-]{43}$/),
        recognitionExpiresAt: capturedAt + 180 * 24 * 60 * 60 * 1_000,
        recognitionTokenHash: expect.stringMatching(/^[0-9a-f]{64}$/),
        secret: "rate-limit-secret",
        source: "app-hook-generator",
        tokenDigest: expect.stringMatching(/^[0-9a-f]{64}$/),
        tokenRecordId: expect.stringMatching(/^[0-9a-f-]{36}$/i),
      }),
    );
    const mutationArgs = mocks.convex.mutation.mock.calls[0]?.[1];
    expect(mutationArgs).not.toHaveProperty("previousRecognitionTokenHash");
    expect(response.headers.get("Set-Cookie")).toMatch(
      /^clipstitchr_tool_recognition=[A-Za-z0-9_-]{43};/,
    );
    expect(response.headers.get("Set-Cookie")).toContain("HttpOnly");
    expect(response.headers.get("Set-Cookie")).toContain("SameSite=Strict");
    expect(response.headers.get("Set-Cookie")).toContain("Secure");
    expect(response.headers.get("Set-Cookie")).not.toContain(
      "founder@example.com",
    );
  });

  it("falls back to control when the confirmation token secret is missing", async () => {
    mocks.resolvePublicToolGateVariantForRequest.mockResolvedValue("hybrid-v1");

    const response = await handleToolLeadRequest({
      request: createRequest(),
      source: "app-hook-generator",
    });

    await expect(response.json()).resolves.toEqual({ accepted: true });
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.toolLeads.submitControl.submitControl,
      expect.objectContaining({ source: "app-hook-generator" }),
    );
    expect(response.headers.get("Set-Cookie")).toBeNull();
  });

  it("rejects cross-site and non-JSON requests before quota", async () => {
    const crossSiteResponse = await handleToolLeadRequest({
      request: createRequest({
        origin: "https://attacker.test",
        secFetchSite: "cross-site",
      }),
      source: "app-hook-generator",
    });
    const nonJsonResponse = await handleToolLeadRequest({
      request: createRequest({ contentType: "text/plain" }),
      source: "app-hook-generator",
    });

    expect(crossSiteResponse.status).toBe(403);
    expect(nonJsonResponse.status).toBe(415);
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
    expect(mocks.createToolLeadClientKey).not.toHaveBeenCalled();
  });

  it("rejects a client-supplied source before quota", async () => {
    const response = await handleToolLeadRequest({
      request: createRequest({
        body: JSON.stringify({
          email: "ada@example.com",
          name: "Ada",
          source: "ad-variant-calculator",
        }),
      }),
      source: "app-hook-generator",
    });

    expect(response.status).toBe(400);
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
  });

  it("returns a generic quota response without its internal bucket", async () => {
    mocks.convex.mutation.mockRejectedValue({
      data: {
        kind: "RateLimited",
        name: "toolLeadSubmitByEmail",
        retryAfter: 1500,
      },
    });

    const response = await handleToolLeadRequest({
      request: createRequest(),
      source: "app-hook-generator",
    });
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("2");
    expect(body).toEqual({ message: "Too many sign-ups. Try again later." });
    expect(JSON.stringify(body)).not.toContain("toolLeadSubmitByEmail");
  });

  it("does not expose unexpected server errors", async () => {
    mocks.convex.mutation.mockRejectedValue(new Error("private detail"));

    const response = await handleToolLeadRequest({
      request: createRequest(),
      source: "ad-variant-calculator",
    });

    await expect(response.json()).resolves.toEqual({
      message: "Unable to join the mailing list right now.",
    });
    expect(response.status).toBe(500);
  });
});
