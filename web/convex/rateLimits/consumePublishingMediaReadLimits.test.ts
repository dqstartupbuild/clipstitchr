import { beforeEach, describe, expect, it, vi } from "vitest";
import { consumePublishingMediaReadLimits } from "./consumePublishingMediaReadLimits";

const mocks = vi.hoisted(() => ({ limit: vi.fn() }));

vi.mock("../rateLimiter", () => ({
  rateLimiter: { limit: mocks.limit },
}));

const grantKey = "pmg_aaaaaaaaaaaaaaaaaaaaaa";
const quotaIdentity = "pmq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

describe("consumePublishingMediaReadLimits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("charges per-grant and shared request and byte limits before a read", async () => {
    const ctx = {} as Parameters<typeof consumePublishingMediaReadLimits>[0];

    await consumePublishingMediaReadLimits(ctx, {
      grantKey,
      quotaIdentity,
      readBytes: 4_096,
    });

    const key = `${quotaIdentity}:${grantKey}`;
    expect(mocks.limit.mock.calls).toEqual([
      [
        ctx,
        "publishingMediaReadRequestsByGrant",
        { key, throws: true },
      ],
      [
        ctx,
        "publishingMediaReadRequestsByQuota",
        { key: quotaIdentity, throws: true },
      ],
      [ctx, "publishingMediaReadRequestsGlobal", { throws: true }],
      [
        ctx,
        "publishingMediaReadBytesByGrant",
        { count: 4_096, key, throws: true },
      ],
      [
        ctx,
        "publishingMediaReadBytesByQuota",
        { count: 4_096, key: quotaIdentity, throws: true },
      ],
      [
        ctx,
        "publishingMediaReadBytesGlobal",
        { count: 4_096, throws: true },
      ],
    ]);
  });

  it("charges only request limits for HEAD", async () => {
    const ctx = {} as Parameters<typeof consumePublishingMediaReadLimits>[0];

    await consumePublishingMediaReadLimits(ctx, {
      grantKey,
      quotaIdentity,
      readBytes: 0,
    });

    expect(mocks.limit).toHaveBeenCalledTimes(3);
  });

  it("rejects malformed or oversized requests before consuming quota", async () => {
    const ctx = {} as Parameters<typeof consumePublishingMediaReadLimits>[0];

    await expect(
      consumePublishingMediaReadLimits(ctx, {
        grantKey: "raw-user-id",
        quotaIdentity,
        readBytes: 1,
      }),
    ).rejects.toThrow("rate-limit request is invalid");
    await expect(
      consumePublishingMediaReadLimits(ctx, {
        grantKey,
        quotaIdentity,
        readBytes: 1024 * 1024 * 1024 + 1,
      }),
    ).rejects.toThrow("rate-limit request is invalid");
    expect(mocks.limit).not.toHaveBeenCalled();
  });
});
