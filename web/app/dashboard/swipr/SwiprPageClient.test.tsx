import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SwiprPageClient } from "@/app/dashboard/swipr/SwiprPageClient";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";

type ChildrenProps = {
  children?: unknown;
};

const mocks = vi.hoisted(() => ({
  productState: {
    error: null as string | null,
    products: [] as ProductProfile[],
  },
  swiprLibraryState: {
    backgrounds: [] as SwiprBackgroundAsset[],
    error: null as string | null,
    isSavingBackground: false,
    isSavingSwipe: false,
    loadBackgroundBlob: vi.fn(),
    refresh: vi.fn(),
    saveBackground: vi.fn(),
    saveSwipe: vi.fn(),
    swipes: [] as SwiprSwipe[],
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
  textOverlayPanelProps: null as Record<string, unknown> | null,
}));

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

function createProduct(): ProductProfile {
  return {
    audienceDetails: "Founders",
    createdAt: "2026-01-01T00:00:00.000Z",
    id: "product_1",
    inferredPainPoints: [],
    name: "Launch Kit",
    productDetails: "A launch kit",
    updatedAt: "2026-01-01T00:00:00.000Z",
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

describe("SwiprPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      onBackgroundSearchChange: (value: string) => void;
      onGenerateAiBackground: () => void;
      onSelectBackground: (background: SwiprBackgroundAsset) => void;
      onUploadBackground: (file: File) => void;
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
    backgroundPanelProps.onSelectBackground(createBackground());
    backgroundPanelProps.onUploadBackground(
      new File(["background"], "background.jpg", { type: "image/jpeg" }),
    );
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
    });
  });
});
