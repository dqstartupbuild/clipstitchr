import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
}));

vi.mock(
  "@/lib/clipstitchr/server/convex/createConvexHttpClient",
  () => ({
    createConvexHttpClient: () => ({ query: mocks.query }),
  }),
);
vi.mock(
  "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret",
  () => ({ getRateLimitApiSecret: () => "rate-limit-secret" }),
);

import { inspectEmailConfirmationWithConvex } from "@/lib/clipstitchr/email/confirmation/inspectEmailConfirmationWithConvex";

describe("inspectEmailConfirmationWithConvex", () => {
  beforeEach(() => {
    mocks.query.mockReset();
  });

  it("sends only the verified reference, inspection time, and server secret", async () => {
    mocks.query.mockResolvedValue({ status: "ready" });
    const reference = {
      expiresAt: 1_783_958_400_000,
      tokenDigest: "d".repeat(64),
      tokenRecordId: "123e4567-e89b-42d3-a456-426614174000",
    };

    await expect(
      inspectEmailConfirmationWithConvex(reference, 1_783_900_000_000),
    ).resolves.toEqual({ status: "ready" });
    expect(mocks.query).toHaveBeenCalledWith(expect.anything(), {
      ...reference,
      inspectedAt: 1_783_900_000_000,
      secret: "rate-limit-secret",
    });
  });
});
