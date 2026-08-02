import { describe, expect, it } from "vitest";
import { getSelectedPostBridgeAccounts } from "@/lib/clipstitchr/server/postBridge/getSelectedPostBridgeAccounts";
import type { PostBridgeSocialAccount } from "@/lib/clipstitchr/types/PostBridgeSocialAccount";

const accounts: PostBridgeSocialAccount[] = [
  { id: 1, platform: "tiktok", username: "clipstitchr" },
  { id: 2, platform: "instagram", username: "clipstitchr.ig" },
];

describe("getSelectedPostBridgeAccounts", () => {
  it("returns matching connected accounts", () => {
    expect(getSelectedPostBridgeAccounts(accounts, [2])).toEqual([
      accounts[1],
    ]);
  });

  it("throws when a requested account is unavailable", () => {
    expect(() => getSelectedPostBridgeAccounts(accounts, [3])).toThrow(
      "Choose connected accounts before scheduling.",
    );
  });
});
