import { beforeEach, describe, expect, it, vi } from "vitest";
import { planCliSwiprBatch } from "./planCliSwiprBatch";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  assertRateLimitApiSecret: vi.fn(),
  consumeAutomationBudget: vi.fn(),
  createAutomationRun: vi.fn(),
  createAutomationTask: vi.fn(),
  getAutomationPreferenceForProduct: vi.fn(),
  getDefaultProductForOwner: vi.fn(),
  getIsAutomationToolEnabled: vi.fn(),
  getProductForOwner: vi.fn(),
  markAutomationRunStatus: vi.fn(),
  mutation: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({
  mutation: mocks.mutation,
}));

vi.mock("../auth/assertRateLimitApiSecret", () => ({
  assertRateLimitApiSecret: mocks.assertRateLimitApiSecret,
}));

vi.mock("../automationBudget", () => ({
  consumeAutomationBudget: mocks.consumeAutomationBudget,
}));

vi.mock("../automationCreateRun", () => ({
  createAutomationRun: mocks.createAutomationRun,
}));

vi.mock("../automationCreateTask", () => ({
  createAutomationTask: mocks.createAutomationTask,
}));

vi.mock("../markAutomationRunStatus", () => ({
  markAutomationRunStatus: mocks.markAutomationRunStatus,
}));

vi.mock("../getAutomationPreferenceForProduct", () => ({
  getAutomationPreferenceForProduct: mocks.getAutomationPreferenceForProduct,
}));

vi.mock("../getDefaultProductForOwner", () => ({
  getDefaultProductForOwner: mocks.getDefaultProductForOwner,
}));

vi.mock("../getProductForOwner", () => ({
  getProductForOwner: mocks.getProductForOwner,
}));

vi.mock("../../lib/clipstitchr/constants/automationToolFeatureFlags", () => ({
  getIsAutomationToolEnabled: mocks.getIsAutomationToolEnabled,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

const now = "2026-07-06T10:00:00.000Z";
const product = {
  _id: "product_doc",
  audienceDetails: "Busy founders",
  createdAt: "2026-07-01T00:00:00.000Z",
  id: "product_1",
  name: "Product",
  productDetails: "Helps people make short-form content.",
  updatedAt: "2026-07-02T00:00:00.000Z",
};

describe("planCliSwiprBatch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getIsAutomationToolEnabled.mockReturnValue(true);
    mocks.getAutomationPreferenceForProduct.mockResolvedValue({
      enabled: false,
      enabledTools: [],
      preferenceVersion: 2,
      swiprGenerationCount: 3,
      swiprCallToActionStyle: "follow",
      swiprCreativeContext: "Focus on launch-day anxiety.",
      swiprSelectedLibraryPackNames: [],
    });
    mocks.getDefaultProductForOwner.mockResolvedValue(product);
    mocks.getProductForOwner.mockResolvedValue(product);
    mocks.createAutomationRun.mockImplementation(async (_ctx, args) => ({
      _id: "run_doc",
      ...args,
      status: "queued",
    }));
    mocks.createAutomationTask.mockImplementation(async (_ctx, args) => ({
      _id: "task_doc",
      ...args,
    }));
  });

  it("creates explicit CLI tasks without requiring daily Swipr automation", async () => {
    const ctx = {};

    await expect(
      getHandler<Record<string, string>, unknown>(planCliSwiprBatch)(ctx, {
        automationDate: "2026-07-06",
        batchId: "batch_1",
        now,
        ownerId: "owner_1",
        secret: "rate_limit_secret",
      }),
    ).resolves.toEqual({
      generationCount: 3,
      runId: "cli:swipr:owner_1:legacy:2026-07-06:batch_1",
      status: "running",
      taskIds: ["cli:swipr:owner_1:legacy:2026-07-06:batch_1:batch"],
    });

    expect(mocks.createAutomationTask).toHaveBeenCalledTimes(1);
    expect(mocks.createAutomationTask).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        id: "cli:swipr:owner_1:legacy:2026-07-06:batch_1:batch",
        skipAutomationPreferenceCheck: true,
        taskType: "swipr-draft",
        tool: "swipr",
      }),
    );
    const taskInput = JSON.parse(
      mocks.createAutomationTask.mock.calls[0]?.[1].inputSnapshotJson,
    ) as Record<string, unknown>;

    expect(taskInput).toEqual(
      expect.objectContaining({
        generationCount: 3,
        swiprCallToActionStyle: "follow",
        swiprCreativeContext: "Focus on launch-day anxiety.",
      }),
    );
  });
});
