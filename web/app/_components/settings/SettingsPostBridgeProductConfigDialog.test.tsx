import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { SettingsPostBridgeProductConfigDialog } from "@/app/_components/settings/SettingsPostBridgeProductConfigDialog";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

vi.mock("convex/react", () => ({
  useMutation: () => vi.fn(async () => undefined),
}));

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

describe("SettingsPostBridgeProductConfigDialog", () => {
  it("renders as a modal dialog with product config copy", () => {
    const markup = renderToStaticMarkup(
      <SettingsPostBridgeProductConfigDialog
        hasApiKey={false}
        isDisabled={false}
        products={[createProduct()]}
        onClose={vi.fn()}
      />,
    );

    expect(markup).toContain('role="dialog"');
    expect(markup).toContain("Post Bridge accounts");
    expect(markup).toContain("Save your Post Bridge key first");
    expect(markup).toContain("Close Post Bridge account config");
  });
});
