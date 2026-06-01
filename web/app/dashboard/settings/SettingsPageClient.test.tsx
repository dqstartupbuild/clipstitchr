import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsPageClient } from "@/app/dashboard/settings/SettingsPageClient";
import type { AutomationPreferencesInput } from "@/lib/clipstitchr/types/AutomationPreferencesInput";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

type AutomationState = {
  preferences: AutomationPreferencesInput;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  savePreferences: ReturnType<typeof vi.fn>;
};

type ProductsState = {
  products: ProductProfile[];
  isLoading: boolean;
  isSaving: boolean;
  isCreating: boolean;
  savingProductId: string | null;
  deletingProductId: string | null;
  error: string | null;
  createProduct: ReturnType<typeof vi.fn>;
  updateProduct: ReturnType<typeof vi.fn>;
  deleteProduct: ReturnType<typeof vi.fn>;
};

const mocks = vi.hoisted(() => ({
  automationState: null as AutomationState | null,
  productsState: null as ProductsState | null,
}));

vi.mock("@/lib/clipstitchr/hooks/useAutomationPreferences", () => ({
  useAutomationPreferences: () => {
    if (!mocks.automationState) {
      throw new Error("Missing automation state");
    }

    return mocks.automationState;
  },
}));

vi.mock("@/lib/clipstitchr/hooks/useProducts", () => ({
  useProducts: () => {
    if (!mocks.productsState) {
      throw new Error("Missing products state");
    }

    return mocks.productsState;
  },
}));

vi.mock("@/app/_components/dashboard/DashboardShell", () => ({
  DashboardShell: ({ children }: { children: React.ReactNode }) => (
    <main>{children}</main>
  ),
}));

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

function createProductsState(
  overrides: Partial<ProductsState> = {},
): ProductsState {
  return {
    products: [createProduct()],
    isLoading: false,
    isSaving: false,
    isCreating: false,
    savingProductId: null,
    deletingProductId: null,
    error: null,
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    ...overrides,
  };
}

function createAutomationState(
  overrides: Partial<AutomationState> = {},
): AutomationState {
  return {
    preferences: {
      enabled: false,
      enabledTools: ["stitchr", "swapr", "clipr", "avatar-photo", "swipr"],
      productSelectionMode: "all",
      selectedProductIds: [],
      avatarSelectionMode: "all",
      selectedAvatarIds: [],
    },
    isLoading: false,
    isSaving: false,
    error: null,
    savePreferences: vi.fn(),
    ...overrides,
  };
}

describe("SettingsPageClient", () => {
  beforeEach(() => {
    mocks.automationState = createAutomationState();
    mocks.productsState = createProductsState();
  });

  it("renders the settings workspace with product state", () => {
    const markup = renderToStaticMarkup(<SettingsPageClient />);

    expect(markup).toContain("Settings");
    expect(markup).toContain("Save product context");
    expect(markup).toContain("Color mode");
    expect(markup).toContain("Daily drafts");
    expect(markup).toContain("Launch Kit");
    expect(markup).toContain("Contact support");
  });

  it("shows product errors and disables list actions while deleting", () => {
    mocks.productsState = createProductsState({
      deletingProductId: "product_1",
      error: "Unable to delete this product.",
      isSaving: true,
      savingProductId: "product_1",
    });

    const markup = renderToStaticMarkup(<SettingsPageClient />);

    expect(markup).toContain("Unable to delete this product.");
    expect(markup).toContain("Deleting");
    expect(markup).toContain("disabled");
  });
});
