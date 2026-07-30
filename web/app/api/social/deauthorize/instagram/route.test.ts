import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({
  createConvexHttpClient: vi.fn(),
  encryptSocialToken: vi.fn(),
  readInstagramSignedRequestFromRequest: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/server/convex/createConvexHttpClient", () => ({
  createConvexHttpClient: mocks.createConvexHttpClient,
}));
vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));
vi.mock("@/lib/clipstitchr/server/social/encryptSocialToken", () => ({
  encryptSocialToken: mocks.encryptSocialToken,
}));
vi.mock(
  "@/lib/clipstitchr/server/social/readInstagramSignedRequestFromRequest",
  () => ({
    readInstagramSignedRequestFromRequest:
      mocks.readInstagramSignedRequestFromRequest,
  }),
);

describe("POST /api/social/deauthorize/instagram", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.encryptSocialToken.mockReturnValue({
      ciphertext: "redacted-token",
      version: 3,
    });
    mocks.readInstagramSignedRequestFromRequest.mockResolvedValue({
      user_id: "instagram-account-1",
    });
  });

  it("revokes the connection without starting a data-deletion request", async () => {
    const mutation = vi.fn().mockResolvedValue(undefined);
    mocks.createConvexHttpClient.mockReturnValue({ mutation });
    const response = await POST(
      new Request("https://clipstitchr.com/api/social/deauthorize/instagram", {
        method: "POST",
        body: "signed_request=signed-request",
      }),
    );

    expect(response.status).toBe(200);
    expect(mutation).toHaveBeenCalledTimes(2);
    expect(mutation.mock.calls[1]?.[1]).toMatchObject({
      platform: "instagram",
      externalAccountId: "instagram-account-1",
      redactedAccessTokenCiphertext: "redacted-token",
      tokenEncryptionVersion: 3,
    });
    await expect(response.json()).resolves.toEqual({ received: true });
  });
});
