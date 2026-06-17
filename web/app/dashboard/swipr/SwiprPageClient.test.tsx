import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SwiprPageClient } from "@/app/dashboard/swipr/SwiprPageClient";
import { createSwiprSlides } from "@/lib/clipstitchr/utils/createSwiprSlides";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";

type ChildrenProps = {
  children?: unknown;
};

const mocks = vi.hoisted(() => ({
  productState: {
    defaultProductId: undefined as string | undefined,
    error: null as string | null,
    products: [] as ProductProfile[],
  },
  photoLibraryState: {
    error: null as string | null,
    loadPhoto: vi.fn(),
    photos: [],
  },
  swiprLibraryState: {
    backgrounds: [] as SwiprBackgroundAsset[],
    error: null as string | null,
    isSavingBackground: false,
    isSavingSwipe: false,
    loadBackgroundBlob: vi.fn(),
    loadSwipePoster: vi.fn(),
    postedSwipes: [] as SwiprSwipe[],
    refresh: vi.fn(),
    saveBackground: vi.fn(),
    saveSwipe: vi.fn(),
    swipes: [] as SwiprSwipe[],
    updateSwipePostedStatus: vi.fn(),
  },
  swiprExportState: {
    error: null as string | null,
    exportCarousel: vi.fn(),
    progress: 0,
    status: "idle",
  },
  batchControlsProps: null as Record<string, unknown> | null,
  backgroundPanelProps: null as Record<string, unknown> | null,
  generateCliprText: vi.fn(),
  generateSwiprDrafts: vi.fn(),
  generateSwiprBackgroundWithAi: vi.fn(),
  importPexelsPhotosToSwiprLibrary: vi.fn(),
  loadPexelsPhotoBlob: vi.fn(),
  manualControlsProps: null as Record<string, unknown> | null,
  modeToggleProps: null as Record<string, unknown> | null,
  pexelsPanelProps: null as Record<string, unknown> | null,
  previewPanelProps: null as Record<string, unknown> | null,
  productPanelProps: null as Record<string, unknown> | null,
  searchPexelsPhotos: vi.fn(),
  slideStripProps: null as Record<string, unknown> | null,
  stateQueue: [] as unknown[],
  stateSetters: [] as ReturnType<typeof vi.fn>[],
  useEffect: vi.fn(),
  textOverlayPanelProps: null as Record<string, unknown> | null,
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useCallback: (callback: unknown) => callback,
    useEffect: mocks.useEffect,
    useMemo: (factory: () => unknown) => factory(),
    useState: (initialValue: unknown) => {
      const value =
        mocks.stateQueue.length > 0
          ? mocks.stateQueue.shift()
          : typeof initialValue === "function"
            ? (initialValue as () => unknown)()
            : initialValue;
      const setter = vi.fn((nextValue: unknown) => {
        if (typeof nextValue === "function") {
          return (nextValue as (currentValue: unknown) => unknown)(value);
        }

        return nextValue;
      });

      mocks.stateSetters.push(setter);

      return [value, setter];
    },
  };
});

vi.mock("@/app/_components/dashboard/DashboardShell", () => ({
  DashboardShell: ({ children }: ChildrenProps) => children,
}));

vi.mock("@/app/_components/dashboard/DashboardPageHeader", () => ({
  DashboardPageHeader: ({ title }: { title: string }) => `Header:${title}`,
}));

vi.mock("@/app/_components/ui/Panel", () => ({
  Panel: ({ children }: ChildrenProps) => children,
}));

vi.mock("@/app/_components/swipr/SwiprProductPanel", () => ({
  SwiprProductPanel: (props: Record<string, unknown>) => {
    mocks.productPanelProps = props;
    return "SwiprProductPanel";
  },
}));

vi.mock("@/app/_components/swipr/SwiprBatchControls", () => ({
  SwiprBatchControls: (props: Record<string, unknown>) => {
    mocks.batchControlsProps = props;
    return "SwiprBatchControls";
  },
}));

vi.mock("@/app/_components/swipr/SwiprManualControls", () => ({
  SwiprManualControls: (props: Record<string, unknown>) => {
    mocks.manualControlsProps = props;
    return "SwiprManualControls";
  },
}));

