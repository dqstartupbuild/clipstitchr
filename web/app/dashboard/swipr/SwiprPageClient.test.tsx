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
  backgroundPanelProps: null as Record<string, unknown> | null,
  generateCliprText: vi.fn(),
  generateSwiprBackgroundWithAi: vi.fn(),
  previewPanelProps: null as Record<string, unknown> | null,
  productPanelProps: null as Record<string, unknown> | null,
  seedSwiprBackgroundLibrary: vi.fn(),
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

vi.mock("@/app/_components/swipr/SwiprBackgroundPanel", () => ({
  SwiprBackgroundPanel: (props: Record<string, unknown>) => {
    mocks.backgroundPanelProps = props;
    return "SwiprBackgroundPanel";
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

vi.mock("@/lib/clipstitchr/hooks/useSwiprLibrary", () => ({
  useSwiprLibrary: () => mocks.swiprLibraryState,
}));

vi.mock("@/lib/clipstitchr/hooks/useSwiprExport", () => ({
  useSwiprExport: () => mocks.swiprExportState,
}));

vi.mock("@/lib/clipstitchr/client/generateCliprText", () => ({
  generateCliprText: mocks.generateCliprText,
}));

vi.mock("@/lib/clipstitchr/client/generateSwiprBackgroundWithAi", () => ({
  generateSwiprBackgroundWithAi: mocks.generateSwiprBackgroundWithAi,
}));

vi.mock("@/lib/clipstitchr/client/seedSwiprBackgroundLibrary", () => ({
  seedSwiprBackgroundLibrary: mocks.seedSwiprBackgroundLibrary,
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

function createBackground(): SwiprBackgroundAsset {
  return {
    createdAt: "2026-01-01T00:00:00.000Z",
    height: 1920,
    id: "background_1",
    imageObject: {
      contentType: "image/jpeg",
      key: "shared/backgrounds/background_1.jpg",
      size: 100,
    },
    mimeType: "image/jpeg",
    name: "Studio",
    size: 100,
    source: "upload",
    tags: ["studio"],
    width: 1080,
  };
}

function createSwipe(overrides: Partial<SwiprSwipe> = {}): SwiprSwipe {
  const slides = createSwiprSlides(3);

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
    isSeedingDevBackgrounds?: boolean;
    loadedSwipeId?: string | null;
    saveMessage?: string | null;
    savedSwipeSnapshot?: SwiprSwipe | null;
    selectedProductId?: string;
    slideCount?: number;
    slides?: ReturnType<typeof createSwiprSlides>;
  } = {},
) {
  const slides = overrides.slides ?? createSwiprSlides(3);

  mocks.stateQueue.push(
    overrides.selectedProductId,
    overrides.slideCount ?? 3,
    slides,
    overrides.activeSlideId ?? slides[0]?.id ?? null,
    overrides.background ?? null,
    "",
    overrides.generationPrompt ?? "",
    overrides.backgroundError ?? null,
    overrides.isGeneratingAiBackground ?? false,
    overrides.isSeedingDevBackgrounds ?? false,
    overrides.isGeneratingAutoText ?? false,
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
    mocks.generateSwiprBackgroundWithAi.mockResolvedValue({
      blob: new Blob(["ai"], { type: "image/jpeg" }),
      generationDetails: {
        prompt: "studio",
      },
    });
    mocks.seedSwiprBackgroundLibrary.mockResolvedValue({
      remaining: 0,
      saved: 5,
      skipped: 0,
    });
    mocks.backgroundPanelProps = null;
    mocks.previewPanelProps = null;
    mocks.productPanelProps = null;
    mocks.slideStripProps = null;
    mocks.stateQueue.length = 0;
    mocks.stateSetters.length = 0;
    mocks.useEffect.mockReset();
    mocks.textOverlayPanelProps = null;
  });

  it("renders the Swipr creation workspace with product and background panels", () => {
    const markup = renderToStaticMarkup(<SwiprPageClient />);

    expect(markup).toContain("Header:Create TikTok carousels");
    expect(markup).toContain("SwiprProductPanel");
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
    renderToStaticMarkup(<SwiprPageClient />);

    const productPanelProps = mocks.productPanelProps as {
      onGenerateText: () => void;
      onProductChange: (value: string) => void;
      onSlideCountChange: (count: number) => void;
    };
    const backgroundPanelProps = mocks.backgroundPanelProps as {
      onGenerationPromptChange: (value: string) => void;
      onBackgroundSearchChange: (value: string) => void;
      onGenerateAiBackground: () => void;
      onSelectBackground: (background: SwiprBackgroundAsset) => void;
      onUploadBackground: (files: File[]) => void;
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
    productPanelProps.onSlideCountChange(8);
    productPanelProps.onGenerateText();
    backgroundPanelProps.onBackgroundSearchChange("studio");
    backgroundPanelProps.onGenerationPromptChange("sunny counter");
    backgroundPanelProps.onSelectBackground(createBackground());
    backgroundPanelProps.onUploadBackground([
      new File(["background"], "background.jpg", { type: "image/jpeg" }),
    ]);
    backgroundPanelProps.onGenerateAiBackground();
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
    expect(mocks.swiprLibraryState.loadBackgroundBlob).toHaveBeenCalledWith(
      "background_1",
    );
    expect(mocks.swiprLibraryState.saveBackground).toHaveBeenCalled();
    expect(mocks.generateSwiprBackgroundWithAi).toHaveBeenCalledWith({
      productContext: expect.stringContaining("Launch Kit"),
      prompt: "",
    });
  });

  it("covers disabled product and background error branches", async () => {
    mocks.productState.products = [];
    renderToStaticMarkup(<SwiprPageClient />);

    const productPanelProps = mocks.productPanelProps as {
      onGenerateText: () => void;
    };
    const backgroundPanelProps = mocks.backgroundPanelProps as {
      onGenerateAiBackground: () => void;
      onSelectBackground: (background: SwiprBackgroundAsset) => void;
      onUploadBackground: (files: File[]) => void;
    };
    const previewPanelProps = mocks.previewPanelProps as {
      onSave: () => void;
    };

    productPanelProps.onGenerateText();
    backgroundPanelProps.onGenerateAiBackground();
    previewPanelProps.onSave();

    mocks.swiprLibraryState.loadBackgroundBlob.mockRejectedValueOnce(
      new Error("background missing"),
    );
    backgroundPanelProps.onSelectBackground({
      ...createBackground(),
      blob: undefined,
    });

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
    const slides = createSwiprSlides(3);
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
    const slides = createSwiprSlides(3);
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
    const slides = createSwiprSlides(3);
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
    const slides = createSwiprSlides(3);
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
    const slides = createSwiprSlides(3);
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

    const productPanelProps = mocks.productPanelProps as {
      onGenerateText: () => void;
    };
    const backgroundPanelProps = mocks.backgroundPanelProps as {
      onGenerateAiBackground: () => void;
    };
    const previewPanelProps = mocks.previewPanelProps as {
      onExport: () => void;
    };

    productPanelProps.onGenerateText();
    backgroundPanelProps.onGenerateAiBackground();
    previewPanelProps.onExport();

    await Promise.resolve();
    await Promise.resolve();

    expect(mocks.generateCliprText).toHaveBeenCalled();
    expect(mocks.generateSwiprBackgroundWithAi).toHaveBeenCalled();
    expect(mocks.swiprExportState.exportCarousel).not.toHaveBeenCalled();
  });
});
