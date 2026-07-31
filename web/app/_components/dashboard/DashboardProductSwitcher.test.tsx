/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardProductSwitcher } from "@/app/_components/dashboard/DashboardProductSwitcher";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

const products: ProductProfile[] = [
  {
    id: "product_1",
    name: "Launch Kit",
    productDetails: "",
    audienceDetails: "",
    websiteUrl: "https://launchkit.example.com/",
    inferredPainPoints: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "product_2",
    name: "Demo Lab",
    productDetails: "",
    audienceDetails: "",
    websiteUrl: "https://demolab.example.com/",
    inferredPainPoints: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "product_3",
    name: "First Batch",
    productDetails: "",
    audienceDetails: "",
    inferredPainPoints: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

const mocks = vi.hoisted(() => ({
  setActiveProduct: vi.fn(async () => undefined),
}));

vi.mock("@/app/_components/products/ProductCreateDialog", () => ({
  ProductCreateDialog: () => null,
}));

vi.mock("@/lib/clipstitchr/hooks/useDashboardProduct", () => ({
  useDashboardProduct: () => ({
    activeProduct: products[0],
    createProduct: vi.fn(),
    error: null,
    isCreating: false,
    isLoading: false,
    isProductLimitReached: false,
    lockedProductIds: [],
    products,
    setActiveProduct: mocks.setActiveProduct,
    showProductPlanLimitDialog: vi.fn(),
  }),
}));

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  document.body.replaceChildren();
  vi.unstubAllGlobals();
});

describe("DashboardProductSwitcher", () => {
  it("shows product logos and switches products from the expanded list", async () => {
    await act(async () => {
      root.render(<DashboardProductSwitcher />);
    });

    const trigger = container.querySelector(
      ".dashboard-product-switcher-trigger",
    ) as HTMLButtonElement;

    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.querySelector("img")?.src).toBe(
      "https://launchkit.example.com/favicon.ico",
    );

    await act(async () => trigger.click());

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(
      container.querySelector("#dashboard-product-switcher-options"),
    ).not.toBeNull();
    expect(
      Array.from(container.querySelectorAll("img")).map((image) => image.src),
    ).toEqual([
      "https://launchkit.example.com/favicon.ico",
      "https://launchkit.example.com/favicon.ico",
      "https://demolab.example.com/favicon.ico",
    ]);
    expect(container.textContent).toContain("FB");

    const demoLabButton = Array.from(
      container.querySelectorAll("button"),
    ).find((button) => button.textContent?.includes("Demo Lab"));

    await act(async () => demoLabButton?.click());

    expect(mocks.setActiveProduct).toHaveBeenCalledWith(products[1]);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });
});
