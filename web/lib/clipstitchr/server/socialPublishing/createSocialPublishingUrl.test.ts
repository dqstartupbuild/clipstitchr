import { describe, expect, it } from "vitest";
import { createSocialPublishingUrl } from "@/lib/clipstitchr/server/socialPublishing/createSocialPublishingUrl";

describe("createSocialPublishingUrl", () => {
  it("keeps the Zernio API path when joining a versioned endpoint", () => {
    expect(createSocialPublishingUrl("/v1/accounts").toString()).toBe(
      "https://zernio.com/api/v1/accounts",
    );
  });

  it("appends query parameters to the Zernio API endpoint", () => {
    expect(
      createSocialPublishingUrl(
        "/v1/analytics",
        new URLSearchParams({ limit: "100", page: "2" }),
      ).toString(),
    ).toBe("https://zernio.com/api/v1/analytics?limit=100&page=2");
  });
});
