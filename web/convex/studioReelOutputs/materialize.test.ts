import { beforeEach, describe, expect, it, vi } from "vitest";
import { materialize } from "./materialize";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  assertSecret: vi.fn(),
  consume: vi.fn(),
  createNotification: vi.fn(),
  createReceipt: vi.fn(),
  fingerprint: vi.fn(async () => "fingerprint"),
  getOutput: vi.fn(),
  getReceipt: vi.fn(),
  insertCount: vi.fn(),
  insertProductCount: vi.fn(),
  mutation: vi.fn((definition) => definition),
  scope: vi.fn(),
  upsertCard: vi.fn(),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../studioReelWorker/assertStudioReelWorkerSecret", () => ({
  assertStudioReelWorkerSecret: mocks.assertSecret,
}));
vi.mock("../studioReel/getStudioReelAuthenticatedScope", () => ({
  getStudioReelAuthenticatedScope: mocks.scope,
}));
vi.mock("../studioReel/getStudioReelOutputForOwnerProduct", () => ({
  getStudioReelOutputForOwnerProduct: mocks.getOutput,
}));
vi.mock("../studioReel/getStudioReelWriteReceipt", () => ({
  getStudioReelWriteReceipt: mocks.getReceipt,
}));
vi.mock("../studioReel/createStudioReelWriteReceipt", () => ({
  createStudioReelWriteReceipt: mocks.createReceipt,
}));
vi.mock("../studioReel/createStudioReelRequestFingerprint", () => ({
  createStudioReelRequestFingerprint: mocks.fingerprint,
}));
vi.mock("../studioReel/consumeStudioReelRecordWriteRateLimits", () => ({
  consumeStudioReelRecordWriteRateLimits: mocks.consume,
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

const proof = {
  audioCodec: "aac",
  byteLength: 100,
  contentType: "video/mp4" as const,
  durationSeconds: 12,
  hasAudio: true,
  height: 1920,
  objectKey: "users/user_1/studio/v1/media-output/product_1/run_1/recipe_1/output.mp4",
  objectVersion: "version-12345678",
  sha256: "a".repeat(64),
  videoCodec: "h264",
  width: 1080,
};

const output = {
  _id: "output_document",
  acceptedAt: undefined,
  createdAt: "2026-08-12T00:00:00.000Z",
  generationRunId: "run_1",
  handoff: undefined,
  id: "output_1",
  idempotencyKey: "worker-output",
  ownerId: "user_1",
  productId: "product_1",
  recipeId: "recipe_1",
  recordVersion: 1,
  revision: 1,
  status: "generated" as const,
  updatedAt: "2026-08-12T00:00:00.000Z",
  ...proof,
};

function handler() {
  return (materialize as unknown as ConvexFunction<
    {
      id: string;
      idempotencyKey: string;
      productId: string;
      proof: typeof proof;
      secret: string;
    },
    unknown
  >).handler;
}

describe("studioReelOutputs.materialize", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.scope.mockResolvedValue({ ownerId: "user_1", productId: "product_1" });
    mocks.getOutput.mockResolvedValue(output);
    mocks.getReceipt.mockResolvedValue(null);
  });

  it("atomically creates the Product Library clip and durable handoffs", async () => {
    const insertedClip = {
      clipType: "ugc",
      id: "studio_stitch_output_1",
      name: "recipe 1 - Studio Stitch",
      ownerId: "user_1",
      productId: "product_1",
    };
    const ctx = {
      db: {
        get: vi.fn(async () => insertedClip),
        insert: vi.fn(async () => "video_document"),
        patch: vi.fn(),
        query: vi.fn(() => {
          const chain = {
            unique: vi.fn(async () => null),
            withIndex: vi.fn(
              (_name: string, apply: (index: { eq: () => unknown }) => void) => {
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
      handler()(ctx, {
        id: "output_1",
        idempotencyKey: "materialize_1",
        productId: "product_1",
        proof,
        secret: "server-only-secret",
      }),
    ).resolves.toEqual({
      created: true,
      editorSource: { kind: "studioOutput", outputId: "output_1" },
      libraryAsset: { id: "studio_stitch_output_1", kind: "videoClip" },
      outputId: "output_1",
      publishingSource: {
        kind: "studio-stitch-output",
        sourceId: "output_1",
      },
    });
    expect(mocks.assertSecret).toHaveBeenCalledWith("server-only-secret");
    expect(mocks.scope).toHaveBeenCalledWith(ctx, "product_1");
    expect(mocks.consume).toHaveBeenCalledWith(ctx, "user_1");
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "output_document",
      expect.objectContaining({
        handoff: {
          editorProjectId: null,
          libraryAssetId: "studio_stitch_output_1",
          publishingSourceId: "output_1",
        },
        status: "accepted",
      }),
    );
  });

  it("rejects an R2 proof mismatch before rate or storage writes", async () => {
    const ctx = { db: {} };
    await expect(
      handler()(ctx, {
        id: "output_1",
        idempotencyKey: "materialize_1",
        productId: "product_1",
        proof: { ...proof, sha256: "b".repeat(64) },
        secret: "server-only-secret",
      }),
    ).rejects.toThrow("no longer matches");
    expect(mocks.consume).not.toHaveBeenCalled();
  });

  it("returns the durable handoff without duplicating an idempotent write", async () => {
    const accepted = {
      ...output,
      handoff: {
        editorProjectId: null,
        libraryAssetId: "studio_stitch_output_1",
        publishingSourceId: "output_1",
      },
      status: "accepted" as const,
    };
    mocks.getOutput.mockResolvedValue(accepted);
    mocks.getReceipt.mockResolvedValue({
      operation: "materializeOutput",
      productId: "product_1",
      requestFingerprint: "fingerprint",
    });

    await expect(
      handler()({ db: {} }, {
        id: "output_1",
        idempotencyKey: "materialize_1",
        productId: "product_1",
        proof,
        secret: "server-only-secret",
      }),
    ).resolves.toEqual({
      created: false,
      editorSource: { kind: "studioOutput", outputId: "output_1" },
      libraryAsset: { id: "studio_stitch_output_1", kind: "videoClip" },
      outputId: "output_1",
      publishingSource: {
        kind: "studio-stitch-output",
        sourceId: "output_1",
      },
    });
    expect(mocks.consume).not.toHaveBeenCalled();
    expect(mocks.createReceipt).not.toHaveBeenCalled();
  });

  it("stops before output lookup when Product ownership is rejected", async () => {
    mocks.scope.mockRejectedValue(new Error("Active Product not found."));

    await expect(
      handler()({ db: {} }, {
        id: "output_1",
        idempotencyKey: "materialize_1",
        productId: "product_other",
        proof,
        secret: "server-only-secret",
      }),
    ).rejects.toThrow("Active Product not found");
    expect(mocks.getOutput).not.toHaveBeenCalled();
    expect(mocks.consume).not.toHaveBeenCalled();
  });
});
