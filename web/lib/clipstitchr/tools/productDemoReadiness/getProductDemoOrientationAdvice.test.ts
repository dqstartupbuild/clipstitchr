import { describe, expect, it } from "vitest";
import type { LocalVideoInspection } from "@/lib/clipstitchr/tools/localVideoInspection/LocalVideoInspection";
import { getProductDemoOrientationAdvice } from "@/lib/clipstitchr/tools/productDemoReadiness/getProductDemoOrientationAdvice";

describe("getProductDemoOrientationAdvice", () => {
  it("explains the existing background-layout path for wide demos", () => {
    expect(
      getProductDemoOrientationAdvice({
        aspectRatio: 16 / 9,
      } as LocalVideoInspection),
    ).toContain("not an automatic failure");
  });

  it("does not add wide-demo advice to a portrait source", () => {
    expect(
      getProductDemoOrientationAdvice({
        aspectRatio: 9 / 16,
      } as LocalVideoInspection),
    ).toBeNull();
  });
});
