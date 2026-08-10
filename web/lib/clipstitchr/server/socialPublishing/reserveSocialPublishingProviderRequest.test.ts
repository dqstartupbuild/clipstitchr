import { beforeEach, describe, expect, it, vi } from "vitest";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { reserveSocialPublishingProviderRequest } from "@/lib/clipstitchr/server/socialPublishing/reserveSocialPublishingProviderRequest";
import { waitForMilliseconds } from "@/lib/clipstitchr/utils/waitForMilliseconds";

const mutation = vi.fn();

vi.mock("@/lib/clipstitchr/server/convex/createConvexHttpClient", () => ({
  createConvexHttpClient: vi.fn(() => ({ mutation })),
}));

vi.mock("@/lib/clipstitchr/server/socialPublishing/createSocialPublishingProviderRateLimitKey", () => ({
  createSocialPublishingProviderRateLimitKey: vi.fn(() => "hashed_key"),
}));

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: vi.fn(() => "rate_limit_secret"),
}));

vi.mock("@/lib/clipstitchr/utils/waitForMilliseconds", () => ({
  waitForMilliseconds: vi.fn(),
}));

describe("reserveSocialPublishingProviderRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("waits for reserved capacity before returning", async () => {
    mutation.mockResolvedValue({ ok: true, retryAfter: 125 });

    await reserveSocialPublishingProviderRequest("provider_key");

    expect(createConvexHttpClient).toHaveBeenCalledOnce();
    expect(mutation).toHaveBeenCalledWith(
      expect.anything(),
      {
        key: "hashed_key",
        secret: "rate_limit_secret",
      },
    );
    expect(waitForMilliseconds).toHaveBeenCalledWith(125);
  });

  it("checks again when the reservation queue is temporarily full", async () => {
    mutation
      .mockResolvedValueOnce({ ok: false, retryAfter: 250 })
      .mockResolvedValueOnce({ ok: true });

    await reserveSocialPublishingProviderRequest("provider_key");

    expect(mutation).toHaveBeenCalledTimes(2);
    expect(waitForMilliseconds).toHaveBeenCalledWith(250);
  });
});
