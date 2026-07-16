import { beforeEach, describe, expect, it, vi } from "vitest";
import { planDaily } from "./automationClipr";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

type QueryResult = {
  collect?: unknown[];
  take?: unknown[];
  unique?: unknown;
};

const mocks = vi.hoisted(() => ({
  assertAutomationWorkerSecret: vi.fn(),
  consumeAutomationBudget: vi.fn(),
  createAutomationRun: vi.fn(),
  createAutomationTask: vi.fn(),
  getDefaultAvatarForOwner: vi.fn(),
  getDefaultProductForOwner: vi.fn(),
  getIsAutomationToolEnabled: vi.fn(),
  isWithinAutomationGlobalWindow: vi.fn(),
  markAutomationRunStatus: vi.fn(),
  markAutomationRunSkipped: vi.fn(),
  mutation: vi.fn((definition) => definition),
  tryReserveAiVideoForAutomation: vi.fn(),
}));

vi.mock("./_generated/server", () => ({
  mutation: mocks.mutation,
}));

vi.mock("./auth/assertAutomationWorkerSecret", () => ({
  assertAutomationWorkerSecret: mocks.assertAutomationWorkerSecret,
}));

vi.mock("./automationBudget", () => ({
  consumeAutomationBudget: mocks.consumeAutomationBudget,
}));

vi.mock("./automationCreateRun", () => ({
  createAutomationRun: mocks.createAutomationRun,
}));

vi.mock("./automationCreateTask", () => ({
  createAutomationTask: mocks.createAutomationTask,
}));

vi.mock("./automationMarkRunSkipped", () => ({
  markAutomationRunSkipped: mocks.markAutomationRunSkipped,
}));

vi.mock("./markAutomationRunStatus", () => ({
  markAutomationRunStatus: mocks.markAutomationRunStatus,
}));

vi.mock("./getDefaultAvatarForOwner", () => ({
  getDefaultAvatarForOwner: mocks.getDefaultAvatarForOwner,
}));

vi.mock("./getDefaultProductForOwner", () => ({
  getDefaultProductForOwner: mocks.getDefaultProductForOwner,
}));

vi.mock("../lib/clipstitchr/constants/automationToolFeatureFlags", () => ({
  getIsAutomationToolEnabled: mocks.getIsAutomationToolEnabled,
}));

vi.mock("./isWithinAutomationGlobalWindow", () => ({
  isWithinAutomationGlobalWindow: mocks.isWithinAutomationGlobalWindow,
}));

