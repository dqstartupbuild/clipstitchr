import { afterEach, describe, expect, it } from "vitest";
import { getSocialOAuthRedirectUri } from "./getSocialOAuthRedirectUri";

const originalTikTokRedirectUri = process.env.TIKTOK_REDIRECT_URI;

afterEach(() => {
  if (originalTikTokRedirectUri === undefined) {
    delete process.env.TIKTOK_REDIRECT_URI;
  } else {
    process.env.TIKTOK_REDIRECT_URI = originalTikTokRedirectUri;
  }
});

describe("getSocialOAuthRedirectUri", () => {
  it("returns the exact configured HTTPS redirect URI", () => {
    process.env.TIKTOK_REDIRECT_URI =
      "https://clipstitchr.com/api/social/oauth/tiktok/callback";

    expect(getSocialOAuthRedirectUri("tiktok")).toBe(
      "https://clipstitchr.com/api/social/oauth/tiktok/callback",
    );
  });

  it("allows HTTP only for localhost development", () => {
    process.env.TIKTOK_REDIRECT_URI =
      "http://localhost:3000/api/social/oauth/tiktok/callback";

    expect(getSocialOAuthRedirectUri("tiktok")).toBe(
      "http://localhost:3000/api/social/oauth/tiktok/callback",
    );

    process.env.TIKTOK_REDIRECT_URI =
      "ftp://localhost/api/social/oauth/tiktok/callback";
    expect(() => getSocialOAuthRedirectUri("tiktok")).toThrow("use HTTPS");

    process.env.TIKTOK_REDIRECT_URI =
      "http://clipstitchr.com/api/social/oauth/tiktok/callback";
    expect(() => getSocialOAuthRedirectUri("tiktok")).toThrow("use HTTPS");
  });
});
