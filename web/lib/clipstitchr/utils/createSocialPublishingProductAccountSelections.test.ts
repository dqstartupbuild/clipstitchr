import { describe, expect, it } from "vitest";
import { createSocialPublishingProductAccountSelections } from "@/lib/clipstitchr/utils/createSocialPublishingProductAccountSelections";
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

describe("createSocialPublishingProductAccountSelections", () => {
  it("indexes saved Zernio account ids by product", () => {
    expect(
      createSocialPublishingProductAccountSelections([
        createProduct({
          id: "product_1",
          socialPublishingSocialAccountIds: ["account_10", "account_20"],
        }),
        createProduct({
          id: "product_2",
          socialPublishingSocialAccountIds: undefined,
        }),
      ]),
    ).toEqual({
      product_1: ["account_10", "account_20"],
      product_2: [],
    });
  });
});
