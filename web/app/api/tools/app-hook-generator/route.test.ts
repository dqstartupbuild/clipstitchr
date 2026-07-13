import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/tools/app-hook-generator/route";
import { api } from "@/convex/_generated/api";

const generatedHooks = Array.from({ length: 8 }, (_, index) => ({
  angle: `Angle ${index + 1}`,
  reason: `Reason ${index + 1}`,
  text: `Hook ${index + 1}`,
}));

const mocks = vi.hoisted(() => {
  const convex = { mutation: vi.fn() };

  return {
    convex,
    createAppHookGeneratorClientKey: vi.fn(),
    createAppHookGeneratorHooks: vi.fn(),
    createConvexHttpClient: vi.fn(() => convex),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    appHookGeneratorRateLimit: {
      consume: "appHookGeneratorRateLimit.consume",
    },
  },
}));

vi.mock(
  "@/lib/clipstitchr/server/convex/createConvexHttpClient",
  () => ({
    createConvexHttpClient: mocks.createConvexHttpClient,
  }),
);

vi.mock(
  "@/lib/clipstitchr/tools/appHookGenerator/server/createAppHookGeneratorClientKey",
  () => ({
    createAppHookGeneratorClientKey:
      mocks.createAppHookGeneratorClientKey,
  }),
);

vi.mock(
  "@/lib/clipstitchr/tools/appHookGenerator/server/createAppHookGeneratorHooks",
  () => ({
    createAppHookGeneratorHooks: mocks.createAppHookGeneratorHooks,
  }),
);

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

function createRequest(
  body: BodyInit = JSON.stringify({
    appName: "ClipStitchr",
    audience: "app founders",
    desiredOutcome: "launch stronger app ads",
    edgeLevel: "punchy",
    problem: "writing hooks that earn attention",
    variationIndex: 3,
  }),
  headers: HeadersInit = {},
) {
  return new Request(
    "https://clipstitchr.test/api/tools/app-hook-generator",
    {
      body,
      headers: { "content-type": "application/json", ...headers },
      method: "POST",
    },
  );
}

describe("POST /api/tools/app-hook-generator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.createAppHookGeneratorClientKey.mockReturnValue("client-key");
    mocks.createAppHookGeneratorHooks.mockReturnValue(generatedHooks);
  });

  it("consumes quota before returning a generated hook set", async () => {
    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({
      hooks: generatedHooks,
      variationIndex: 3,
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.appHookGeneratorRateLimit.consume,
      { key: "client-key", secret: "rate-limit-secret" },
    );
    expect(mocks.convex.mutation.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.createAppHookGeneratorHooks.mock.invocationCallOrder[0],
    );
  });

  it("rejects invalid input without consuming quota", async () => {
    const response = await POST(createRequest(JSON.stringify({ appName: "" })));

    await expect(response.json()).resolves.toEqual({
      message: "Check each field, then try again.",
    });
    expect(response.status).toBe(400);
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
  });

  it("rejects non-JSON requests before consuming quota", async () => {
    const response = await POST(
      createRequest(JSON.stringify({}), { "content-type": "text/plain" }),
    );

    await expect(response.json()).resolves.toEqual({
      message: "Send this request as JSON.",
    });
    expect(response.status).toBe(415);
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
  });

  it("rejects cross-site browser requests before consuming quota", async () => {
    const response = await POST(
      createRequest(undefined, { "sec-fetch-site": "cross-site" }),
    );

    await expect(response.json()).resolves.toEqual({
      message: "This request is not allowed.",
    });
    expect(response.status).toBe(403);
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
  });

  it("rejects a mismatched origin before consuming quota", async () => {
    const response = await POST(
      createRequest(undefined, { origin: "https://example.test" }),
    );

    await expect(response.json()).resolves.toEqual({
      message: "This request is not allowed.",
    });
    expect(response.status).toBe(403);
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON as a safe client error", async () => {
    const response = await POST(createRequest("{"));

    await expect(response.json()).resolves.toEqual({
      message: "Check each field, then try again.",
    });
    expect(response.status).toBe(400);
  });

  it("rejects an oversized body before parsing or consuming quota", async () => {
    const response = await POST(
      createRequest("{}", { "content-length": String(8 * 1024 + 1) }),
    );

    await expect(response.json()).resolves.toEqual({
      message: "Check each field, then try again.",
    });
    expect(response.status).toBe(413);
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
  });

  it("rejects an oversized body when content-length is omitted", async () => {
    const response = await POST(createRequest(`"${"x".repeat(8 * 1024)}"`));

    await expect(response.json()).resolves.toEqual({
      message: "Check each field, then try again.",
    });
    expect(response.status).toBe(413);
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
  });

  it("returns a generic 429 with retry timing before generation", async () => {
    mocks.convex.mutation.mockRejectedValue({
      data: {
        kind: "RateLimited",
        name: "appHookGeneratorByClient",
        retryAfter: 1500,
      },
    });

    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({
      message: "Too many hook sets were requested. Try again in a moment.",
    });
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("2");
    expect(mocks.createAppHookGeneratorHooks).not.toHaveBeenCalled();
  });

  it("does not expose unexpected server errors", async () => {
    mocks.convex.mutation.mockRejectedValue(new Error("private service detail"));

    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({
      message: "Unable to generate hooks right now.",
    });
    expect(response.status).toBe(500);
  });
});
