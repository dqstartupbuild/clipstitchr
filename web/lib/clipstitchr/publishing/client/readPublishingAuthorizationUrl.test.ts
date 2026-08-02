import { describe, expect, it } from "vitest";
import { readPublishingAuthorizationUrl } from "@/lib/clipstitchr/publishing/client/readPublishingAuthorizationUrl";

const origin = "https://clipstitchr.com";

describe("readPublishingAuthorizationUrl", () => {
  it("accepts exact TikTok and Instagram authorization origins", () => {
    expect(
      readPublishingAuthorizationUrl(
        "tiktok",
        "https://www.tiktok.com/v2/auth/authorize/?client_key=key&state=state-123&redirect_uri=https%3A%2F%2Fclipstitchr.com%2Fapi%2Fpublishing%2Foauth%2Ftiktok%2Fcallback",
        origin,
      ),
    ).toContain("www.tiktok.com/v2/auth/authorize");
    expect(
      readPublishingAuthorizationUrl(
        "instagram",
        "https://www.facebook.com/v24.0/dialog/oauth?client_id=key&state=state-123&redirect_uri=https%3A%2F%2Fclipstitchr.com%2Fapi%2Fpublishing%2Foauth%2Finstagram%2Fcallback",
        origin,
      ),
    ).toContain("www.facebook.com/v24.0/dialog/oauth");
  });

  it("rejects lookalike hosts, provider mixing, and callback origin changes", () => {
    expect(() =>
      readPublishingAuthorizationUrl(
        "tiktok",
        "https://www.tiktok.com.attacker.invalid/v2/auth/authorize/?client_key=key&state=state-123&redirect_uri=https%3A%2F%2Fclipstitchr.com%2Fapi%2Fpublishing%2Foauth%2Ftiktok%2Fcallback",
        origin,
      ),
    ).toThrow("unsafe connection link");
    expect(() =>
      readPublishingAuthorizationUrl(
        "instagram",
        "https://www.tiktok.com/v2/auth/authorize/?client_key=key&state=state-123&redirect_uri=https%3A%2F%2Fclipstitchr.com%2Fapi%2Fpublishing%2Foauth%2Finstagram%2Fcallback",
        origin,
      ),
    ).toThrow("unsafe connection link");
    expect(() =>
      readPublishingAuthorizationUrl(
        "instagram",
        "https://www.facebook.com/v24.0/dialog/oauth?client_id=key&state=state-123&redirect_uri=https%3A%2F%2Fevil.invalid%2Fapi%2Fpublishing%2Foauth%2Finstagram%2Fcallback",
        origin,
      ),
    ).toThrow("unsafe connection link");
  });
});
