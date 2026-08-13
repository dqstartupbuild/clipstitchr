import { beforeEach, describe, expect, it, vi } from "vitest";
import { consumeStudioReelProviderIntentRateLimits } from "./consumeStudioReelProviderIntentRateLimits";

const mocks = vi.hoisted(() => ({ limit: vi.fn() }));

vi.mock("../rateLimiter", () => ({
  rateLimiter: { limit: mocks.limit },
}));

describe("consumeStudioReelProviderIntentRateLimits", () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([
    ["dansugc", "studioReelDanSugcIntent", "studioReelDanSugcIntentGlobal"],
    ["gemini", "studioReelGeminiIntent", "studioReelGeminiIntentGlobal"],
    [
      "elevenlabs",
      "studioReelElevenLabsIntent",
      "studioReelElevenLabsIntentGlobal",
    ],
    ["render", "studioReelRenderIntent", "studioReelRenderIntentGlobal"],
  ] as const)(
    "consumes independent owner and global %s gates",
    async (provider, ownerGate, globalGate) => {
      await consumeStudioReelProviderIntentRateLimits(
        {} as never,
        "owner_123",
        provider,
        3,
      );

      expect(mocks.limit).toHaveBeenNthCalledWith(1, {}, ownerGate, {
        key: "owner_123",
        count: 3,
        throws: true,
      });
      expect(mocks.limit).toHaveBeenNthCalledWith(2, {}, globalGate, {
        count: 3,
        throws: true,
      });
    },
  );

  it("rejects unbounded provider intent counts before quota access", async () => {
    await expect(
      consumeStudioReelProviderIntentRateLimits(
        {} as never,
        "owner_123",
        "render",
        101,
      ),
    ).rejects.toThrow(/between 1 and 100/);
    expect(mocks.limit).not.toHaveBeenCalled();
  });
});
