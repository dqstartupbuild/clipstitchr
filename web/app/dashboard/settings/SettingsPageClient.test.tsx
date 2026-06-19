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
  defaultProductId?: string;
  isLoading: boolean;
  isSaving: boolean;
  isCreating: boolean;
  savingProductId: string | null;
  deletingProductId: string | null;
  defaultingProductId: string | null;
  error: string | null;
  createProduct: ReturnType<typeof vi.fn>;
  updateProduct: ReturnType<typeof vi.fn>;
  deleteProduct: ReturnType<typeof vi.fn>;
  setDefaultProduct: ReturnType<typeof vi.fn>;
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

vi.mock("@/lib/clipstitchr/hooks/useDashboardProduct", () => ({
  useDashboardProduct: () => ({
    activeProduct: {
      audienceDetails: "Creators",
      createdAt: "2026-05-20T00:00:00.000Z",
      id: "product_1",
      inferredPainPoints: [],
      name: "Launch Kit",
      productDetails: "Landing page builder",
      updatedAt: "2026-05-20T00:00:00.000Z",
    },
  }),
}));

vi.mock("@/lib/clipstitchr/hooks/useSwiprLibrary", () => ({
  useSwiprLibrary: () => ({
    backgrounds: [],
  }),
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
    defaultProductId: "product_1",
    isLoading: false,
    isSaving: false,
    isCreating: false,
    savingProductId: null,
    deletingProductId: null,
    defaultingProductId: null,
    error: null,
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    setDefaultProduct: vi.fn(),
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
      cliprGenerationMode: "any",
      stitchrGenerationCount: 10,
      stitchrTextStyleChoice: "any",
      stitchrTextColorChoice: "any",
      stitchrTextBackgroundColorChoice: "any",
      stitchrTextStrokeColorChoice: "any",
      swiprGenerationCount: 10,
      swiprSelectedLibraryPackNames: [],
      swiprTextStyleChoice: "any",
      swiprTextColorChoice: "any",
      swiprTextBackgroundColorChoice: "any",
      swiprTextStrokeColorChoice: "any",
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

  it("renders the settings workspace with active product automation", () => {
    const markup = renderToStaticMarkup(<SettingsPageClient />);

    expect(markup).toContain("Settings");
    expect(markup).toContain("Product settings");
    expect(markup).toContain("Edit saved products");
    expect(markup).toContain("Color mode");
    expect(markup).toContain("Account settings");
    expect(markup).toContain("Daily drafts");
    expect(markup).toContain("Launch Kit");
    expect(markup).toContain("Contact support");
  });

  it("shows automation errors", () => {
    mocks.automationState = createAutomationState({
      error: "Unable to save automation settings.",
    });

    const markup = renderToStaticMarkup(<SettingsPageClient />);

    expect(markup).toContain("Unable to save automation settings.");
  });
});
