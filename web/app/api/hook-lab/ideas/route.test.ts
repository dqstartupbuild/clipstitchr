import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/hook-lab/ideas/route";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
  };

  return {
    capturePostHogServerEvent: vi.fn(),
    convex,
    createAuthenticatedConvexHttpClient: vi.fn(() => convex),
    createId: vi.fn(),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    hookLabIdeas: {
      create: {
        create: "hookLabIdeas.create",
      },
    },
    providerJobs: {
      create: "providerJobs.create",
    },
    rateLimits: {
      consumeHookLabIdeaAnalysis: "rateLimits.consumeHookLabIdeaAnalysis",
    },
  },
}));

vi.mock("@/lib/clipstitchr/server/analytics/capturePostHogServerEvent", () => ({
  capturePostHogServerEvent: mocks.capturePostHogServerEvent,
}));

vi.mock(
  "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient",
  () => ({
    createAuthenticatedConvexHttpClient:
      mocks.createAuthenticatedConvexHttpClient,
  }),
);

vi.mock("@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken", () => ({
  getAuthenticatedConvexToken: mocks.getAuthenticatedConvexToken,
}));

vi.mock("@/lib/clipstitchr/server/getAuthenticatedUserId", () => ({
  getAuthenticatedUserId: mocks.getAuthenticatedUserId,
}));

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

vi.mock("@/lib/clipstitchr/utils/createId", () => ({
  createId: mocks.createId,
}));

function createRequest(body: Record<string, unknown> = {}) {
  return new Request("https://clipstitchr.test/api/hook-lab/ideas", {
    body: JSON.stringify({
      productId: " product_1 ",
      scope: "product",
      value: "  The   honest\n before-and-after  ",
      ...body,
    }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
}

describe("POST /api/hook-lab/ideas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createId.mockReturnValue("idea_1");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.convex.mutation.mockImplementation(
      async (mutationId: string, input: Record<string, unknown>) => {
        if (mutationId === "hookLabIdeas.create") {
          return {
            id: "idea_1",
            scope: input.scope,
            sourcePlatform: input.sourcePlatform,
            sourceType: input.sourceType,
            status: "analyzing",
          };
        }

        if (mutationId === "providerJobs.create") {
          return {
            id: input.id,
            status: "queued",
          };
        }

        return null;
      },
    );
  });

  it("returns 401 before parsing input when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(createRequest({ value: null }));

    await expect(response.json()).resolves.toEqual({
      message: "Authentication required.",
    });
    expect(response.status).toBe(401);
    expect(mocks.getAuthenticatedConvexToken).not.toHaveBeenCalled();
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
  });

  it("normalizes text input and creates an idempotent minimal provider job", async () => {
    const request = createRequest();
    const response = await POST(request);

    expect(response.status).toBe(202);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.hookLabIdeas.create.create,
      expect.objectContaining({
        id: "idea_1",
        originalText: "The honest before-and-after",
        productId: "product_1",
        requestKey: expect.stringMatching(/^hook-lab-idea:[a-f0-9]{64}$/),
        scope: "product",
        sourceType: "text",
      }),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeHookLabIdeaAnalysis,
      {
        idempotencyKey:
          "user_123:hook-lab-idea-analysis:idea_1:initial",
        isSocialImport: false,
        secret: "rate-limit-secret",
      },
    );
    const providerCall = mocks.convex.mutation.mock.calls.find(
      ([mutationId]) => mutationId === api.providerJobs.create,
    );
    const providerInput = providerCall?.[1] as {
      idempotencyKey: string;
      inputSnapshotJson: string;
    };

    expect(providerInput.idempotencyKey).toBe(
      "user_123:hook-lab-idea-analysis:idea_1:initial",
    );
    expect(JSON.parse(providerInput.inputSnapshotJson)).toEqual({
      ideaId: "idea_1",
    });
    expect(mocks.capturePostHogServerEvent).toHaveBeenCalledWith({
      distinctId: "user_123",
      event: "hook_lab_idea_created",
      properties: {
        scope: "product",
        source_platform: undefined,
        source_type: "text",
      },
      request,
    });
  });

  it("canonicalizes supported social links before persistence", async () => {
    const response = await POST(
      createRequest({
        productId: "",
        scope: "shared",
        value: " https://instagram.com/reels/ABC_123/?utm_source=test ",
      }),
    );

    expect(response.status).toBe(202);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.hookLabIdeas.create.create,
      expect.objectContaining({
        canonicalUrl: "https://www.instagram.com/reel/ABC_123/",
        productId: undefined,
        scope: "shared",
        sourcePlatform: "instagram",
        sourceType: "social_link",
      }),
    );
  });

  it("propagates 429 before creating a provider job", async () => {
    mocks.convex.mutation.mockImplementation(
      async (mutationId: string, input: Record<string, unknown>) => {
        if (mutationId === "hookLabIdeas.create") {
          return {
            id: "idea_1",
            scope: input.scope,
            sourceType: input.sourceType,
            status: "analyzing",
          };
        }

        if (mutationId === "rateLimits.consumeHookLabIdeaAnalysis") {
          throw {
            data: {
              kind: "RateLimited",
              name: "hookLabIdeaAnalysis",
              retryAfter: 2400,
            },
          };
        }

        return null;
      },
    );

    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        rateLimit: "hookLabIdeaAnalysis",
        retryAfterSeconds: 3,
      }),
    );
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("3");
    expect(mocks.convex.mutation).not.toHaveBeenCalledWith(
      api.providerJobs.create,
      expect.anything(),
    );
    expect(mocks.capturePostHogServerEvent).not.toHaveBeenCalled();
  });

  it("returns a conflict instead of a false accepted response for a failed duplicate", async () => {
    mocks.createId.mockReturnValue("candidate_idea");
    mocks.convex.mutation.mockResolvedValueOnce({
      id: "existing_idea",
      scope: "product",
      sourceType: "text",
      status: "failed",
    });

    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        message: "That idea is already saved and needs another try.",
      }),
    );
    expect(response.status).toBe(409);
    expect(mocks.convex.mutation).toHaveBeenCalledTimes(1);
    expect(mocks.capturePostHogServerEvent).not.toHaveBeenCalled();
  });
});