vi.mock("./usage/tryReserveAiVideoForAutomation", () => ({
  tryReserveAiVideoForAutomation: mocks.tryReserveAiVideoForAutomation,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createQueryChain(result: QueryResult = {}) {
  const indexQuery = {
    eq: vi.fn(() => indexQuery),
  };
  const chain = {
    collect: vi.fn(async () => result.collect ?? []),
    order: vi.fn(() => chain),
    take: vi.fn(async () => result.take ?? result.collect ?? []),
    unique: vi.fn(async () => result.unique ?? null),
    withIndex: vi.fn(
      (_indexName: string, callback: (q: typeof indexQuery) => unknown) => {
        callback(indexQuery);

        return chain;
      },
    ),
  };

  return chain;
}

function createCtx(resultsByTable: Record<string, QueryResult[]> = {}) {
  const queues = new Map(
    Object.entries(resultsByTable).map(([table, results]) => [
      table,
      [...results],
    ]),
  );

  return {
    db: {
      patch: vi.fn(async () => undefined),
      query: vi.fn((table: string) => {
        const queue = queues.get(table);
        const result = queue?.shift() ?? {};

        return createQueryChain(result);
      }),
    },
  };
}

const now = "2026-06-01T10:00:00.000Z";
const product = {
  _id: "product_doc",
  audienceDetails: "Busy creators",
  createdAt: "2026-05-01T00:00:00.000Z",
  id: "product_1",
  inferredPainPoints: ["slow content creation"],
  name: "Product",
  productDetails: "Helps creators make more short videos.",
  updatedAt: "2026-05-02T00:00:00.000Z",
};
const avatar = {
  _id: "avatar_doc",
  id: "avatar_1",
  name: "Creator",
};
const avatarPhoto = {
  _id: "photo_doc",
  avatarId: "avatar_1",
  id: "photo_1",
  photoObject: {
    contentType: "image/jpeg",
    key: "users/owner_123/photos/photo_1.jpg",
    size: 100,
  },
};

describe("automationClipr", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getIsAutomationToolEnabled.mockReturnValue(true);
    mocks.isWithinAutomationGlobalWindow.mockReturnValue(true);
    mocks.createAutomationRun.mockImplementation(async (_ctx, args) => ({
      _id: "run_doc",
      ...args,
      status: "queued",
    }));
    mocks.createAutomationTask.mockImplementation(async (_ctx, args) => ({
      _id: "task_doc",
      ...args,
    }));
    mocks.markAutomationRunStatus.mockImplementation(async (ctx, args) => {
      await ctx.db.patch(args.runDocumentId, {
        status: args.status,
        startedAt: args.updatedAt,
        updatedAt: args.updatedAt,
      });
    });
    mocks.getDefaultProductForOwner.mockResolvedValue(product);
    mocks.getDefaultAvatarForOwner.mockResolvedValue(avatar);
    mocks.tryReserveAiVideoForAutomation.mockResolvedValue({
      planKey: "pro",
      reservationId: "reservation_123",
    });
  });

  it("coerces hidden Script preferences to automatic Any visual clips", async () => {
    const ctx = createCtx({
      automationPreferences: [
        {
          unique: {
            enabled: true,
            enabledTools: ["clipr"],
            cliprGenerationMode: "script",
            preferenceVersion: 3,
            productSelectionMode: "default",
            selectedProductIds: [],
          },
        },
      ],
      photoAssets: [{ collect: [avatarPhoto] }],
      products: [{ collect: [product] }],
    });

    await expect(
      getHandler<Record<string, string>, unknown>(planDaily)(ctx, {
        automationDate: "2026-06-01",
        now,
        ownerId: "owner_123",
        secret: "automation_secret",
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        status: "running",
        taskIds: ["automation:clipr:owner_123:legacy:2026-06-01:1"],
      }),
    );

    expect(mocks.consumeAutomationBudget).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        ownerId: "owner_123",
        providerCostUnits: 8,
        tool: "clipr",
      }),
    );

    const createTaskCall = mocks.createAutomationTask.mock.calls[0];

    expect(createTaskCall).toBeDefined();

    const taskInput = JSON.parse(createTaskCall?.[1].inputSnapshotJson) as {
      generationMode: string;
      requestedGenerationMode: string;
      requestedVideoModelId: string;
      targetDurationSeconds: number;
      videoModelId: string;
    };

    expect(taskInput.requestedGenerationMode).toBe("any");
    expect(["reaction", "broll"]).toContain(taskInput.generationMode);
    expect(taskInput.requestedVideoModelId).toBe("auto");
    expect(taskInput.targetDurationSeconds).toBe(8);
    expect(taskInput.videoModelId).toBe("kwaivgi/kling-v3-video");
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "run_doc",
      expect.objectContaining({
        status: "running",
        startedAt: now,
      }),
    );
  });

  it("queues automatic visual Clipr modes with short silent-video cost", async () => {
    const ctx = createCtx({
      automationPreferences: [
        {
          unique: {
            enabled: true,
            enabledTools: ["clipr"],
            cliprGenerationMode: "broll",
            preferenceVersion: 3,
            productSelectionMode: "default",
            selectedProductIds: [],
          },
        },
      ],
      photoAssets: [{ collect: [avatarPhoto] }],
      products: [{ collect: [product] }],
    });

    await getHandler<Record<string, string>, unknown>(planDaily)(ctx, {
      automationDate: "2026-06-01",
      now,
      ownerId: "owner_123",
      secret: "automation_secret",
    });

    expect(mocks.consumeAutomationBudget).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        ownerId: "owner_123",
        providerCostUnits: 8,
        tool: "clipr",
      }),
    );

    const createTaskCall = mocks.createAutomationTask.mock.calls[0];
    const taskInput = JSON.parse(createTaskCall?.[1].inputSnapshotJson) as {
      generationMode: string;
      requestedGenerationMode: string;
      targetDurationSeconds: number;
      videoModelId: string;
    };

    expect(taskInput.requestedGenerationMode).toBe("broll");
    expect(taskInput.generationMode).toBe("broll");
    expect(taskInput.targetDurationSeconds).toBe(8);
    expect(taskInput.videoModelId).toBe("kwaivgi/kling-v3-video");
  });
});
