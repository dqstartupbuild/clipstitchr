import { beforeEach, describe, expect, it, vi } from "vitest";
import { claimSocialStatusCheck } from "./claimSocialStatusCheck";

type ConvexFunction = {
  handler: (ctx: unknown, args: unknown) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({
  enqueueSocialTargetProviderJob: vi.fn(),
  internalMutation: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({
  internalMutation: mocks.internalMutation,
}));
vi.mock("./enqueueSocialTargetProviderJob", () => ({
  enqueueSocialTargetProviderJob: mocks.enqueueSocialTargetProviderJob,
}));

describe("claimSocialStatusCheck", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enqueueSocialTargetProviderJob.mockResolvedValue({ id: "job_1" });
  });

  it("reconciles already-started work without requiring active billing", async () => {
    const target = {
      _id: "target_doc",
      id: "target_1",
      ownerId: "owner_1",
      postId: "post_1",
      status: "status_check",
      nextStatusCheckAt: "2026-08-01T00:00:00.000Z",
    };
    const index = { eq: vi.fn(() => index) };
    const chain = {
      unique: vi.fn(async () => target),
      withIndex: vi.fn(
        (_name: string, callback: (value: typeof index) => void) => {
          callback(index);
          return chain;
        },
      ),
    };
    const ctx = {
      db: {
        patch: vi.fn(),
        query: vi.fn(() => chain),
      },
    };
    const handler = (claimSocialStatusCheck as unknown as ConvexFunction)
      .handler;

    await expect(
      handler(ctx, {
        targetId: "target_1",
        now: "2026-08-01T00:01:00.000Z",
      }),
    ).resolves.toBe("job_1");
    expect(mocks.enqueueSocialTargetProviderJob).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({ jobType: "social-status-reconcile" }),
    );
  });
});
