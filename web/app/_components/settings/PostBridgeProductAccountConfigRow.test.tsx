import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { PostBridgeProductAccountConfigRow } from "@/app/_components/settings/PostBridgeProductAccountConfigRow";
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

describe("PostBridgeProductAccountConfigRow", () => {
  it("shows a product's saved linked account count and account choices", () => {
    const markup = renderToStaticMarkup(
      <PostBridgeProductAccountConfigRow
        accounts={[
          { id: 10, platform: "tiktok", username: "launchkit" },
          { id: 20, platform: "youtube", username: "launchkit" },
        ]}
        disabled={false}
        isSaving={false}
        product={createProduct()}
        selectedAccountIds={[20]}
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
