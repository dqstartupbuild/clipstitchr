import { describe, expect, it } from "vitest";
import { filterSupportedPostBridgeAccounts } from "@/lib/clipstitchr/server/postBridge/filterSupportedPostBridgeAccounts";

describe("filterSupportedPostBridgeAccounts", () => {
  it("keeps only TikTok, Instagram, and YouTube accounts", () => {
    expect(
      filterSupportedPostBridgeAccounts([
        { id: 1, platform: "tiktok", username: "clipstitchr" },
        { id: 2, platform: "twitter", username: "clipstitchr" },
        { id: 3, platform: "instagram", username: "clipstitchr.ig" },
        { id: 4, platform: "youtube", username: "clipstitchr shorts" },
      ]),
    ).toEqual([
      { id: 1, platform: "tiktok", username: "clipstitchr" },
      { id: 3, platform: "instagram", username: "clipstitchr.ig" },
      { id: 4, platform: "youtube", username: "clipstitchr shorts" },
    ]);
  });
});
