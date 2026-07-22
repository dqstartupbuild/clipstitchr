import { describe, expect, it } from "vitest";
import { readHookLabCreativeBriefRequest } from "./readHookLabCreativeBriefRequest";

describe("readHookLabCreativeBriefRequest", () => {
  it("normalizes the globally selected product and source report", () => {
    expect(
      readHookLabCreativeBriefRequest({
        productId: " product_1 ",
        sourcePostId: " post_1 ",
      }),
    ).toEqual({
      productId: "product_1",
      sourcePostId: "post_1",
    });
  });

  it("rejects a request without a product", () => {
    expect(() =>
      readHookLabCreativeBriefRequest({
        sourcePostId: "post_1",
      }),
    ).toThrow("dashboard product picker");
  });
});
