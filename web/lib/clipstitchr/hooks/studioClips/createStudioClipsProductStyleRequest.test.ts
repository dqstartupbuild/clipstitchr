import { describe, expect, it } from "vitest";
import { createStudioClipsProductStyleRequest } from "./createStudioClipsProductStyleRequest";

describe("createStudioClipsProductStyleRequest", () => {
  it("creates the strict Product-wide style request", () => {
    const request = createStudioClipsProductStyleRequest("product_1", {
      fontColorHex: "#FFFFFF",
      fontFamily: "TikTokSans-Regular",
      fontSizePx: 28,
      templateId: "minimal",
    });

    expect(request).toMatchObject({
      productId: "product_1",
      schemaVersion: "studio-clips-product-style-request-v1",
      style: { templateId: "minimal" },
    });
    expect(request.idempotencyKey).toMatch(/^product_style-/u);
  });
});
