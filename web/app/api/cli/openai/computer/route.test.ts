import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/cli/openai/computer/route";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
  };

  return {
    convex,
    createConvexHttpClient: vi.fn(() => convex),
    getCliSessionFromRequest: vi.fn(),
    requestCliOpenAiComputerRelayResponse: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    rateLimits: {
      consumeCliOpenAiComputerRelay:
        "rateLimits.consumeCliOpenAiComputerRelay",
    },
  },
}));

vi.mock("@/lib/clipstitchr/server/cli/getCliSessionFromRequest", () => ({
  getCliSessionFromRequest: mocks.getCliSessionFromRequest,
}));

vi.mock("@/lib/clipstitchr/server/convex/createConvexHttpClient", () => ({
  createConvexHttpClient: mocks.createConvexHttpClient,
}));

vi.mock(
  "@/lib/clipstitchr/server/cli/openAiComputerRelay/requestCliOpenAiComputerRelayResponse",
  () => ({
    requestCliOpenAiComputerRelayResponse:
      mocks.requestCliOpenAiComputerRelayResponse,
  }),
);

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

function createBody() {
  return {
    callIndex: 1,
    input: "Complete the current guide step.",
    model: "gpt-5.5",
    runId: "run_123",
    runStartedAt: new Date().toISOString(),
  };
}

function createRequest(body: object) {
  return new Request("https://clipstitchr.test/api/cli/openai/computer", {
    body: JSON.stringify(body),
    method: "POST",
  });
}

describe("POST /api/cli/openai/computer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.getCliSessionFromRequest.mockResolvedValue({ ownerId: "owner_123" });
    mocks.requestCliOpenAiComputerRelayResponse.mockResolvedValue({
      id: "resp_123",
      output: [],
    });
  });

  it("returns 401 when the CLI bearer token is missing", async () => {
    mocks.getCliSessionFromRequest.mockResolvedValue(null);

    const response = await POST(createRequest(createBody()));

    await expect(response.json()).resolves.toEqual({
      message: "Run `clipstitchr login` to connect this machine.",
    });
    expect(response.status).toBe(401);
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
  });

  it("consumes relay quota before calling OpenAI", async () => {
    const response = await POST(createRequest(createBody()));

    await expect(response.json()).resolves.toEqual({
      id: "resp_123",
      output: [],
    });
    expect(response.status).toBe(200);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeCliOpenAiComputerRelay,
      {
        ownerId: "owner_123",
        runId: "run_123",
        secret: "rate-limit-secret",
      },
    );
    expect(mocks.requestCliOpenAiComputerRelayResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        input: "Complete the current guide step.",
        model: "gpt-5.5",
      }),
    );
  });

  it("returns 429 when relay quota is exceeded", async () => {
    mocks.convex.mutation.mockRejectedValueOnce({
      data: {
        kind: "RateLimited",
        name: "cliOpenAiComputerRelay",
        retryAfter: 2500,
      },
    });

    const response = await POST(createRequest(createBody()));

    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        rateLimit: "cliOpenAiComputerRelay",
        retryAfterSeconds: 3,
      }),
    );
    expect(response.status).toBe(429);
    expect(mocks.requestCliOpenAiComputerRelayResponse).not.toHaveBeenCalled();
  });

  it("rejects invalid payloads before relay quota", async () => {
    const response = await POST(
      createRequest({
        ...createBody(),
        callIndex: 999,
      }),
    );

    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        message: expect.stringContaining("limited to 80 calls"),
      }),
    );
    expect(response.status).toBe(500);
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
  });
});
