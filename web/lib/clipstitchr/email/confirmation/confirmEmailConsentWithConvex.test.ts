import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  mutation: vi.fn(),
}));

vi.mock(
  "@/lib/clipstitchr/server/convex/createConvexHttpClient",
  () => ({
    createConvexHttpClient: () => ({ mutation: mocks.mutation }),
  }),
);
vi.mock(
  "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret",
  () => ({ getRateLimitApiSecret: () => "rate-limit-secret" }),
);

import { confirmEmailConsentWithConvex } from "@/lib/clipstitchr/email/confirmation/confirmEmailConsentWithConvex";

describe("confirmEmailConsentWithConvex", () => {
  beforeEach(() => {
    mocks.mutation.mockReset();
  });

  it("sends only the verified reference, bounded client key, time, and secret", async () => {
    mocks.mutation.mockResolvedValue({ status: "confirmed" });
    const reference = {
      expiresAt: 1_783_958_400_000,
      tokenDigest: "d".repeat(64),
      tokenRecordId: "123e4567-e89b-42d3-a456-426614174000",
    };

    await expect(
      confirmEmailConsentWithConvex({
        clientKey: "c".repeat(64),
        confirmedAt: 1_783_900_000_000,
        reference,
      }),
    ).resolves.toEqual({ status: "confirmed" });
    expect(mocks.mutation).toHaveBeenCalledWith(expect.anything(), {
      ...reference,
      clientKey: "c".repeat(64),
      confirmedAt: 1_783_900_000_000,
      secret: "rate-limit-secret",
    });
  });
});
