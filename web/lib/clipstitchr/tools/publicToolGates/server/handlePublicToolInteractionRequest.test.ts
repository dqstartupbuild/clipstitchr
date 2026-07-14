import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/convex/_generated/api";
import { handlePublicToolInteractionRequest } from "@/lib/clipstitchr/tools/publicToolGates/server/handlePublicToolInteractionRequest";

const mocks = vi.hoisted(() => {
  const convex = { mutation: vi.fn() };

  return {
    convex,
    readBrowserRecognitionToken: vi.fn(),
    resolvePublicToolGateVariantForRequest: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    toolLeads: {
      recordInteraction: { recordInteraction: "recordInteraction" },
    },
  },
}));

vi.mock("@/lib/clipstitchr/server/convex/createConvexHttpClient", () => ({
  createConvexHttpClient: () => mocks.convex,
}));

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

vi.mock(
  "@/lib/clipstitchr/tools/toolLeads/server/createToolLeadClientKey",
  () => ({ createToolLeadClientKey: () => "a".repeat(64) }),
);

vi.mock(
  "@/lib/clipstitchr/tools/browserRecognition/readBrowserRecognitionToken",
  () => ({
    readBrowserRecognitionToken: mocks.readBrowserRecognitionToken,
  }),
);

vi.mock(
  "@/lib/clipstitchr/tools/browserRecognition/hashBrowserRecognitionToken",
  () => ({ hashBrowserRecognitionToken: async () => "b".repeat(64) }),
);

vi.mock(
  "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest",
  () => ({
    resolvePublicToolGateVariantForRequest:
      mocks.resolvePublicToolGateVariantForRequest,
  }),
);

function createRequest(
  body = { interactionType: "resourceUnlocked" },
  origin = "https://clipstitchr.test",
) {
  return new Request(
    "https://clipstitchr.test/api/tools/app-hook-generator/interaction",
    {
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
        origin,
        "sec-fetch-site": origin.includes("clipstitchr")
          ? "same-origin"
          : "cross-site",
      },
      method: "POST",
    },
  );
}

describe("handlePublicToolInteractionRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.convex.mutation.mockResolvedValue({ accepted: true });
    mocks.readBrowserRecognitionToken.mockReturnValue("r".repeat(43));
    mocks.resolvePublicToolGateVariantForRequest.mockResolvedValue("hybrid-v1");
  });

  it("records only the fixed server-derived interaction envelope", async () => {
    const now = Date.UTC(2026, 6, 13, 12);
    vi.spyOn(Date, "now").mockReturnValue(now);

    const response = await handlePublicToolInteractionRequest(
      createRequest(),
      "app-hook-generator",
    );

    await expect(response.json()).resolves.toEqual({ accepted: true });
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.toolLeads.recordInteraction.recordInteraction,
      {
        clientKey: "a".repeat(64),
        gateMode: "useful-preview",
        gateVariant: "hybrid-v1",
        interactionType: "resourceUnlocked",
        occurredAt: now,
        recognitionTokenHash: "b".repeat(64),
        secret: "rate-limit-secret",
        source: "app-hook-generator",
      },
    );
  });

  it("returns the same accepted shape without a recognition cookie", async () => {
    mocks.readBrowserRecognitionToken.mockReturnValue(null);

    const response = await handlePublicToolInteractionRequest(
      createRequest(),
      "app-hook-generator",
    );

    await expect(response.json()).resolves.toEqual({ accepted: true });
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
  });

  it("rejects cross-site input before reading identity or using quota", async () => {
    const response = await handlePublicToolInteractionRequest(
      createRequest(
        { interactionType: "resourceUnlocked" },
        "https://attacker.test",
      ),
      "app-hook-generator",
    );

    expect(response.status).toBe(403);
    expect(mocks.readBrowserRecognitionToken).not.toHaveBeenCalled();
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
  });
});
