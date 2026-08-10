import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { SocialPublishingProductAccountConfigRow } from "@/app/_components/settings/SocialPublishingProductAccountConfigRow";
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

describe("SocialPublishingProductAccountConfigRow", () => {
  it("shows a product's saved linked account count and account choices", () => {
    const markup = renderToStaticMarkup(
      <SocialPublishingProductAccountConfigRow
        accounts={[
          {
            displayName: "Launch Kit",
            id: "account_10",
            isActive: true,
            needsReconnection: false,
            platform: "tiktok",
            profileId: "profile_1",
            tiktokCanPostMore: true,
            tiktokPrivacyLevels: [
              { label: "Everyone", value: "PUBLIC_TO_EVERYONE" },
            ],
            username: "launchkit",
          },
          {
            displayName: "Launch Kit",
            id: "account_20",
            isActive: true,
            needsReconnection: false,
            platform: "youtube",
            profileId: "profile_1",
            username: "launchkit",
          },
        ]}
        disabled={false}
        isSaving={false}
        product={createProduct()}
        selectedAccountIds={["account_20"]}
        onAccountChange={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    expect(markup).toContain("Launch Kit");
    expect(markup).toContain("1 account linked");
    expect(markup).toContain("launchkit");
    expect(markup).toContain("YouTube");
    expect(markup).toContain("Save");
  });
});