vi.mock("@/app/_components/swipr/SwiprModeToggle", () => ({
  SwiprModeToggle: (props: Record<string, unknown>) => {
    mocks.modeToggleProps = props;
    return "SwiprModeToggle";
  },
}));

vi.mock("@/app/_components/swipr/SwiprBackgroundPanel", () => ({
  SwiprBackgroundPanel: (props: Record<string, unknown>) => {
    mocks.backgroundPanelProps = props;
    return "SwiprBackgroundPanel";
  },
}));

vi.mock("@/app/_components/swipr/SwiprAvatarPhotoPanel", () => ({
  SwiprAvatarPhotoPanel: () => "SwiprAvatarPhotoPanel",
}));

vi.mock("@/app/_components/swipr/SwiprPexelsPanel", () => ({
  SwiprPexelsPanel: (props: Record<string, unknown>) => {
    mocks.pexelsPanelProps = props;
    return "SwiprPexelsPanel";
  },
}));

vi.mock("@/app/_components/swipr/SwiprSlideStrip", () => ({
  SwiprSlideStrip: (props: Record<string, unknown>) => {
    mocks.slideStripProps = props;
    return "SwiprSlideStrip";
  },
}));

vi.mock("@/app/_components/swipr/SwiprTextOverlayPanel", () => ({
  SwiprTextOverlayPanel: (props: Record<string, unknown>) => {
    mocks.textOverlayPanelProps = props;
    return "SwiprTextOverlayPanel";
  },
}));

vi.mock("@/app/_components/swipr/SwiprPreviewPanel", () => ({
  SwiprPreviewPanel: (props: Record<string, unknown>) => {
    mocks.previewPanelProps = props;
    return "SwiprPreviewPanel";
  },
}));

vi.mock("@/lib/clipstitchr/hooks/useProducts", () => ({
  useProducts: () => mocks.productState,
}));

vi.mock("@/lib/clipstitchr/hooks/usePhotoLibrary", () => ({
  usePhotoLibrary: () => mocks.photoLibraryState,
}));

vi.mock("@/lib/clipstitchr/hooks/useSwiprLibrary", () => ({
  useSwiprLibrary: () => mocks.swiprLibraryState,
}));

vi.mock("@/lib/clipstitchr/hooks/useSwiprExport", () => ({
  useSwiprExport: () => mocks.swiprExportState,
}));

vi.mock("@/lib/clipstitchr/client/generateCliprText", () => ({
  generateCliprText: mocks.generateCliprText,
}));

vi.mock("@/lib/clipstitchr/client/generateSwiprDrafts", () => ({
  generateSwiprDrafts: mocks.generateSwiprDrafts,
}));

vi.mock("@/lib/clipstitchr/client/generateSwiprBackgroundWithAi", () => ({
  generateSwiprBackgroundWithAi: mocks.generateSwiprBackgroundWithAi,
}));

vi.mock("@/lib/clipstitchr/client/importPexelsPhotosToSwiprLibrary", () => ({
  importPexelsPhotosToSwiprLibrary: mocks.importPexelsPhotosToSwiprLibrary,
}));

vi.mock("@/lib/clipstitchr/client/loadPexelsPhotoBlob", () => ({
  loadPexelsPhotoBlob: mocks.loadPexelsPhotoBlob,
}));

vi.mock("@/lib/clipstitchr/client/searchPexelsPhotos", () => ({
  searchPexelsPhotos: mocks.searchPexelsPhotos,
}));

