import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/convex/_generated/api";
import { POST } from "@/app/api/stitchr/batch/generate/route";

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
    query: vi.fn(),
  };

  return {
    convex,
    createAuthenticatedConvexHttpClient: vi.fn(() => convex),
    createStitchrBatchHookGeneration: vi.fn(),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    rateLimits: {
      consumeStitchrBatchHookPlan: "rateLimits.consumeStitchrBatchHookPlan",
    },
    stitchrHookPlans: {
      listBatchPlanningInputs: "stitchrHookPlans.listBatchPlanningInputs",
      saveBatchPlannerFailure: "stitchrHookPlans.saveBatchPlannerFailure",
      saveBatchPlannerResults: "stitchrHookPlans.saveBatchPlannerResults",
    },
    stitchrBatch: {
      plan: "stitchrBatch.plan",
    },
  },
}));

vi.mock("@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient", () => ({
  createAuthenticatedConvexHttpClient: mocks.createAuthenticatedConvexHttpClient,
}));

vi.mock("@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken", () => ({
  getAuthenticatedConvexToken: mocks.getAuthenticatedConvexToken,
}));

vi.mock("@/lib/clipstitchr/server/createReplicateClient", () => ({
  createReplicateClient: () => ({ predictions: { create: vi.fn() } }),
}));

vi.mock("@/lib/clipstitchr/server/createStitchrBatchHookGeneration", () => ({
  createStitchrBatchHookGeneration: mocks.createStitchrBatchHookGeneration,
}));

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-secret",
}));

vi.mock("@/lib/clipstitchr/server/automation/getAutomationWorkerSecret", () => ({
  getAutomationWorkerSecret: () => "automation-secret",
}));

vi.mock("@/lib/clipstitchr/server/getAuthenticatedUserId", () => ({
  getAuthenticatedUserId: mocks.getAuthenticatedUserId,
}));

function createTaskInputSnapshot(taskId: string, hasTemplateTextOverlay = true) {
  return {
    id: taskId,
    runId: "stitchr-batch:user_123:2026-06-17",
    inputSnapshotJson: JSON.stringify({
      automationDate: "2026-06-17",
      demoClipId: `demo_${taskId}`,
      demoClipName: `Demo ${taskId}`,
      demoDuration: 10,
      demoHasAudio: true,
      demoTags: ["demo"],
      demoTrimRange: { start: 0, end: 10 },
      demoVideoObject: {
        bucket: "media",
        key: "demo.mp4",
      },
      productId: "product_1",
      productName: "Launch Kit",
      productDetails: "Helps founders make better short-form ads.",
      audienceDetails: "Busy founders",
      inferredPainPoints: ["ads feel repetitive"],
      templateTextOverlay: hasTemplateTextOverlay
        ? {
            text: "Saved hook",
            startTime: 0,
            endTime: 12,
            x: 0.1,
            y: 0.1,
            width: 0.8,
            fontSize: 42,
            styleId: "hook",
          }
        : undefined,
      ugcClipId: `ugc_${taskId}`,
      ugcClipName: `UGC ${taskId}`,
      ugcDuration: 8,
      ugcHasAudio: true,
      ugcTags: ["reaction"],
      ugcTrimRange: { start: 0, end: 8 },
      ugcVideoObject: {
        bucket: "media",
        key: "ugc.mp4",
      },
    }),
  };
}

