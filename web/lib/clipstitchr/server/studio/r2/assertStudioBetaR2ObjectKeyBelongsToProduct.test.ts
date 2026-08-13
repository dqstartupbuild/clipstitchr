import { describe, expect, it } from "vitest";
import { assertStudioBetaR2ObjectKeyBelongsToProduct } from "./assertStudioBetaR2ObjectKeyBelongsToProduct";

describe("assertStudioBetaR2ObjectKeyBelongsToProduct", () => {
  it("accepts a versioned Studio object carrying the requested Product", () => {
    expect(() =>
      assertStudioBetaR2ObjectKeyBelongsToProduct(
        "users/user_123/studio/v1/project/product_123/project_1/file.json",
        "user_123",
        "product_123",
      ),
    ).not.toThrow();
  });

  it("rejects another Product under the same owner", () => {
    expect(() =>
      assertStudioBetaR2ObjectKeyBelongsToProduct(
        "users/user_123/studio/v1/project/product_456/project_1/file.json",
        "user_123",
        "product_123",
      ),
    ).toThrow("another Product");
  });

  it("rejects a legacy key without a Product segment", () => {
    expect(() =>
      assertStudioBetaR2ObjectKeyBelongsToProduct(
        "users/user_123/studio/v1/project/project_1/file.json",
        "user_123",
        "product_123",
      ),
    ).toThrow("another Product");
  });
});
