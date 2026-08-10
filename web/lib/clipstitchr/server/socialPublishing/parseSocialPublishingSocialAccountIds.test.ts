import { describe, expect, it } from "vitest";
import { parseSocialPublishingSocialAccountIds } from "@/lib/clipstitchr/server/socialPublishing/parseSocialPublishingSocialAccountIds";

describe("parseSocialPublishingSocialAccountIds", () => {
  it("returns unique Zernio account IDs", () => {
    expect(
      parseSocialPublishingSocialAccountIds(
        '["account_1","account_2","account_2"]',
      ),
    ).toEqual(["account_1", "account_2"]);
  });

  it("allows empty account defaults to be resolved from the source product", () => {
    expect(parseSocialPublishingSocialAccountIds("[]")).toEqual([]);
  });
});
