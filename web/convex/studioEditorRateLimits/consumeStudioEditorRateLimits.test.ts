import { beforeEach, describe, expect, it, vi } from "vitest";
import { consumeStudioEditorProjectWriteRateLimits } from "./consumeStudioEditorProjectWriteRateLimits";
import { consumeStudioEditorStaticReadRateLimits } from "./consumeStudioEditorStaticReadRateLimits";

const mocks = vi.hoisted(() => ({ limit: vi.fn() }));
vi.mock("../rateLimiter", () => ({ rateLimiter: { limit: mocks.limit } }));

describe("Studio editor rate limits", () => {
  beforeEach(() => vi.clearAllMocks());

  it("consumes per-owner and global write budgets", async () => {
    const ctx = {} as never;
    await consumeStudioEditorProjectWriteRateLimits(ctx, "owner_1");
    expect(mocks.limit).toHaveBeenNthCalledWith(
      1,
      ctx,
      "studioEditorProjectWrite",
      {
        key: "owner_1",
        throws: true,
      },
    );
    expect(mocks.limit).toHaveBeenNthCalledWith(
      2,
      ctx,
      "studioEditorProjectWriteGlobal",
      {
        throws: true,
      },
    );
  });

  it("consumes per-owner and global static-read budgets", async () => {
    const ctx = {} as never;
    await consumeStudioEditorStaticReadRateLimits(ctx, "owner_1");
    expect(mocks.limit).toHaveBeenNthCalledWith(
      1,
      ctx,
      "studioEditorStaticRead",
      {
        key: "owner_1",
        throws: true,
      },
    );
    expect(mocks.limit).toHaveBeenNthCalledWith(
      2,
      ctx,
      "studioEditorStaticReadGlobal",
      {
        throws: true,
      },
    );
  });
});
