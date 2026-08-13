import { beforeEach, describe, expect, it, vi } from "vitest";
import { consumeStudioClipsCostStageRateLimits } from "./consumeStudioClipsCostStageRateLimits";
import { consumeStudioClipsTaskCreateRateLimits } from "./consumeStudioClipsTaskCreateRateLimits";

const mocks = vi.hoisted(() => ({ limit: vi.fn() }));
vi.mock("../rateLimiter", () => ({ rateLimiter: { limit: mocks.limit } }));

describe("Studio Clips rate-limit consumers", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reserves owner and global task capacity before creation", async () => {
    const ctx = {} as never;
    await consumeStudioClipsTaskCreateRateLimits(ctx, "owner_1");
    expect(mocks.limit).toHaveBeenNthCalledWith(1, ctx, "studioClipsTaskCreate", {
      key: "owner_1",
      throws: true,
    });
    expect(mocks.limit).toHaveBeenNthCalledWith(
      2,
      ctx,
      "studioClipsTaskCreateGlobal",
      { throws: true },
    );
  });

  it("reserves owner and global capacity before an expensive worker stage", async () => {
    const ctx = {} as never;
    await consumeStudioClipsCostStageRateLimits(ctx, "owner_1");
    expect(mocks.limit).toHaveBeenNthCalledWith(1, ctx, "studioClipsCostStage", {
      key: "owner_1",
      throws: true,
    });
    expect(mocks.limit).toHaveBeenNthCalledWith(
      2,
      ctx,
      "studioClipsCostStageGlobal",
      { throws: true },
    );
  });
});
