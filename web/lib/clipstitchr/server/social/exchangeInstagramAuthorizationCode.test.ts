import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { exchangeInstagramAuthorizationCode } from "./exchangeInstagramAuthorizationCode";

const originalClientId = process.env.INSTAGRAM_CLIENT_ID;
const originalClientSecret = process.env.INSTAGRAM_CLIENT_SECRET;

function response(body: unknown) {
  return Response.json(body);
}

describe("exchangeInstagramAuthorizationCode", () => {
  beforeEach(() => {
    process.env.INSTAGRAM_CLIENT_ID = "instagram-client";
    process.env.INSTAGRAM_CLIENT_SECRET = "instagram-secret";
  });

  afterEach(() => {
    process.env.INSTAGRAM_CLIENT_ID = originalClientId;
    process.env.INSTAGRAM_CLIENT_SECRET = originalClientSecret;
    vi.unstubAllGlobals();
  });

  it("returns only a professional Instagram account profile", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        response({
          access_token: "short-token",
          permissions: "instagram_business_basic,instagram_business_content_publish",
          user_id: 123,
        }),
      )
      .mockResolvedValueOnce(
        response({ access_token: "long-token", expires_in: 5_184_000 }),
      )
      .mockResolvedValueOnce(
        response({
          account_type: "MEDIA_CREATOR",
          id: "ig_123",
          name: "Creator Name",
          username: "creator",
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      exchangeInstagramAuthorizationCode({
        code: "oauth-code",
        redirectUri: "https://app.example.com/callback",
      }),
    ).resolves.toMatchObject({
      accessToken: "long-token",
      accountType: "MEDIA_CREATOR",
      externalAccountId: "ig_123",
      platform: "instagram",
      username: "creator",
    });
    const tokenRequest = fetchMock.mock.calls[0]?.[1]?.body;

    expect(tokenRequest).toBeInstanceOf(FormData);
    expect(Object.fromEntries((tokenRequest as FormData).entries())).toEqual({
      client_id: "instagram-client",
      client_secret: "instagram-secret",
      code: "oauth-code",
      grant_type: "authorization_code",
      redirect_uri: "https://app.example.com/callback",
    });
    expect(String(fetchMock.mock.calls[2][0])).toContain(
      "graph.instagram.com/v25.0/me",
    );
  });

  it("rejects a personal Instagram account", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          response({ access_token: "short-token", user_id: 123 }),
        )
        .mockResolvedValueOnce(
          response({ access_token: "long-token", expires_in: 5_184_000 }),
        )
        .mockResolvedValueOnce(
          response({
            account_type: "PERSONAL",
            id: "ig_123",
            username: "creator",
          }),
        ),
    );

    await expect(
      exchangeInstagramAuthorizationCode({
        code: "oauth-code",
        redirectUri: "https://app.example.com/callback",
      }),
    ).rejects.toThrow("professional account");
  });
});
