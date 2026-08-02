import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const mocks = vi.hoisted(() => ({
  assertInHouseSocialPublishingEnabled: vi.fn(),
  createAuthenticatedConvexHttpClient: vi.fn(),
  createSocialSecretHash: vi.fn(),
  encryptSocialToken: vi.fn(),
  exchangeSocialAuthorizationCode: vi.fn(),
  getAuthenticatedConvexToken: vi.fn(),
  getAuthenticatedUserId: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/server/getAuthenticatedUserId", () => ({
  getAuthenticatedUserId: mocks.getAuthenticatedUserId,
}));
vi.mock("@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken", () => ({
  getAuthenticatedConvexToken: mocks.getAuthenticatedConvexToken,
}));
vi.mock(
  "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient",
  () => ({
    createAuthenticatedConvexHttpClient:
      mocks.createAuthenticatedConvexHttpClient,
  }),
);
vi.mock("@/lib/clipstitchr/server/social/createSocialSecretHash", () => ({
  createSocialSecretHash: mocks.createSocialSecretHash,
}));
vi.mock("@/lib/clipstitchr/server/social/encryptSocialToken", () => ({
  encryptSocialToken: mocks.encryptSocialToken,
}));
vi.mock(
  "@/lib/clipstitchr/server/social/exchangeSocialAuthorizationCode",
  () => ({
    exchangeSocialAuthorizationCode: mocks.exchangeSocialAuthorizationCode,
  }),
);
vi.mock(
  "@/lib/clipstitchr/social/assertInHouseSocialPublishingEnabled",
  () => ({
    assertInHouseSocialPublishingEnabled:
      mocks.assertInHouseSocialPublishingEnabled,
  }),
);

describe("GET /api/social/oauth/[platform]/callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("owner_1");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex_token");
    mocks.createSocialSecretHash.mockReturnValue("state_hash");
    mocks.encryptSocialToken.mockReturnValue({
      ciphertext: "encrypted",
      version: 2,
    });
    mocks.exchangeSocialAuthorizationCode.mockResolvedValue({
      accessToken: "access-token",
      externalAccountId: "tiktok-user-1",
      platform: "tiktok",
      refreshToken: "refresh-token",
      scopes: ["user.info.basic", "video.publish"],
      username: "creator",
    });
  });

  it("uses the owner-bound state's exact redirect URI before saving tokens", async () => {
    const mutation = vi
      .fn()
      .mockResolvedValueOnce({
        redirectUri:
          "https://clipstitchr.com/api/social/oauth/tiktok/callback",
        returnPath: "/dashboard/settings",
      })
      .mockResolvedValueOnce(undefined);
    mocks.createAuthenticatedConvexHttpClient.mockReturnValue({ mutation });

    const response = await GET(
      new Request(
        "https://clipstitchr.com/api/social/oauth/tiktok/callback?state=raw-state&code=authorization-code",
      ),
      { params: Promise.resolve({ platform: "tiktok" }) },
    );

    expect(mutation.mock.calls[0]?.[1]).toMatchObject({
      platform: "tiktok",
      stateHash: "state_hash",
    });
    expect(mocks.exchangeSocialAuthorizationCode).toHaveBeenCalledWith({
      code: "authorization-code",
      platform: "tiktok",
      redirectUri:
        "https://clipstitchr.com/api/social/oauth/tiktok/callback",
    });
    expect(mutation.mock.calls[1]?.[1]).toMatchObject({
      accessTokenCiphertext: "encrypted",
      externalAccountId: "tiktok-user-1",
      refreshTokenCiphertext: "encrypted",
      tokenEncryptionVersion: 2,
    });
    expect(response.headers.get("location")).toBe(
      "https://clipstitchr.com/dashboard/settings?social=connected&platform=tiktok",
    );
  });

  it("does not exchange a code when the owner-bound state is rejected", async () => {
    const mutation = vi
      .fn()
      .mockRejectedValue(new Error("This connection link expired."));
    mocks.createAuthenticatedConvexHttpClient.mockReturnValue({ mutation });

    const response = await GET(
      new Request(
        "https://clipstitchr.com/api/social/oauth/tiktok/callback?state=wrong-owner-state&code=authorization-code",
      ),
      { params: Promise.resolve({ platform: "tiktok" }) },
    );

    expect(mocks.exchangeSocialAuthorizationCode).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe(
      "https://clipstitchr.com/dashboard/settings?social=connection_failed&platform=tiktok",
    );
  });
});
