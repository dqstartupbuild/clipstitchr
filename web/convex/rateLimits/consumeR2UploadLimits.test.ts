import { beforeEach, describe, expect, it, vi } from "vitest";
import { consumeR2UploadLimits } from "./consumeR2UploadLimits";

const mocks = vi.hoisted(() => ({ limit: vi.fn() }));

vi.mock("../rateLimiter", () => ({
  rateLimiter: { limit: mocks.limit },
}));

describe("consumeR2UploadLimits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("charges a multi-object upload to unchanged user caps and shared global caps", async () => {
    const ctx = {} as Parameters<typeof consumeR2UploadLimits>[0];

    await consumeR2UploadLimits(ctx, {
      objectCount: 3,
      ownerId: "user_123",
      totalBytes: 6_000,
    });

    expect(mocks.limit.mock.calls).toEqual([
      [ctx, "r2UploadUrl", { count: 3, key: "user_123", throws: true }],
      [ctx, "r2UploadUrlGlobal", { count: 3, throws: true }],
      [ctx, "r2UploadBytes", { count: 6_000, key: "user_123", throws: true }],
      [ctx, "r2UploadBytesGlobal", { count: 6_000, throws: true }],
      [
        ctx,
        "r2UploadBytesMonthly",
        { count: 6_000, key: "user_123", throws: true },
      ],
      [ctx, "r2UploadBytesMonthlyGlobal", { count: 6_000, throws: true }],
    ]);
  });
});
