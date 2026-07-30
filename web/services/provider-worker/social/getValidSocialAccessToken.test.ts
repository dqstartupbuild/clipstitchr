import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getValidSocialAccessToken } from "./getValidSocialAccessToken";

const mocks = vi.hoisted(() => ({
  decryptSocialToken: vi.fn(),
  encryptSocialToken: vi.fn(),
  refreshInstagramAccessToken: vi.fn(),
  refreshTikTokAccessToken: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/server/social/decryptSocialToken", () => ({
  decryptSocialToken: mocks.decryptSocialToken,
}));

vi.mock("@/lib/clipstitchr/server/social/encryptSocialToken", () => ({
  encryptSocialToken: mocks.encryptSocialToken,
}));

vi.mock("./refreshTikTokAccessToken", () => ({
  refreshTikTokAccessToken: mocks.refreshTikTokAccessToken,
}));

vi.mock("./refreshInstagramAccessToken", () => ({
  refreshInstagramAccessToken: mocks.refreshInstagramAccessToken,
}));

describe("getValidSocialAccessToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime("2026-08-01T00:00:00.000Z");
    mocks.decryptSocialToken.mockImplementation((ciphertext: string) =>
      ciphertext === "refresh_cipher" ? "old_refresh" : "old_access",
    );
    mocks.encryptSocialToken.mockImplementation((token: string) => ({
      ciphertext: `encrypted:${token}`,
      version: 2,
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("persists TikTok's rotated refresh token under a refresh lock", async () => {
    const mutation = vi
      .fn()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(undefined);
    mocks.refreshTikTokAccessToken.mockResolvedValue({
      access_token: "new_access",
      refresh_token: "rotated_refresh",
      expires_in: 3600,
      refresh_expires_in: 7200,
    });

    await expect(
      getValidSocialAccessToken({
        account: {
          accessTokenCiphertext: "access_cipher",
          accessTokenExpiresAt: "2026-08-01T00:01:00.000Z",
          id: "account_1",
          ownerId: "owner_1",
          platform: "tiktok",
          refreshTokenCiphertext: "refresh_cipher",
          tokenEncryptionVersion: 1,
        },
        client: { mutation } as never,
        providerWorkerSecret: "worker_secret",
      }),
    ).resolves.toBe("new_access");

    expect(mocks.refreshTikTokAccessToken).toHaveBeenCalledWith("old_refresh");
    expect(mutation.mock.calls[1][1]).toMatchObject({
      accessTokenCiphertext: "encrypted:new_access",
      refreshTokenCiphertext: "encrypted:rotated_refresh",
      tokenEncryptionVersion: 2,
    });
  });

  it("does not refresh when another worker owns the lock", async () => {
    const mutation = vi.fn().mockResolvedValue(false);

    await expect(
      getValidSocialAccessToken({
        account: {
          accessTokenCiphertext: "access_cipher",
          accessTokenExpiresAt: "2026-08-01T00:01:00.000Z",
          id: "account_1",
          ownerId: "owner_1",
          platform: "tiktok",
          refreshTokenCiphertext: "refresh_cipher",
          tokenEncryptionVersion: 1,
        },
        client: { mutation } as never,
        providerWorkerSecret: "worker_secret",
      }),
    ).rejects.toThrow("Another worker");
    expect(mocks.refreshTikTokAccessToken).not.toHaveBeenCalled();
  });

  it("releases its refresh lock when the provider refresh fails", async () => {
    const mutation = vi
      .fn()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true);
    mocks.refreshTikTokAccessToken.mockRejectedValue(
      new Error("TikTok refresh failed"),
    );

    await expect(
      getValidSocialAccessToken({
        account: {
          accessTokenCiphertext: "access_cipher",
          accessTokenExpiresAt: "2026-08-01T00:01:00.000Z",
          id: "account_1",
          ownerId: "owner_1",
          platform: "tiktok",
          refreshTokenCiphertext: "refresh_cipher",
          tokenEncryptionVersion: 1,
        },
        client: { mutation } as never,
        providerWorkerSecret: "worker_secret",
      }),
    ).rejects.toThrow("TikTok refresh failed");

    expect(mutation).toHaveBeenCalledTimes(2);
    expect(mutation.mock.calls[1]?.[1]).toMatchObject({
      id: "account_1",
      lockId: expect.stringMatching(/^social-token-refresh:/),
      ownerId: "owner_1",
      secret: "worker_secret",
    });
  });
});
