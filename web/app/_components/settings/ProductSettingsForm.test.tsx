import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ProductSettingsForm } from "@/app/_components/settings/ProductSettingsForm";

vi.mock("@/app/_components/ui/Panel", () => ({
  Panel: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/app/_components/settings/ProductHookStyleSelect", () => ({
  ProductHookStyleSelect: () => "ProductHookStyleSelect",
}));

describe("ProductSettingsForm", () => {
  it("renders the product creation form and disabled save state", () => {
    const markup = renderToStaticMarkup(
      <ProductSettingsForm isSaving={false} onCreate={vi.fn()} />,
    );

    expect(markup).toContain("Add product context");
    expect(markup).toContain("Product name");
    expect(markup).toContain("ProductHookStyleSelect");
    expect(markup).toContain("Save product");
    expect(markup).toContain("disabled");
  });

  it("renders a loading save button while saving", () => {
    const markup = renderToStaticMarkup(
      <ProductSettingsForm isSaving onCreate={vi.fn()} />,
    );

    expect(markup).toContain("Save product");
  });
});
