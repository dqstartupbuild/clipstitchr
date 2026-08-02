import { describe, expect, it } from "vitest";
import { createPostBridgeProductAccountSelections } from "@/lib/clipstitchr/utils/createPostBridgeProductAccountSelections";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

function createProduct(
  overrides: Partial<ProductProfile> = {},
): ProductProfile {
  return {
    audienceDetails: "Creators",
    createdAt: "2026-07-09T00:00:00.000Z",
    id: "product_1",
    inferredPainPoints: [],
    name: "Launch Kit",
    productDetails: "Launch faster",
    updatedAt: "2026-07-09T00:00:00.000Z",
    ...overrides,
  };
}

describe("createPostBridgeProductAccountSelections", () => {
  it("indexes saved Post Bridge account ids by product", () => {
    expect(
      createPostBridgeProductAccountSelections([
        createProduct({
          id: "product_1",
          postBridgeSocialAccountIds: [10, 20],
        }),
        createProduct({
          id: "product_2",
          postBridgeSocialAccountIds: undefined,
        }),
      ]),
    ).toEqual({
      product_1: [10, 20],
      product_2: [],
    });
  });
});
