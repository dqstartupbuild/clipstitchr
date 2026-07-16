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
  archivedProducts: ProductProfile[];
  defaultProductId?: string;
  isLoading: boolean;
  isSaving: boolean;
  isCreating: boolean;
  savingProductId: string | null;
  deletingProductId: string | null;
  defaultingProductId: string | null;
  restoringProductId: string | null;
  error: string | null;
  createProduct: ReturnType<typeof vi.fn>;
  updateProduct: ReturnType<typeof vi.fn>;
  deleteProduct: ReturnType<typeof vi.fn>;
  restoreProduct: ReturnType<typeof vi.fn>;
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
  useDashboardProduct: () => {
    if (!mocks.productsState) {
      throw new Error("Missing products state");
    }

    const activeProduct =
      mocks.productsState.products.find(
        (product) => product.id === mocks.productsState?.defaultProductId,
      ) ?? mocks.productsState.products[0];

    return {
      activeProduct,
      activeProductId: activeProduct?.id,
      archivedProducts: mocks.productsState.archivedProducts,
      defaultProductId: mocks.productsState.defaultProductId,
      defaultingProductId: mocks.productsState.defaultingProductId,
      deletingProductId: mocks.productsState.deletingProductId,
      error: mocks.productsState.error,
      isBackfillingLegacyContent: false,
      isCreating: mocks.productsState.isCreating,
      isLoading: mocks.productsState.isLoading,
      isSaving: mocks.productsState.isSaving,
      products: mocks.productsState.products,
      restoringProductId: mocks.productsState.restoringProductId,
      requiresProductSetup: false,
      requiresOnboarding: false,
      savingProductId: mocks.productsState.savingProductId,
      createProduct: mocks.productsState.createProduct,
      deleteProduct: mocks.productsState.deleteProduct,
      markOnboardingCompletedLocally: vi.fn(),
      restoreProduct: mocks.productsState.restoreProduct,
      setActiveProduct: mocks.productsState.setDefaultProduct,
      updateProduct: mocks.productsState.updateProduct,
    };
  },
}));

vi.mock("convex/react", () => ({
  useMutation: () => vi.fn(async () => undefined),
}));

vi.mock("@/lib/clipstitchr/hooks/useBillingWorkspace", () => ({
  useBillingWorkspace: () => ({
    buyRefill: vi.fn(),
    entitlement: null,
    error: null,
    isLoading: false,
    manageBilling: vi.fn(),
    pendingAction: null,
    startPlan: vi.fn(),
    usage: null,
    usageHistory: [],
  }),
}));

vi.mock("@/lib/clipstitchr/hooks/useSwiprLibrary", () => ({
  useSwiprLibrary: () => ({
    backgrounds: [],
  }),
}));

vi.mock("@/lib/clipstitchr/hooks/useStitchTemplates", () => ({
  useStitchTemplates: () => ({
    isLoading: false,
    templates: [],
  }),
}));

vi.mock("@/app/_components/dashboard/DashboardShell", () => ({
  DashboardShell: ({ children }: { children: React.ReactNode }) => (
    <main>{children}</main>
  ),
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
    archivedProducts: [],
    defaultProductId: "product_1",
    isLoading: false,
    isSaving: false,
    isCreating: false,
    savingProductId: null,
    deletingProductId: null,
    defaultingProductId: null,
    restoringProductId: null,
    error: null,
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    restoreProduct: vi.fn(),
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
      stitchrTemplateAllocations: [],
      swiprGenerationCount: 10,
      swiprCallToActionStyle: "any",
      swiprCreativeContext: "",
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
    expect(markup).toContain("Account settings");
    expect(markup).toContain("Config");
    expect(markup).toContain("Run ClipStitchr from your product repo");
    expect(markup).toContain("npm install -g clipstitchr");
    expect(markup).toContain("Daily drafts");
    expect(markup).toContain("Plan and usage");
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
