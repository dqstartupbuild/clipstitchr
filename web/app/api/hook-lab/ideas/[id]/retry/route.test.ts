import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/hook-lab/ideas/[id]/retry/route";
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
      retry: {
        retry: "hookLabIdeas.retry",
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

function createRequest() {
  return new Request(
    "https://clipstitchr.test/api/hook-lab/ideas/idea_1/retry",
    { method: "POST" },
  );
}

function createContext() {
  return { params: Promise.resolve({ id: "idea_1" }) };
}

describe("POST /api/hook-lab/ideas/[id]/retry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createId.mockReturnValue("attempt_1");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.convex.mutation.mockImplementation(
      async (mutationId: string, input: Record<string, unknown>) => {
        if (mutationId === "hookLabIdeas.retry") {
          return {
            id: "idea_1",
            sourcePlatform: "instagram",
            sourceType: "social_link",
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

  it("returns 401 before retrying when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(createRequest(), createContext());

    await expect(response.json()).resolves.toEqual({
      message: "Authentication required.",
    });
    expect(response.status).toBe(401);
    expect(mocks.getAuthenticatedConvexToken).not.toHaveBeenCalled();
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
  });

  it("retries the path idea with an idempotent minimal provider job", async () => {
    const request = createRequest();
    const response = await POST(request, createContext());

    expect(response.status).toBe(202);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.hookLabIdeas.retry.retry,
      {
        id: "idea_1",
        updatedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
      },
    );
    const providerCall = mocks.convex.mutation.mock.calls.find(
      ([mutationId]) => mutationId === api.providerJobs.create,
    );
    const providerInput = providerCall?.[1] as {
      id: string;
      idempotencyKey: string;
      inputSnapshotJson: string;
    };

    expect(providerInput.id).toBe(
      "provider:hook-lab-idea-analysis:idea_1:attempt_1",
    );
    expect(providerInput.idempotencyKey).toBe(
      "user_123:hook-lab-idea-analysis:idea_1:attempt_1",
    );
    expect(JSON.parse(providerInput.inputSnapshotJson)).toEqual({
      ideaId: "idea_1",
    });
    expect(mocks.capturePostHogServerEvent).toHaveBeenCalledWith({
      distinctId: "user_123",
      event: "hook_lab_idea_analysis_started",
      properties: {
        is_retry: true,
        source_platform: "instagram",
        source_type: "social_link",
      },
      request,
    });
  });

  it("propagates 429 before creating a retry provider job", async () => {
    mocks.convex.mutation.mockImplementation(
      async (mutationId: string) => {
        if (mutationId === "hookLabIdeas.retry") {
          return {
            id: "idea_1",
            sourceType: "social_link",
            status: "analyzing",
          };
        }

        if (mutationId === "rateLimits.consumeHookLabIdeaAnalysis") {
          throw {
            data: {
              kind: "RateLimited",
              name: "hookLabIdeaAnalysis",
              retryAfter: 1000,
            },
          };
        }

        return null;
      },
    );

    const response = await POST(createRequest(), createContext());

    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        rateLimit: "hookLabIdeaAnalysis",
        retryAfterSeconds: 1,
      }),
    );
    expect(response.status).toBe(429);
    expect(mocks.convex.mutation).not.toHaveBeenCalledWith(
      api.providerJobs.create,
      expect.anything(),
    );
    expect(mocks.capturePostHogServerEvent).not.toHaveBeenCalled();
  });
});
