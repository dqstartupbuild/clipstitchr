import { describe, expect, it } from "vitest";
import { isPublicToolGateVisitorKey } from "@/lib/clipstitchr/tools/catalog/rollout/isPublicToolGateVisitorKey";

describe("isPublicToolGateVisitorKey", () => {
  it.each([
    "550e8400-e29b-41d4-a716-446655440000",
    "550E8400-E29B-41D4-A716-446655440000",
  ])("accepts canonical version-four UUID %s", (value) => {
    expect(isPublicToolGateVisitorKey(value)).toBe(true);
  });

  it.each([
    undefined,
    "",
    "550e8400-e29b-11d4-a716-446655440000",
    "550e8400e29b41d4a716446655440000",
    " visitor-key ",
  ])("rejects invalid visitor key %s", (value) => {
    expect(isPublicToolGateVisitorKey(value)).toBe(false);
  });
});
