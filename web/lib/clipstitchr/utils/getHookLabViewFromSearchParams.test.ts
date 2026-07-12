import { describe, expect, it } from "vitest";
import { getHookLabViewFromSearchParams } from "@/lib/clipstitchr/utils/getHookLabViewFromSearchParams";

describe("getHookLabViewFromSearchParams", () => {
  it("defaults to Ideas and accepts the Review view", () => {
    expect(getHookLabViewFromSearchParams(new URLSearchParams())).toBe("ideas");
    expect(
      getHookLabViewFromSearchParams(new URLSearchParams("view=review")),
    ).toBe("review");
    expect(
      getHookLabViewFromSearchParams(new URLSearchParams("view=unknown")),
    ).toBe("ideas");
  });
});
