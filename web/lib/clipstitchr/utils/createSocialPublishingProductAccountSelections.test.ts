import { describe, expect, it } from "vitest";
import { createSocialPublishingProductAccountSelections } from "@/lib/clipstitchr/utils/createSocialPublishingProductAccountSelections";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";

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
  const accounts: SocialPublishingSocialAccount[] = [
    {
      displayName: "Active",
      id: "account_10",
      isActive: true,
      needsReconnection: false,
      platform: "instagram",
      profileId: "profile_1",
      username: "active",
    },
    {
      displayName: "Reconnect",
      id: "account_20",
      isActive: true,
      needsReconnection: true,
      platform: "instagram",
      profileId: "profile_1",
      username: "reconnect",
    },
  ];

  it("indexes only available saved Zernio account ids by product", () => {
    expect(
      createSocialPublishingProductAccountSelections(
        [
          createProduct({
            id: "product_1",
            socialPublishingSocialAccountIds: ["account_10", "account_20"],
          }),
          createProduct({
            id: "product_2",
            socialPublishingSocialAccountIds: undefined,
          }),
        ],
        accounts,
      ),
    ).toEqual({
      product_1: ["account_10"],
      product_2: [],
    });
  });
});