function createProduct(overrides: Partial<ProductProfile> = {}): ProductProfile {
  return {
    audienceDetails: "Founders",
    createdAt: "2026-01-01T00:00:00.000Z",
    id: "product_1",
    inferredPainPoints: [],
    name: "Launch Kit",
    productDetails: "A launch kit",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function createBackground(
  overrides: Partial<SwiprBackgroundAsset> = {},
): SwiprBackgroundAsset {
  return {
    createdAt: "2026-01-01T00:00:00.000Z",
    height: 1920,
    id: "background_1",
    imageObject: {
      contentType: "image/jpeg",
      key: "users/user_123/swipr-backgrounds/background_1/image.jpg",
      size: 100,
    },
    mimeType: "image/jpeg",
    name: "Studio",
    size: 100,
    source: "upload",
    tags: ["studio"],
    width: 1080,
    ...overrides,
  };
}

function createSwipe(overrides: Partial<SwiprSwipe> = {}): SwiprSwipe {
  const slides = createPhotoSlides(3);

  return {
    backgroundId: "background_1",
    createdAt: "2026-01-01T00:00:00.000Z",
    id: "swipe_1",
    name: "Launch Kit Swipe",
    productContext: "Launch Kit",
    productName: "Launch Kit",
    productSourceId: "product_1",
    productSourceType: "saved-product",
    slides,
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function createPhotoSlides(count: number) {
  return createSwiprSlides(count).map((slide) => ({
    ...slide,
    backgroundId: "background_1",
  }));
}

function queueSwiprState(
  overrides: {
    activeSlideId?: string | null;
    autoTextMessage?: string | null;
    background?: unknown;
    backgroundError?: string | null;
    editingSwipeId?: string | null;
    generationPrompt?: string;
    isGeneratingAiBackground?: boolean;
    isGeneratingAutoText?: boolean;
    isGeneratingDrafts?: boolean;
    isImportingBackground?: boolean;
    isImportingPexelsLibrary?: boolean;
    isSearchingPexels?: boolean;
    loadedSwipeId?: string | null;
    pexelsError?: string | null;
    pexelsImportCount?: number;
    pexelsPhotos?: unknown[];
    pexelsQuery?: string;
    saveMessage?: string | null;
    savedSwipeSnapshot?: SwiprSwipe | null;
    selectedLibraryQueries?: string[];
    selectedProductId?: string;
    slides?: ReturnType<typeof createSwiprSlides>;
    swiprMode?: "batch" | "manual";
    textGenerationScope?: "all" | "selected";
    draftGenerationCount?: number;
    pexelsPage?: number;
    hasMorePexelsPhotos?: boolean;
    isLoadingMorePexels?: boolean;
  } = {},
) {
  const slides = overrides.slides ?? createSwiprSlides(3);

  mocks.stateQueue.push(
    overrides.selectedProductId,
    overrides.swiprMode ?? "manual",
    slides,
    overrides.activeSlideId ?? slides[0]?.id ?? null,
    overrides.background ?? null,
    overrides.generationPrompt ?? "",
    overrides.pexelsQuery ?? "",
    overrides.pexelsImportCount ?? 24,
    overrides.pexelsPhotos ?? [],
    overrides.pexelsPage ?? 1,
    overrides.hasMorePexelsPhotos ?? false,
    overrides.selectedLibraryQueries ?? [],
    overrides.backgroundError ?? null,
    overrides.pexelsError ?? null,
    overrides.isGeneratingAiBackground ?? false,
    overrides.isImportingBackground ?? false,
    overrides.isImportingPexelsLibrary ?? false,
    overrides.isSearchingPexels ?? false,
    overrides.isLoadingMorePexels ?? false,
    overrides.isGeneratingDrafts ?? false,
    overrides.isGeneratingAutoText ?? false,
    overrides.draftGenerationCount ?? 3,
    overrides.textGenerationScope ?? "all",
    overrides.editingSwipeId ?? null,
    overrides.loadedSwipeId ?? null,
    overrides.savedSwipeSnapshot ?? null,
    overrides.saveMessage ?? null,
    overrides.autoTextMessage ?? null,
  );
}

describe("SwiprPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.productState.defaultProductId = undefined;
    mocks.productState.error = null;
    mocks.productState.products = [createProduct()];
    mocks.photoLibraryState.error = null;
    mocks.photoLibraryState.photos = [];
    mocks.photoLibraryState.loadPhoto.mockResolvedValue(null);
    mocks.swiprLibraryState.backgrounds = [createBackground()];
    mocks.swiprLibraryState.error = null;
    mocks.swiprLibraryState.swipes = [];
    mocks.swiprLibraryState.loadBackgroundBlob.mockResolvedValue(
      new Blob(["background"], { type: "image/jpeg" }),
    );
    mocks.swiprLibraryState.refresh.mockResolvedValue(undefined);
    mocks.swiprLibraryState.saveBackground.mockResolvedValue(createBackground());
    mocks.swiprLibraryState.saveSwipe.mockResolvedValue({
      backgroundId: "background_1",
      createdAt: "2026-01-01T00:00:00.000Z",
      id: "swipe_1",
      name: "Swipe",
      productContext: "Launch Kit",
      productName: "Launch Kit",
      productSourceId: "product_1",
      productSourceType: "saved-product",
      slides: [],
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    mocks.swiprExportState.error = null;
    mocks.swiprExportState.progress = 0;
    mocks.swiprExportState.status = "idle";
    mocks.generateCliprText.mockResolvedValue({
      slides: ["One", "Two", "Three"],
    });
    mocks.generateSwiprDrafts.mockResolvedValue({
      count: 2,
      ids: ["swipe_1", "swipe_2"],
      providerModel: "text-model",
      providerPredictionId: "prediction_1",
    });
    mocks.generateSwiprBackgroundWithAi.mockResolvedValue({
      blob: new Blob(["ai"], { type: "image/jpeg" }),
      generationDetails: {
        prompt: "studio",
      },
    });
    mocks.importPexelsPhotosToSwiprLibrary.mockResolvedValue({
      ids: ["background_1"],
      imported: 1,
      query: "coffee desk",
      searched: 1,
    });
    mocks.loadPexelsPhotoBlob.mockResolvedValue(
      new Blob(["pexels"], { type: "image/jpeg" }),
    );
    mocks.searchPexelsPhotos.mockResolvedValue([]);
    mocks.batchControlsProps = null;
    mocks.backgroundPanelProps = null;
    mocks.manualControlsProps = null;
    mocks.modeToggleProps = null;
    mocks.pexelsPanelProps = null;
    mocks.previewPanelProps = null;
    mocks.productPanelProps = null;
    mocks.slideStripProps = null;
    mocks.stateQueue.length = 0;
    mocks.stateSetters.length = 0;
    mocks.useEffect.mockReset();
    mocks.textOverlayPanelProps = null;
  });

  it("renders the Swipr creation workspace in batch mode by default", () => {
    const markup = renderToStaticMarkup(<SwiprPageClient />);

    expect(markup).toContain("Header:Create TikTok carousels");
    expect(markup).toContain("SwiprModeToggle");
    expect(markup).toContain("SwiprProductPanel");
    expect(markup).toContain("SwiprBatchControls");
    expect(markup).toContain("SwiprPexelsPanel");
    expect(markup).not.toContain("SwiprBackgroundPanel");
    expect(markup).not.toContain("SwiprPreviewPanel");
  });

  it("renders the manual Swipr slide editor when manual mode is active", () => {
    queueSwiprState({ swiprMode: "manual" });

    const markup = renderToStaticMarkup(<SwiprPageClient />);

    expect(markup).toContain("SwiprManualControls");
    expect(markup).toContain("SwiprBackgroundPanel");
    expect(markup).toContain("SwiprSlideStrip");
    expect(markup).toContain("SwiprTextOverlayPanel");
    expect(markup).toContain("SwiprPreviewPanel");
  });

  it("selects the default product before falling back to the first product", () => {
    mocks.productState.defaultProductId = "product_2";
    mocks.productState.products = [
      createProduct(),
      createProduct({
        id: "product_2",
        name: "Second Product",
      }),
    ];

    renderToStaticMarkup(<SwiprPageClient />);

    expect(mocks.productPanelProps?.selectedProductId).toBe(
      "saved-product:product_2",
    );
  });

  it("surfaces product and library errors", () => {
    mocks.productState.error = "Products unavailable.";

    expect(renderToStaticMarkup(<SwiprPageClient />)).toContain(
      "Products unavailable.",
    );

    mocks.productState.error = null;
    mocks.swiprLibraryState.error = "Backgrounds unavailable.";

    expect(renderToStaticMarkup(<SwiprPageClient />)).toContain(
      "Backgrounds unavailable.",
    );
  });

  it("exercises Swipr workspace callbacks", async () => {
    queueSwiprState({ swiprMode: "manual" });
    renderToStaticMarkup(<SwiprPageClient />);

    const productPanelProps = mocks.productPanelProps as {
      onProductChange: (value: string) => void;
    };
    const manualControlsProps = mocks.manualControlsProps as {
      onAddSlide: () => void;
      onGenerateText: () => void;
      onTextGenerationScopeChange: (scope: "all" | "selected") => void;
    };
    const backgroundPanelProps = mocks.backgroundPanelProps as {
      onGenerationPromptChange: (value: string) => void;
      onGenerateAiBackground: () => void;
      onUploadBackground: (files: File[]) => void;
    };
    const slideStripProps = mocks.slideStripProps as {
      onCopyActivePhotoToAllSlides: () => void;
      onRemoveSlide: (slideId: string) => void;
    };
    const textOverlayPanelProps = mocks.textOverlayPanelProps as {
      onChange: (textOverlay: TextOverlay) => void;
    };
    const previewPanelProps = mocks.previewPanelProps as {
      onExport: () => void;
      onSave: () => void;
      onTextOverlayChange: (textOverlay: TextOverlay) => void;
    };
    const overlay: TextOverlay = {
      backgroundColor: "#000000",
      color: "#ffffff",
      endTime: 3,
      fontSize: 48,
      startTime: 0,
      styleId: "hook",
      text: "Hook",
      width: 0.8,
      x: 0.5,
      y: 0.5,
    };

    productPanelProps.onProductChange("saved-product:product_1");
    manualControlsProps.onAddSlide();
    manualControlsProps.onTextGenerationScopeChange("selected");
    manualControlsProps.onGenerateText();
    backgroundPanelProps.onGenerationPromptChange("sunny counter");
    backgroundPanelProps.onUploadBackground([
      new File(["background"], "background.jpg", { type: "image/jpeg" }),
    ]);
    backgroundPanelProps.onGenerateAiBackground();
    slideStripProps.onCopyActivePhotoToAllSlides();
    slideStripProps.onRemoveSlide("missing_slide");
    textOverlayPanelProps.onChange(overlay);
    previewPanelProps.onTextOverlayChange(overlay);
    previewPanelProps.onSave();
    previewPanelProps.onExport();

    await Promise.resolve();
    await Promise.resolve();

    expect(mocks.generateCliprText).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: "product_1",
        purpose: "swipr",
      }),
    );
    expect(mocks.generateSwiprDrafts).not.toHaveBeenCalled();
    expect(mocks.swiprLibraryState.saveBackground).toHaveBeenCalled();
    expect(mocks.generateSwiprBackgroundWithAi).toHaveBeenCalledWith({
      productContext: expect.stringContaining("Launch Kit"),
      prompt: "",
    });
  });

  it("covers disabled product and background error branches", async () => {
    mocks.productState.products = [];
    queueSwiprState({ swiprMode: "manual" });
    renderToStaticMarkup(<SwiprPageClient />);

    const manualControlsProps = mocks.manualControlsProps as {
      onGenerateText: () => void;
    };
    const backgroundPanelProps = mocks.backgroundPanelProps as {
      onGenerateAiBackground: () => void;
      onUploadBackground: (files: File[]) => void;
    };
    const previewPanelProps = mocks.previewPanelProps as {
      onSave: () => void;
    };

    manualControlsProps.onGenerateText();
    backgroundPanelProps.onGenerateAiBackground();
    previewPanelProps.onSave();

    mocks.swiprLibraryState.saveBackground.mockRejectedValueOnce(
      new Error("save failed"),
    );
    backgroundPanelProps.onUploadBackground([
      new File(["background"], "background.jpg", { type: "image/jpeg" }),
    ]);

    await Promise.resolve();
    await Promise.resolve();

    expect(mocks.generateCliprText).not.toHaveBeenCalled();
    expect(mocks.generateSwiprBackgroundWithAi).not.toHaveBeenCalled();
  });

  it("imports Pexels packs and generates editable drafts from saved packs", async () => {
    mocks.swiprLibraryState.backgrounds = [
      createBackground({
        id: "background_pexels",
        libraryQuery: "coffee desk",
        source: "pexels",
      }),
    ];
    queueSwiprState({
      draftGenerationCount: 2,
      pexelsImportCount: 12,
      pexelsQuery: "coffee desk",
      selectedLibraryQueries: ["coffee desk"],
      swiprMode: "batch",
    });

    renderToStaticMarkup(<SwiprPageClient />);

    const productPanelProps = mocks.productPanelProps as {
      onProductChange: (value: string) => void;
    };
    const batchControlsProps = mocks.batchControlsProps as {
      onGenerateDrafts: () => void;
    };
    const pexelsPanelProps = mocks.pexelsPanelProps as {
      libraryPacks: unknown[];
      onImportQuery: () => void;
    };

    productPanelProps.onProductChange("saved-product:product_1");
    pexelsPanelProps.onImportQuery();
    batchControlsProps.onGenerateDrafts();

    await Promise.resolve();
    await Promise.resolve();

    expect(pexelsPanelProps.libraryPacks).toHaveLength(1);
    expect(mocks.importPexelsPhotosToSwiprLibrary).toHaveBeenCalledWith({
      count: 12,
      page: 1,
      query: "coffee desk",
    });
    expect(mocks.generateSwiprDrafts).toHaveBeenCalledWith({
      count: 2,
      productId: "product_1",
      selectedLibraryQueries: ["coffee desk"],
      slideCount: 8,
    });
  });

  it("searches Pexels and saves selected photos to the active slide", async () => {
    const pexelsPhoto = {
      alt: "Desk setup",
      height: 1920,
      id: 123,
      photographer: "Avery",
      photographerUrl: "https://pexels.com/@avery",
      pexelsUrl: "https://pexels.com/photo/123",
      src: {
        large: "https://images.pexels.com/large.jpg",
        large2x: "https://images.pexels.com/large2x.jpg",
        medium: "https://images.pexels.com/medium.jpg",
        original: "https://images.pexels.com/original.jpg",
        portrait: "https://images.pexels.com/portrait.jpg",
        small: "https://images.pexels.com/small.jpg",
      },
      width: 1080,
    };

    mocks.searchPexelsPhotos.mockResolvedValueOnce([pexelsPhoto]);
    queueSwiprState({
      hasMorePexelsPhotos: true,
      pexelsQuery: "desk setup",
      swiprMode: "manual",
    });

    renderToStaticMarkup(<SwiprPageClient />);

    const pexelsPanelProps = mocks.pexelsPanelProps as {
      onLoadMore: () => void;
      onSearch: () => void;
      onSelectPhoto: (photo: typeof pexelsPhoto) => void;
    };

    pexelsPanelProps.onSearch();
    pexelsPanelProps.onLoadMore();
    pexelsPanelProps.onSelectPhoto(pexelsPhoto);

    await Promise.resolve();
    await Promise.resolve();

    expect(mocks.searchPexelsPhotos).toHaveBeenCalledWith({
      page: 1,
      perPage: 12,
      query: "desk setup",
    });
    expect(mocks.searchPexelsPhotos).toHaveBeenCalledWith({
      page: 2,
      perPage: 12,
      query: "desk setup",
    });
    expect(mocks.loadPexelsPhotoBlob).toHaveBeenCalledWith(pexelsPhoto);
    expect(mocks.swiprLibraryState.saveBackground).toHaveBeenCalledWith(
      expect.objectContaining({
        libraryQuery: "desk setup",
        originalName: "Pexels - Avery",
        source: "pexels",
      }),
    );
  });

  it("returns early when there is no active slide to edit", () => {
    queueSwiprState({
      activeSlideId: null,
      slides: [],
    });

    renderToStaticMarkup(<SwiprPageClient />);

    const textOverlayPanelProps = mocks.textOverlayPanelProps as {
      onChange: (textOverlay: TextOverlay) => void;
    };

    textOverlayPanelProps.onChange({
      backgroundColor: "#000000",
      color: "#ffffff",
      endTime: 3,
      fontSize: 48,
      startTime: 0,
      styleId: "hook",
      text: "Hook",
      width: 0.8,
      x: 0.5,
      y: 0.5,
    });

    expect(mocks.stateSetters[2]).not.toHaveBeenCalled();
  });

  it("requires a saved product before saving a swipe", () => {
    mocks.productState.products = [];
    queueSwiprState({
      background: {
        blob: new Blob(["background"], { type: "image/jpeg" }),
        id: "background_1",
        url: "blob:background",
      },
      slides: createPhotoSlides(3),
    });

    renderToStaticMarkup(<SwiprPageClient />);

    const previewPanelProps = mocks.previewPanelProps as {
      onSave: () => void;
    };

    previewPanelProps.onSave();

    expect(
      mocks.stateSetters.some((setter) =>
        setter.mock.calls.some(
          (call) =>
            call[0] === "Choose a saved Settings product before saving.",
        ),
      ),
    ).toBe(true);
  });

  it("surfaces swipe save failures", async () => {
    mocks.swiprLibraryState.saveSwipe.mockRejectedValueOnce(
      new Error("save failed"),
    );
    queueSwiprState({
      background: {
        blob: new Blob(["background"], { type: "image/jpeg" }),
        id: "background_1",
        url: "blob:background",
      },
      slides: createPhotoSlides(3),
    });

    renderToStaticMarkup(<SwiprPageClient />);

    const previewPanelProps = mocks.previewPanelProps as {
      onSave: () => void;
    };

    previewPanelProps.onSave();
    await Promise.resolve();
    await Promise.resolve();

    expect(
      mocks.stateSetters.some((setter) =>
        setter.mock.calls.some((call) => call[0] === "save failed"),
      ),
    ).toBe(true);
  });

  it("saves and exports a ready swipe", async () => {
    const slides = createPhotoSlides(3);
    const savedSwipe = createSwipe({ slides });

    queueSwiprState({
      background: {
        blob: new Blob(["background"], { type: "image/jpeg" }),
        id: "background_1",
        url: "blob:background",
      },
      savedSwipeSnapshot: savedSwipe,
      slides,
    });
    vi.stubGlobal("window", {
      history: {
        replaceState: vi.fn(),
      },
      location: {
        href: "https://example.com/dashboard/swipr",
      },
    });

    renderToStaticMarkup(<SwiprPageClient />);

    const previewPanelProps = mocks.previewPanelProps as {
      onExport: () => void;
      onSave: () => void;
    };

    previewPanelProps.onSave();
    previewPanelProps.onExport();

    await Promise.resolve();
    await Promise.resolve();

    expect(mocks.swiprLibraryState.saveSwipe).toHaveBeenCalledWith(
      expect.objectContaining({
        backgroundId: "background_1",
        productSourceId: "product_1",
      }),
    );
    expect(mocks.swiprExportState.exportCarousel).toHaveBeenCalledWith(
      expect.objectContaining({
        productName: "Launch Kit",
        slides,
      }),
    );
    expect(window.history.replaceState).toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it("loads a saved swipe from the URL effect", async () => {
    const slides = createPhotoSlides(3);
    const savedSwipe = createSwipe({ slides });
    const effects: Array<() => void | (() => void)> = [];

    mocks.swiprLibraryState.swipes = [savedSwipe];
    mocks.useEffect.mockImplementation((effect: () => void | (() => void)) => {
      effects.push(effect);
    });
    queueSwiprState({
      editingSwipeId: "swipe_1",
      loadedSwipeId: null,
    });

    renderToStaticMarkup(<SwiprPageClient />);

    effects[0]?.();

    await Promise.resolve();
    await Promise.resolve();

    expect(mocks.swiprLibraryState.loadBackgroundBlob).toHaveBeenCalledWith(
      "background_1",
    );
    expect(
      mocks.stateSetters.some((setter) =>
        setter.mock.calls.some((call) => call[0] === "Loaded saved Swipe."),
      ),
    ).toBe(true);
  });

  it("skips saved-swipe loading when there is no new swipe id", () => {
    const effects: Array<() => void | (() => void)> = [];

    mocks.useEffect.mockImplementation((effect: () => void | (() => void)) => {
      effects.push(effect);
    });
    queueSwiprState({
      editingSwipeId: "swipe_1",
      loadedSwipeId: "swipe_1",
    });

    renderToStaticMarkup(<SwiprPageClient />);
    effects[0]?.();

    expect(mocks.swiprLibraryState.loadBackgroundBlob).not.toHaveBeenCalled();
  });

  it("skips saved-swipe loading when the URL id is missing from the library", () => {
    const effects: Array<() => void | (() => void)> = [];

    mocks.useEffect.mockImplementation((effect: () => void | (() => void)) => {
      effects.push(effect);
    });
    queueSwiprState({
      editingSwipeId: "missing_swipe",
      loadedSwipeId: null,
    });

    renderToStaticMarkup(<SwiprPageClient />);
    effects[0]?.();

    expect(mocks.swiprLibraryState.loadBackgroundBlob).not.toHaveBeenCalled();
  });

  it("does not hydrate a saved swipe after effect cleanup", async () => {
    const slides = createPhotoSlides(3);
    const savedSwipe = createSwipe({ slides });
    const effects: Array<() => void | (() => void)> = [];

    mocks.swiprLibraryState.swipes = [savedSwipe];
    mocks.useEffect.mockImplementation((effect: () => void | (() => void)) => {
      effects.push(effect);
    });
    queueSwiprState({
      editingSwipeId: "swipe_1",
      loadedSwipeId: null,
    });

    renderToStaticMarkup(<SwiprPageClient />);
    const cleanup = effects[0]?.();
    if (typeof cleanup === "function") {
      cleanup();
    }
    await Promise.resolve();
    await Promise.resolve();

    expect(
      mocks.stateSetters.some((setter) =>
        setter.mock.calls.some((call) => call[0] === "Loaded saved Swipe."),
      ),
    ).toBe(false);
  });

  it("surfaces saved-swipe hydration failures", async () => {
    const slides = createPhotoSlides(3);
    const savedSwipe = createSwipe({ slides });
    const effects: Array<() => void | (() => void)> = [];

    mocks.swiprLibraryState.swipes = [savedSwipe];
    mocks.swiprLibraryState.loadBackgroundBlob.mockRejectedValueOnce(
      new Error("load failed"),
    );
    mocks.useEffect.mockImplementation((effect: () => void | (() => void)) => {
      effects.push(effect);
    });
    queueSwiprState({
      editingSwipeId: "swipe_1",
      loadedSwipeId: null,
    });

    renderToStaticMarkup(<SwiprPageClient />);
    effects[0]?.();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(
      mocks.stateSetters.some((setter) =>
        setter.mock.calls.some((call) => call[0] === "load failed"),
      ),
    ).toBe(true);
  });

  it("surfaces async generation and export failures", async () => {
    const slides = createPhotoSlides(3);
    const savedSwipe = createSwipe({ slides });

    mocks.generateCliprText.mockRejectedValueOnce(new Error("text failed"));
    mocks.generateSwiprBackgroundWithAi.mockRejectedValueOnce(
      new Error("ai failed"),
    );
    mocks.swiprLibraryState.loadBackgroundBlob.mockRejectedValueOnce(
      new Error("export failed"),
    );
    queueSwiprState({
      savedSwipeSnapshot: savedSwipe,
      slides,
    });

    renderToStaticMarkup(<SwiprPageClient />);

    const manualControlsProps = mocks.manualControlsProps as {
      onGenerateText: () => void;
    };
    const backgroundPanelProps = mocks.backgroundPanelProps as {
      onGenerateAiBackground: () => void;
    };
    const previewPanelProps = mocks.previewPanelProps as {
      onExport: () => void;
    };

    manualControlsProps.onGenerateText();
    backgroundPanelProps.onGenerateAiBackground();
    previewPanelProps.onExport();

    await Promise.resolve();
    await Promise.resolve();

    expect(mocks.generateCliprText).toHaveBeenCalled();
    expect(mocks.generateSwiprBackgroundWithAi).toHaveBeenCalled();
    expect(mocks.swiprExportState.exportCarousel).not.toHaveBeenCalled();
  });
});
