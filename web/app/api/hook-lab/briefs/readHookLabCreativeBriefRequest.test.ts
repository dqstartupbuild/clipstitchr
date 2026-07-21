import { describe, expect, it } from "vitest";
import { readHookLabCreativeBriefRequest } from "./readHookLabCreativeBriefRequest";

describe("readHookLabCreativeBriefRequest", () => {
  it("normalizes a supported destination request", () => {
    expect(
      readHookLabCreativeBriefRequest({
        destinationTool: "stitchr",
        hookTemplateId: " hook_1 ",
        productId: " product_1 ",
        sourcePostId: " post_1 ",
      }),
    ).toEqual({
      destinationTool: "stitchr",
      hookTemplateId: "hook_1",
      productId: "product_1",
      sourcePostId: "post_1",
    });
  });

  it("rejects an unknown destination", () => {
    expect(() =>
      readHookLabCreativeBriefRequest({
        destinationTool: "unknown",
        productId: "product_1",
        sourcePostId: "post_1",
      }),
    ).toThrow("Choose Clipr, Stitchr, or Swipr");
  });
});
