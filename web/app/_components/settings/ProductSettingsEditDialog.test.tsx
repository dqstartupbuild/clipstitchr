import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ProductSettingsEditDialog } from "@/app/_components/settings/ProductSettingsEditDialog";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

vi.mock("@/app/_components/settings/ProductHookStyleSelect", () => ({
  ProductHookStyleSelect: ({ value }: { value: string }) =>
    `ProductHookStyleSelect:${value}`,
}));

function createProduct(): ProductProfile {
  return {
    audienceDetails: "Creators",
    createdAt: "2026-05-20T00:00:00.000Z",
    id: "product_1",
    inferredPainPoints: [],
    name: "Launch Kit",
    preferredCliprHookStyleKey: "mystery_gap",
    productDetails: "A launch kit",
    updatedAt: "2026-05-20T00:00:00.000Z",
  };
}

describe("ProductSettingsEditDialog", () => {
  it("renders editable product context fields", () => {
    const markup = renderToStaticMarkup(
      <ProductSettingsEditDialog
        product={createProduct()}
        isSaving={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    expect(markup).toContain("Edit product context");
    expect(markup).toContain("Launch Kit");
    expect(markup).toContain("ProductHookStyleSelect:mystery_gap");
    expect(markup).toContain("Product details");
    expect(markup).toContain("Audience details");
    expect(markup).toContain("Save");
  });
});
