import { beforeEach, describe, expect, it, vi } from "vitest";
import { createStudioClipsDefaultEditState } from "./createStudioClipsDefaultEditState";
import { materializeToLibrary } from "./materializeToLibrary";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  assertAccess: vi.fn(),
  assertProduct: vi.fn(),
  consume: vi.fn(),
  createNotification: vi.fn(),
  createReceipt: vi.fn(),
  getAuthenticatedOwnerId: vi.fn(),
  getOutput: vi.fn(),
  getReceipt: vi.fn(),
  getTask: vi.fn(),
  insertCount: vi.fn(),
  insertProductCount: vi.fn(),
  mutation: vi.fn((definition) => definition),
  upsertCard: vi.fn(),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));
vi.mock("../studioBetaAccess/assertStudioBetaAccess", () => ({
  assertStudioBetaAccess: mocks.assertAccess,
}));
vi.mock("../studioClipsTasks/assertStudioClipsActiveProduct", () => ({
  assertStudioClipsActiveProduct: mocks.assertProduct,
}));
vi.mock(
  "../studioClipsRateLimits/consumeStudioClipsRecordWriteRateLimits",
  () => ({
    consumeStudioClipsRecordWriteRateLimits: mocks.consume,
  }),
);
vi.mock("../studioClipsTasks/getStudioClipsTaskForOwnerProduct", () => ({
  getStudioClipsTaskForOwnerProduct: mocks.getTask,
}));
vi.mock("./getStudioClipsOutputForOwnerProduct", () => ({
  getStudioClipsOutputForOwnerProduct: mocks.getOutput,
}));
vi.mock("../studioClipsTasks/getStudioClipsWriteReceipt", () => ({
  getStudioClipsWriteReceipt: mocks.getReceipt,
}));
vi.mock("../studioClipsTasks/createStudioClipsWriteReceipt", () => ({
  createStudioClipsWriteReceipt: mocks.createReceipt,
}));
vi.mock("../aggregateCounts", () => ({
  videoClipCounts: { insertIfDoesNotExist: mocks.insertCount },
  videoClipProductCounts: { insertIfDoesNotExist: mocks.insertProductCount },
}));
vi.mock("../upsertVideoClipCard", () => ({
  upsertVideoClipCard: mocks.upsertCard,
}));
vi.mock("../createNotification", () => ({
  createNotification: mocks.createNotification,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createOutput(accepted = true) {
  const edit = createStudioClipsDefaultEditState();
  if (accepted) {
    edit.acceptance = {
      state: "accepted",
      updatedAt: "2026-08-12T00:00:00.000Z",
    };
  }
  return {
    _id: "output_document",
    artifactId: "best_hook",
    audioCodec: "aac",
    contentType: "video/mp4",
    createdAt: "2026-08-12T00:00:00.000Z",
    durationSeconds: 12,
    editSnapshotByteLength: 1,
    editSnapshotJson: JSON.stringify(edit),
    editSnapshotVersion: 1,
    fileName: "best-hook.mp4",
    hasAudio: true,
    height: 1920,
    id: "output_1",
    objectKey:
      "users/user_1/studio/v1/studio-clips/product_1/task_1/best_hook/best-hook.mp4",
    ownerId: "user_1",
    productId: "product_1",
    recordVersion: 1,
    revision: 2,
    sha256: "a".repeat(64),
    sizeBytes: 100,
    taskId: "task_1",
    updatedAt: "2026-08-12T00:00:00.000Z",
    videoCodec: "h264",
    width: 1080,
  };
}

describe("materializeToLibrary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("user_1");
    mocks.getTask.mockResolvedValue({
      id: "task_1",
      ownerId: "user_1",
      productId: "product_1",
      status: "completed",
    });
    mocks.getReceipt.mockResolvedValue(null);
  });

  it("checks access and Product scope before atomically saving accepted output", async () => {
    const output = createOutput();
    let materialized = false;
    mocks.getOutput.mockImplementation(async () =>
      materialized
        ? {
            ...output,
            libraryClipId: "studio_clips_output_1",
            revision: 3,
          }
        : output,
    );
    const insertedClip = {
      clipType: "ugc",
      id: "studio_clips_output_1",
      name: "best hook - Studio Clips",
      ownerId: "user_1",
      productId: "product_1",
    };
    const ctx = {
      db: {
        get: vi.fn(async () => insertedClip),
        insert: vi.fn(async () => "video_document"),
        patch: vi.fn(async () => {
          materialized = true;
        }),
        query: vi.fn(() => {
          const chain = {
            unique: vi.fn(async () => null),
            withIndex: vi.fn(
              (
                _name: string,
                apply: (index: { eq: () => unknown }) => unknown,
              ) => {
                const index = { eq: vi.fn(() => index) };
                apply(index);
                return chain;
              },
            ),
          };
          return chain;
        }),
      },
    };

    await expect(
      getHandler<
        {
          expectedRevision: number;
          id: string;
          idempotencyKey: string;
          productId: string;
          taskId: string;
        },
        { created: boolean; libraryClipId: string }
      >(materializeToLibrary)(ctx, {
        expectedRevision: 2,
        id: "output_1",
        idempotencyKey: "materialize-output-1",
        productId: "product_1",
        taskId: "task_1",
      }),
    ).resolves.toMatchObject({
      created: true,
      libraryClipId: "studio_clips_output_1",
    });

    expect(mocks.assertAccess).toHaveBeenCalledWith(ctx, "user_1");
    expect(mocks.assertProduct).toHaveBeenCalledWith(
      ctx,
      "user_1",
      "product_1",
    );
    expect(mocks.consume).toHaveBeenCalledWith(ctx, "user_1");
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "videoClips",
      expect.objectContaining({
        id: "studio_clips_output_1",
        productId: "product_1",
      }),
    );
    expect(mocks.insertCount).toHaveBeenCalled();
    expect(mocks.insertProductCount).toHaveBeenCalled();
    expect(mocks.upsertCard).toHaveBeenCalled();
    expect(mocks.createReceipt).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({ operation: "materialize" }),
    );
  });

  it("refuses unaccepted output before write or rate-limit consumption", async () => {
    mocks.getOutput.mockResolvedValue(createOutput(false));
    const ctx = {
      db: {
        query: vi.fn(() => {
          const chain = {
            unique: vi.fn(async () => null),
            withIndex: vi.fn(() => chain),
          };
          return chain;
        }),
      },
    };

    await expect(
      getHandler(materializeToLibrary)(ctx, {
        expectedRevision: 2,
        id: "output_1",
        idempotencyKey: "materialize-output-1",
        productId: "product_1",
        taskId: "task_1",
      }),
    ).rejects.toThrow("Accept");
    expect(mocks.consume).not.toHaveBeenCalled();
  });

  it("refuses a poisoned cross-Product output key before any Library write", async () => {
    mocks.getOutput.mockResolvedValue({
      ...createOutput(),
      objectKey:
        "users/user_1/studio/v1/studio-clips/product_2/task_1/best_hook/best-hook.mp4",
    });
    const ctx = { db: { insert: vi.fn(), patch: vi.fn(), query: vi.fn() } };

    await expect(
      getHandler(materializeToLibrary)(ctx, {
        expectedRevision: 2,
        id: "output_1",
        idempotencyKey: "materialize-output-1",
        productId: "product_1",
        taskId: "task_1",
      }),
    ).rejects.toThrow("another Product");
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(mocks.consume).not.toHaveBeenCalled();
  });
});