describe("POST /api/stitchr/batch/generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.convex.mutation.mockImplementation((name: unknown) => {
      if (name === api.stitchrBatch.plan) {
        return Promise.resolve({
          message: undefined,
          runId: "stitchr-batch:user_123:2026-06-17",
          status: "running",
          taskIds: ["task_1", "task_2"],
        });
      }

      if (name === api.stitchrHookPlans.saveBatchPlannerResults) {
        return Promise.resolve({ savedCount: 2 });
      }

      return Promise.resolve(undefined);
    });
    mocks.convex.query.mockResolvedValue([
      createTaskInputSnapshot("task_1"),
      createTaskInputSnapshot("task_2"),
    ]);
    mocks.createStitchrBatchHookGeneration.mockResolvedValue({
      plans: [],
      providerModel: "anthropic/claude-sonnet-4.6",
      providerPredictionId: "prediction_1",
    });
  });

  it("returns 401 before planning when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST();

    expect(response.status).toBe(401);
    expect(mocks.createAuthenticatedConvexHttpClient).not.toHaveBeenCalled();
  });

  it("plans a Stitchr batch for the signed-in user", async () => {
    const response = await POST();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({
        batchDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        count: 2,
        hookPlanCount: 0,
        hookPlanStatus: "skipped",
        runId: "stitchr-batch:user_123:2026-06-17",
        status: "running",
        taskIds: ["task_1", "task_2"],
      }),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.stitchrBatch.plan,
      expect.objectContaining({
        secret: "automation-secret",
        ownerId: "user_123",
      }),
    );
  });

  it("plans batch hooks once and saves the returned per-task options", async () => {
    mocks.convex.query.mockResolvedValueOnce([
      createTaskInputSnapshot("task_1", false),
      createTaskInputSnapshot("task_2", false),
    ]);
    mocks.createStitchrBatchHookGeneration.mockResolvedValueOnce({
      plans: [
        {
          automationTaskId: "task_1",
          caption: "That first clip says a lot",
          hashtags: ["#ugc", "#demo"],
          hookOptions: [
            {
              angle: "surprise",
              reason: "Fits the reaction",
              text: "I did not expect that",
            },
          ],
          providerModel: "anthropic/claude-sonnet-4.6",
          providerPredictionId: "prediction_1",
          selectedHook: "I did not expect that",
          socialCaption: "That first clip says a lot\n\n#ugc #demo",
        },
        {
          automationTaskId: "task_2",
          caption: "The demo makes it click",
          hashtags: ["#founders", "#ads"],
          hookOptions: [
            {
              angle: "payoff",
              reason: "Fits the demo",
              text: "This is the missing part",
            },
          ],
          providerModel: "anthropic/claude-sonnet-4.6",
          providerPredictionId: "prediction_1",
          selectedHook: "This is the missing part",
          socialCaption: "The demo makes it click\n\n#founders #ads",
        },
      ],
      providerModel: "anthropic/claude-sonnet-4.6",
      providerPredictionId: "prediction_1",
    });

    const response = await POST();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({
        hookPlanCount: 2,
        hookPlanStatus: "planned",
      }),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeStitchrBatchHookPlan,
      { secret: "rate-secret" },
    );
    expect(mocks.createStitchrBatchHookGeneration).toHaveBeenCalledTimes(1);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.stitchrHookPlans.saveBatchPlannerResults,
      expect.objectContaining({
        plans: expect.arrayContaining([
          expect.objectContaining({
            automationTaskId: "task_1",
            productId: "product_1",
            ugcClipId: "ugc_task_1",
            demoClipId: "demo_task_1",
          }),
        ]),
      }),
    );
  });

  it("passes a selected Stitch template into planning", async () => {
    const request = new Request("https://clipstitchr.test/api/stitchr/batch/generate", {
      body: JSON.stringify({ templateId: "template_1" }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.stitchrBatch.plan,
      expect.objectContaining({
        templateId: "template_1",
      }),
    );
  });

  it("passes selected Batch text styling into planning", async () => {
    const request = new Request("https://clipstitchr.test/api/stitchr/batch/generate", {
      body: JSON.stringify({
        stitchrTextBackgroundColorChoice: "#111111",
        stitchrTextColorChoice: "#f97316",
        stitchrTextStrokeColorChoice: "#ffffff",
        stitchrTextStyleChoice: "outline",
      }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.stitchrBatch.plan,
      expect.objectContaining({
        stitchrTextBackgroundColorChoice: "#111111",
        stitchrTextColorChoice: "#f97316",
        stitchrTextStrokeColorChoice: "#ffffff",
        stitchrTextStyleChoice: "outline",
      }),
    );
  });

  it("returns rate-limit responses from Convex planning", async () => {
    mocks.convex.mutation.mockImplementationOnce(() =>
      Promise.reject({
        data: {
          kind: "RateLimited",
          name: "stitchrBatchDaily",
          retryAfter: 1000,
        },
      }),
    );

    const response = await POST();

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        rateLimit: "stitchrBatchDaily",
        retryAfterSeconds: 1,
      }),
    );
  });
});
