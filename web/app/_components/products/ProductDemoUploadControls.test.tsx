import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ProductDemoUploadControls } from "@/app/_components/products/ProductDemoUploadControls";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

function findElements(
  value: unknown,
  predicate: (element: {
    props?: Record<string, unknown>;
    type?: unknown;
  }) => boolean,
): Array<{ props: Record<string, unknown>; type?: unknown }> {
  if (!value || typeof value !== "object") {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((child) => findElements(child, predicate));
  }

  const element = value as {
    props?: { children?: unknown };
    type?: unknown;
  };
  const matches = predicate(
    element as { props?: Record<string, unknown>; type?: unknown },
  )
    ? [element as { props: Record<string, unknown>; type?: unknown }]
    : [];

  return [...matches, ...findElements(element.props?.children, predicate)];
}

function createProduct(overrides: Partial<ProductProfile> = {}): ProductProfile {
  return {
    audienceDetails: "Creators",
    createdAt: "2026-05-20T00:00:00.000Z",
    id: "product_1",
    inferredPainPoints: [],
    name: "Launch Kit",
    productDetails: "Landing page builder",
    updatedAt: "2026-05-20T00:00:00.000Z",
    ...overrides,
  };
}

describe("ProductDemoUploadControls", () => {
  it("renders loading and empty product states", () => {
    const loadingMarkup = renderToStaticMarkup(
      <ProductDemoUploadControls
        products={[]}
        isLoading={true}
        selectedProductId=""
        onSelectedProductIdChange={vi.fn()}
      />,
    );
    const emptyMarkup = renderToStaticMarkup(
      <ProductDemoUploadControls
        products={[]}
        isLoading={false}
        selectedProductId=""
        onSelectedProductIdChange={vi.fn()}
      />,
    );

    expect(loadingMarkup).toContain("Loading products");
    expect(emptyMarkup).toContain("Product required");
    expect(emptyMarkup).toContain("Add product");
    expect(emptyMarkup).toContain('href="/dashboard/settings"');
  });

  it("renders product options and forwards selection changes", () => {
    const onSelectedProductIdChange = vi.fn();
    const tree = ProductDemoUploadControls({
      products: [createProduct()],
      isLoading: false,
      selectedProductId: "product_1",
      onSelectedProductIdChange,
    });
    const [selectInput] = findElements(
      tree,
      (element) =>
        typeof element.type === "function" && element.type.name === "SelectInput",
    );
    const markup = renderToStaticMarkup(tree);

    (selectInput.props.onChange as (event: {
      currentTarget: { value: string };
    }) => void)({ currentTarget: { value: "product_2" } });

    expect(markup).toContain("Launch Kit");
    expect(onSelectedProductIdChange).toHaveBeenCalledWith("product_2");
  });
});
