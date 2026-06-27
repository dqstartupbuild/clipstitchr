import { describe, expect, it } from "vitest";
import { parsePostBridgeSocialAccountIds } from "@/lib/clipstitchr/server/postBridge/parsePostBridgeSocialAccountIds";

describe("parsePostBridgeSocialAccountIds", () => {
  it("returns unique numeric account IDs", () => {
    expect(parsePostBridgeSocialAccountIds("[1,2,2]")).toEqual([1, 2]);
  });

  it("allows empty account defaults to be resolved from the source product", () => {
    expect(parsePostBridgeSocialAccountIds("[]")).toEqual([]);
  });
});
