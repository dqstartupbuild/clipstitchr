import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/cli/demo-agent/plan/route";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
  };

  return {
    convex,
    createCliDemoAgentPlannerGeneration: vi.fn(),
    createConvexHttpClient: vi.fn(() => convex),
    createReplicateClient: vi.fn(() => ({ provider: "replicate" })),
    getCliSessionFromRequest: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    rateLimits: {
      consumeCliDemoAgentPlan: "rateLimits.consumeCliDemoAgentPlan",
    },
  },
}));

vi.mock(
  "@/lib/clipstitchr/server/cli/demoAgentPlanner/createCliDemoAgentPlannerGeneration",
  () => ({
    createCliDemoAgentPlannerGeneration:
      mocks.createCliDemoAgentPlannerGeneration,
  }),
);

vi.mock("@/lib/clipstitchr/server/cli/getCliSessionFromRequest", () => ({
  getCliSessionFromRequest: mocks.getCliSessionFromRequest,
}));

vi.mock("@/lib/clipstitchr/server/convex/createConvexHttpClient", () => ({
  createConvexHttpClient: mocks.createConvexHttpClient,
}));

vi.mock("@/lib/clipstitchr/server/createReplicateClient", () => ({
  createReplicateClient: mocks.createReplicateClient,
}));

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

function createRequest(body: object) {
  return new Request("https://clipstitchr.test/api/cli/demo-agent/plan", {
    body: JSON.stringify(body),
    method: "POST",
  });
}

function createBody() {
  return {
    appContext: {
      projectDirectory: "web",
      projectType: "web",
      routes: [
        { confidence: "low", name: "Show /dashboard/hooks", path: "/dashboard/hooks" },
      ],
      workflowHints: [
        {
          actions: ["Hooks to learn from", "Save Hook Lab"],
          buttons: ["Save Hook Lab"],
          featureLabels: ["Hook Lab"],
          inputs: ["Hooks to learn from", "Hooks to avoid"],
          routePath: "/dashboard/hooks",
          sourceFiles: ["app/_components/hooks/ProductHookMemoryFields.tsx"],
          summary: "Inputs: Hooks to learn from. Buttons: Save Hook Lab",
          title: "Hooks workflow",
        },
      ],
    },
    approvedTestValueKeys: ["testEmail"],
    attemptedActionKeys: [],
    guide: {
      goal: "Demonstrate running a batch Stitch in Stitchr.",
      productId: "product_123",
      productName: "ClipStitchr",
      steps: [
        {
          id: "step-1",
          label: "Upload the clip",
        },
      ],
      title: "Batch Stitch demo",
    },
    observation: {
      buttons: [{ name: "Upload", role: "button" }],
      canScrollDown: false,
      canScrollUp: false,
      dialogs: [],
      headings: [{ name: "Dashboard", role: "heading" }],
      inputs: [],
      links: [],
      title: "Dashboard",
      url: "http://localhost:3000/dashboard",
    },
    step: {
      id: "step-1",
      label: "Upload the clip",
    },
  };
}

function createGeneration() {
  return {
    action: {
      reason: "The upload button is visible.",
      stepId: "step-1",
      target: { name: "Upload", role: "button" },
      type: "click",
    },
    providerModel: "openai/gpt-5-mini",
    providerPredictionId: "prediction_123",
  };
}

describe("POST /api/cli/demo-agent/plan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCliSessionFromRequest.mockResolvedValue({ ownerId: "owner_123" });
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.createCliDemoAgentPlannerGeneration.mockResolvedValue(
      createGeneration(),
    );
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

  it("plans an action after consuming quota", async () => {
    const response = await POST(createRequest(createBody()));

    await expect(response.json()).resolves.toEqual(createGeneration());
    expect(response.status).toBe(200);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeCliDemoAgentPlan,
      {
        ownerId: "owner_123",
        secret: "rate-limit-secret",
      },
    );
    expect(mocks.createCliDemoAgentPlannerGeneration).toHaveBeenCalledWith({
      replicate: { provider: "replicate" },
      request: expect.objectContaining({
        approvedTestValueKeys: ["testEmail"],
        guide: expect.objectContaining({
          goal: "Demonstrate running a batch Stitch in Stitchr.",
          productName: "ClipStitchr",
        }),
        appContext: expect.objectContaining({
          workflowHints: [
            expect.objectContaining({
              featureLabels: ["Hook Lab"],
              inputs: ["Hooks to learn from", "Hooks to avoid"],
              routePath: "/dashboard/hooks",
            }),
          ],
        }),
        step: expect.objectContaining({ id: "step-1" }),
      }),
    });
  });

  it("returns 429 when planner quota is exceeded", async () => {
    mocks.convex.mutation.mockRejectedValueOnce({
      data: {
        kind: "RateLimited",
        name: "cliDemoAgentPlan",
        retryAfter: 2500,
      },
    });

    const response = await POST(createRequest(createBody()));

    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        rateLimit: "cliDemoAgentPlan",
        retryAfterSeconds: 3,
      }),
    );
    expect(response.status).toBe(429);
    expect(mocks.createCliDemoAgentPlannerGeneration).not.toHaveBeenCalled();
  });

  it("returns 500 when provider output is invalid", async () => {
    mocks.createCliDemoAgentPlannerGeneration.mockRejectedValueOnce(
      new Error("Planner action type is not supported."),
    );

    const response = await POST(createRequest(createBody()));

    await expect(response.json()).resolves.toEqual({
      message: "Planner action type is not supported.",
    });
    expect(response.status).toBe(500);
  });

  it("returns retry timing when the planner provider queue is busy", async () => {
    mocks.createCliDemoAgentPlannerGeneration.mockRejectedValueOnce(
      new Error(
        '{"code":"ExpiredInQueue","message":"Too many concurrent requests in a short period of time."}',
      ),
    );

    const response = await POST(createRequest(createBody()));

    await expect(response.json()).resolves.toEqual({
      error: "Planner provider is busy. Try again in 6 seconds.",
      message: "Planner provider is busy. Try again in 6 seconds.",
      providerBackpressure: true,
      retryAfterSeconds: 6,
    });
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("6");
  });
});
