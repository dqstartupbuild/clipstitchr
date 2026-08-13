import { describe, expect, it } from "vitest";
import { createStudioBetaR2ObjectKey } from "./createStudioBetaR2ObjectKey";

describe("createStudioBetaR2ObjectKey", () => {
  it("binds the object path to its owner, kind, Product, and record", () => {
    expect(
      createStudioBetaR2ObjectKey({
        contentType: "video/mp4",
        kind: "media-source",
        productId: "product_123",
        recordId: "clip_123",
        userId: "user_123",
      }),
    ).toMatch(
      /^users\/user_123\/studio\/v1\/media-source\/product_123\/clip_123\/[0-9a-f-]+\.mp4$/u,
    );
  });
});
