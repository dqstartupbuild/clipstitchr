import { beforeEach, describe, expect, it, vi } from "vitest";
import { dispatchProviderJob } from "./dispatchProviderJob";

type ConvexFunction = {
  handler: (ctx: unknown, args: Record<string, unknown>) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({
  assertRateLimitApiSecret: vi.fn(),
  getAuthenticatedOwnerId: vi.fn(),
  mutation: vi.fn((definition) => definition),
  requestWorkerLaunch: vi.fn(),
  upsertWorkerJobSummary: vi.fn(),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/assertRateLimitApiSecret", () => ({
  assertRateLimitApiSecret: mocks.assertRateLimitApiSecret,
}));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));
vi.mock("../upsertWorkerJobSummary", () => ({
  upsertWorkerJobSummary: mocks.upsertWorkerJobSummary,
}));
vi.mock("../workerLaunch", () => ({
  requestWorkerLaunch: mocks.requestWorkerLaunch,
}));

describe("hookLabIdeaVariants.dispatchProviderJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_1");
  });

  it("creates the job and moves the variant to writing in one mutation", async () => {
    const variant = {
      _id: "variant_doc",
      id: "variant_1",
      status: "queued",
    };
    const providerJob = {
      _id: "provider_job_doc",
      attempt: 0,
      createdAt: "2026-07-12T12:00:00.000Z",
      id: "provider:variant_1",
      idempotencyKey: "owner_1:variant_1",
      inputSnapshotJson: JSON.stringify({ variantId: "variant_1" }),
      jobType: "hook-lab-idea-use",
      mediaJobIds: [],
      outputAssetIds: [],
      ownerId: "owner_1",
      progress: 0,
      providerJobIds: [],
      stage: "awaiting-provider",
      status: "queued",
      updatedAt: "2026-07-12T12:00:00.000Z",
    };
    const db = {
      get: vi.fn(async () => providerJob),
      insert: vi.fn(async () => "provider_job_doc"),
      patch: vi.fn(),
      query: vi.fn((table: string) => {
        const indexQuery = { eq: vi.fn(() => indexQuery) };
        const chain = {
          unique: vi.fn(async () =>
            table === "hookLabIdeaVariants" ? variant : null,
          ),
          withIndex: vi.fn(
            (_name: string, callback: (query: typeof indexQuery) => unknown) => {
              callback(indexQuery);
              return chain;
            },
          ),
        };

        return chain;
      }),
    };

    await expect(
      (dispatchProviderJob as unknown as ConvexFunction).handler(
        { db },
        {
          createdAt: "2026-07-12T12:00:00.000Z",
          id: "variant_1",
          idempotencyKey: "owner_1:variant_1",
          providerJobId: "provider:variant_1",
          secret: "rate-secret",
        },
      ),
    ).resolves.toEqual({ id: "provider:variant_1", status: "queued" });
    expect(db.patch).toHaveBeenCalledWith("variant_doc", {
      providerJobId: "provider:variant_1",
      status: "writing",
      updatedAt: "2026-07-12T12:00:00.000Z",
    });
    expect(mocks.requestWorkerLaunch).toHaveBeenCalledOnce();
  });
});
