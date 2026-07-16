import { describe, expect, it } from "vitest";
import { getPlanKeyFromSearchParam } from "@/lib/clipstitchr/billing/getPlanKeyFromSearchParam";

describe("getPlanKeyFromSearchParam", () => {
  it.each(["starter", "pro", "agency"] as const)(
    "accepts the canonical %s plan",
    (planKey) => {
      expect(getPlanKeyFromSearchParam(planKey)).toBe(planKey);
    },
  );

  it("rejects missing, unknown, and repeated plan values", () => {
    expect(getPlanKeyFromSearchParam(undefined)).toBeUndefined();
    expect(getPlanKeyFromSearchParam("studio")).toBeUndefined();
    expect(getPlanKeyFromSearchParam(["pro", "agency"])).toBeUndefined();
  });
});
