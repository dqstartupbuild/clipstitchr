import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CliprPageClient } from "@/app/dashboard/clipr/CliprPageClient";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

type ChildrenProps = {
  children?: React.ReactNode;
};

const mocks = vi.hoisted(() => ({
  clipLibraryState: {
    error: null as string | null,
    refresh: vi.fn(),
  },
  cliprGenerator: {
    error: null as string | null,
    finalClipId: null as string | null,
    generate: vi.fn(),
    isGenerating: false,
    job: null,
    message: null as string | null,
    progress: 0,
    status: "idle",
  },
  photoLibraryState: {
    avatars: [
      {
        cliprVoiceId: "Rachel",
        id: "avatar_1",
        name: "Nova",
      },
    ],
    defaultAvatarId: "avatar_1",
    defaultCliprVoiceId: "Rachel",
    error: null as string | null,
    photos: [
      {
        avatarId: "avatar_1",
        id: "photo_1",
        name: "Nova photo",
      },
    ],
  },
  productState: {
    defaultProductId: "product_2" as string | undefined,
    error: null as string | null,
    products: [] as ProductProfile[],
  },
  sceneControlsProps: null as Record<string, unknown> | null,
}));

vi.mock("@/app/_components/dashboard/DashboardShell", () => ({
  DashboardShell: ({ children }: ChildrenProps) => <main>{children}</main>,
}));

vi.mock("@/app/_components/dashboard/DashboardPageHeader", () => ({
  DashboardPageHeader: ({ title }: { title: string }) => `Header:${title}`,
}));

vi.mock("@/app/_components/ui/Panel", () => ({
  Panel: ({ children }: ChildrenProps) => <section>{children}</section>,
}));

vi.mock("@/app/_components/ui/Button", () => ({
  Button: ({ children }: ChildrenProps) => <button type="button">{children}</button>,
}));

vi.mock("@/app/_components/clipr/CliprAvatarPanel", () => ({
  CliprAvatarPanel: () => "CliprAvatarPanel",
}));

vi.mock("@/app/_components/clipr/CliprGenerationProgress", () => ({
  CliprGenerationProgress: () => "CliprGenerationProgress",
}));

vi.mock("@/app/_components/clipr/CliprJobResult", () => ({
  CliprJobResult: () => "CliprJobResult",
}));

vi.mock("@/app/_components/clipr/CliprMusicControl", () => ({
  CliprMusicControl: () => "CliprMusicControl",
}));

vi.mock("@/app/_components/clipr/CliprSceneControls", () => ({
  CliprSceneControls: (props: Record<string, unknown>) => {
    mocks.sceneControlsProps = props;
    return "CliprSceneControls";
  },
}));

vi.mock("@/app/_components/clipr/CliprVoiceSelect", () => ({
  CliprVoiceSelect: () => "CliprVoiceSelect",
}));

vi.mock("@/lib/clipstitchr/hooks/useClipLibrary", () => ({
  useClipLibrary: () => mocks.clipLibraryState,
}));

vi.mock("@/lib/clipstitchr/hooks/useCliprGeneration", () => ({
  useCliprGeneration: () => mocks.cliprGenerator,
}));

vi.mock("@/lib/clipstitchr/hooks/usePhotoLibrary", () => ({
  usePhotoLibrary: () => mocks.photoLibraryState,
}));

vi.mock("@/lib/clipstitchr/hooks/useProducts", () => ({
  useProducts: () => mocks.productState,
}));

vi.mock("@/lib/clipstitchr/hooks/useDashboardProduct", () => ({
  useDashboardProduct: () => {
    const products = mocks.productState.products;
    const activeProduct =
      products.find(
        (product) => product.id === mocks.productState.defaultProductId,
      ) ?? products[0];

    return {
      activeProduct,
      activeProductId: activeProduct?.id,
      defaultProductId: mocks.productState.defaultProductId,
      error: mocks.productState.error,
      isBackfillingLegacyContent: false,
      isCreating: false,
      isLoading: false,
      isSaving: false,
      products,
      requiresProductSetup: false,
      requiresOnboarding: false,
      createProduct: vi.fn(),
      markOnboardingCompletedLocally: vi.fn(),
      setActiveProduct: vi.fn(),
      updateProduct: vi.fn(),
    };
  },
}));

function createProduct(overrides: Partial<ProductProfile> = {}): ProductProfile {
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

describe("CliprPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.sceneControlsProps = null;
    mocks.productState.defaultProductId = "product_2";
    mocks.productState.products = [
      createProduct(),
      createProduct({
        id: "product_2",
        name: "Second Product",
      }),
    ];
  });

  it("selects the default product before falling back to the first product", () => {
    const markup = renderToStaticMarkup(<CliprPageClient />);

    expect(markup).toContain("Header:Create more UGC");
    expect(markup).toContain("CliprSceneControls");
    expect(mocks.sceneControlsProps).toEqual(
      expect.objectContaining({
        location: "",
        outfit: "",
        pose: "",
      }),
    );
  });
});
