import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { exchangeTikTokAuthorizationCode } from "./exchangeTikTokAuthorizationCode";

const originalClientKey = process.env.TIKTOK_CLIENT_KEY;
const originalClientSecret = process.env.TIKTOK_CLIENT_SECRET;

describe("exchangeTikTokAuthorizationCode", () => {
  beforeEach(() => {
    process.env.TIKTOK_CLIENT_KEY = "tiktok-client";
    process.env.TIKTOK_CLIENT_SECRET = "tiktok-secret";
  });

  afterEach(() => {
    process.env.TIKTOK_CLIENT_KEY = originalClientKey;
    process.env.TIKTOK_CLIENT_SECRET = originalClientSecret;
    vi.unstubAllGlobals();
  });

  it("loads only profile fields covered by user.info.basic", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({
          access_token: "access-token",
          expires_in: 86_400,
          open_id: "open-id-123456",
          refresh_expires_in: 2_592_000,
          refresh_token: "refresh-token",
          scope: "user.info.basic,video.publish",
        }),
      )
      .mockResolvedValueOnce(
        Response.json({
          data: {
            user: {
              avatar_url: "https://example.com/avatar.jpg",
              display_name: "Clip Creator",
              open_id: "open-id-123456",
            },
          },
          error: { code: "ok", message: "" },
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      exchangeTikTokAuthorizationCode({
        code: "oauth-code",
        redirectUri: "https://app.example.com/callback",
      }),
    ).resolves.toMatchObject({
      externalAccountId: "open-id-123456",
      platform: "tiktok",
      username: "Clip Creator",
    });

    const profileUrl = new URL(String(fetchMock.mock.calls[1]?.[0]));

    expect(profileUrl.searchParams.get("fields")).toBe(
      "open_id,avatar_url,display_name",
    );
    expect(profileUrl.searchParams.get("fields")).not.toContain("username");
  });
});
