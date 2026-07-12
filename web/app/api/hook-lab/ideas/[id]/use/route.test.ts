import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/hook-lab/ideas/[id]/use/route";
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
    hookLabDefaults: {
      set: {
        set: "hookLabDefaults.set",
      },
    },
    hookLabIdeaUses: {
      create: {
        create: "hookLabIdeaUses.create",
      },
    },
    hookLabIdeaVariants: {
      dispatchProviderJob: {
        dispatchProviderJob: "hookLabIdeaVariants.dispatchProviderJob",
      },
      failDispatch: {
        failDispatch: "hookLabIdeaVariants.failDispatch",
      },
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
  return new Request(
    "https://clipstitchr.test/api/hook-lab/ideas/idea_1/use",
    {
      body: JSON.stringify({
        defaultAvatarId: " avatar_1 ",
        defaultDemoClipId: " demo_1 ",
        productId: " product_1 ",
        saveDefaults: true,
        variationCount: 3,
        ...body,
      }),
      headers: {
        "content-type": "application/json",
        "idempotency-key": " browser-request-1 ",
      },
      method: "POST",
    },
  );
}

function createContext() {
  return { params: Promise.resolve({ id: "idea_1" }) };
}

describe("POST /api/hook-lab/ideas/[id]/use", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createId.mockReturnValue("use_1");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.convex.mutation.mockImplementation(
      async (mutationId: string, input: Record<string, unknown>) => {
        if (mutationId === "hookLabIdeaUses.create") {
          return {
            existing: false,
            useId: "use_1",
            variantIds: ["variant_1", "variant_2", "variant_3"],
          };
        }

        if (mutationId === "hookLabIdeaVariants.dispatchProviderJob") {
          return {
            id: input.providerJobId,
            status: "queued",
          };
        }

        return null;
      },
    );
  });

  it("returns 401 before parsing input when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(
      createRequest({ productId: null }),
      createContext(),
    );

    await expect(response.json()).resolves.toEqual({
      message: "Authentication required.",
    });
    expect(response.status).toBe(401);
    expect(mocks.getAuthenticatedConvexToken).not.toHaveBeenCalled();
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
  });

  it("parses defaults and creates idempotent minimal variant jobs", async () => {
    const request = createRequest();
    const response = await POST(request, createContext());

    await expect(response.json()).resolves.toEqual({
      dispatchFailureCount: 0,
      jobs: [
        {
          id: "provider:hook-lab-idea-use:variant_1",
          status: "queued",
        },
        {
          id: "provider:hook-lab-idea-use:variant_2",
          status: "queued",
        },
        {
          id: "provider:hook-lab-idea-use:variant_3",
          status: "queued",
        },
      ],
      useId: "use_1",
      variantIds: ["variant_1", "variant_2", "variant_3"],
    });
    expect(response.status).toBe(202);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.hookLabDefaults.set.set,
      {
        defaultAvatarId: "avatar_1",
        defaultDemoClipId: "demo_1",
        productId: "product_1",
        updatedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
      },
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.hookLabIdeaUses.create.create,
      expect.objectContaining({
        defaultAvatarId: "avatar_1",
        defaultDemoClipId: "demo_1",
        id: "use_1",
        ideaId: "idea_1",
        idempotencyKey:
          "user_123:hook-lab-idea-use:browser-request-1",
        productId: "product_1",
        variationCount: 3,
      }),
    );
    const dispatchCalls = mocks.convex.mutation.mock.calls.filter(
      ([mutationId]) =>
        mutationId ===
        api.hookLabIdeaVariants.dispatchProviderJob.dispatchProviderJob,
    );

    expect(dispatchCalls).toHaveLength(3);

    for (const [, dispatchInput] of dispatchCalls) {
      const variantId = (dispatchInput as { id: string }).id;

      expect(dispatchInput).toEqual(
        expect.objectContaining({
          id: variantId,
          idempotencyKey: `user_123:hook-lab-idea-use:${variantId}`,
          providerJobId: `provider:hook-lab-idea-use:${variantId}`,
        }),
      );
    }

    expect(mocks.capturePostHogServerEvent).toHaveBeenCalledWith({
      distinctId: "user_123",
      event: "hook_lab_idea_used",
      properties: {
        variation_count: 3,
      },
      request,
    });
  });

  it("rejects unsupported variation counts before any mutation", async () => {
    const response = await POST(
      createRequest({ saveDefaults: false, variationCount: 2 }),
      createContext(),
    );

    await expect(response.json()).resolves.toEqual({
      message: "Choose 1, 3, or 5 versions.",
    });
    expect(response.status).toBe(400);
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
  });

  it("propagates a use quota 429 before creating provider jobs", async () => {
    mocks.convex.mutation.mockImplementation(async (mutationId: string) => {
      if (mutationId === "hookLabIdeaUses.create") {
        throw {
          data: {
            kind: "RateLimited",
            name: "hookLabIdeaUse",
            retryAfter: 1800,
          },
        };
      }

      return null;
    });

    const response = await POST(
      createRequest({ saveDefaults: false }),
      createContext(),
    );

    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        rateLimit: "hookLabIdeaUse",
        retryAfterSeconds: 2,
      }),
    );
    expect(response.status).toBe(429);
    expect(mocks.convex.mutation).not.toHaveBeenCalledWith(
      api.hookLabIdeaVariants.dispatchProviderJob.dispatchProviderJob,
      expect.anything(),
    );
    expect(mocks.capturePostHogServerEvent).not.toHaveBeenCalled();
  });
});
