import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProductSettingsCard } from "@/app/_components/settings/ProductSettingsCard";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

const mocks = vi.hoisted(() => ({
  iconButtons: [] as Array<{ label: string; onClick?: () => void }>,
}));

vi.mock("@/app/_components/ui/IconButton", () => ({
  IconButton: (props: { label: string; onClick?: () => void }) => {
    mocks.iconButtons.push(props);
    return <button type="button">{props.label}</button>;
  },
}));

vi.mock("@/app/_components/settings/ProductSettingsEditDialog", () => ({
  ProductSettingsEditDialog: () => "ProductSettingsEditDialog",
}));

function createProduct(
  overrides: Partial<ProductProfile> = {},
): ProductProfile {
  return {
    audienceDetails: "Creators",
    createdAt: "2026-05-20T00:00:00.000Z",
    id: "product_1",
    inferredPainPoints: [],
    name: "Launch Kit",
    productDetails: "A launch kit",
    updatedAt: "2026-05-20T00:00:00.000Z",
    ...overrides,
  };
}

describe("ProductSettingsCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.iconButtons = [];
  });

  it("renders product summary and invokes delete confirmation", async () => {
    const onDelete = vi.fn(async () => undefined);
    const onSetDefault = vi.fn(async () => undefined);

    vi.stubGlobal("window", {
      confirm: vi.fn(() => true),
    });

    const markup = renderToStaticMarkup(
      <ProductSettingsCard
        product={createProduct()}
        isDefault={false}
        isDefaulting={false}
        isDisabled={false}
        isDeleting={false}
        isSaving={false}
        onDelete={onDelete}
        onSetDefault={onSetDefault}
        onUpdate={vi.fn()}
      />,
    );

    expect(markup).toContain("Launch Kit");
    expect(markup).toContain("A launch kit");
    expect(markup).toContain("Hook style:");

    await mocks.iconButtons
      .find((button) => button.label === "Make Launch Kit active")
      ?.onClick?.();
    await mocks.iconButtons
      .find((button) => button.label === "Archive product")
      ?.onClick?.();

    expect(onSetDefault).toHaveBeenCalledWith(
      expect.objectContaining({ id: "product_1" }),
    );
    expect(onDelete).toHaveBeenCalledWith("product_1");

    vi.unstubAllGlobals();
  });

  it("uses the saved product fallback summary", () => {
    const markup = renderToStaticMarkup(
      <ProductSettingsCard
        product={createProduct({
          audienceDetails: "",
          productDetails: "",
        })}
        isDefault
        isDefaulting={false}
        isDisabled
        isDeleting
        isSaving={false}
        onDelete={vi.fn()}
        onSetDefault={vi.fn()}
        onUpdate={vi.fn()}
      />,
    );

    expect(markup).toContain("Saved product");
    expect(markup).toContain("Active product");
    expect(markup).toContain("Launch Kit is active");
    expect(markup).toContain("Archiving product");
  });
});
