"use client";

import { useCallback, useMemo, useState } from "react";
import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { SwiprBackgroundPanel } from "@/app/_components/swipr/SwiprBackgroundPanel";
import { SwiprExportPanel } from "@/app/_components/swipr/SwiprExportPanel";
import { SwiprPreviewPanel } from "@/app/_components/swipr/SwiprPreviewPanel";
import { SwiprProductPanel } from "@/app/_components/swipr/SwiprProductPanel";
import { SwiprSlideStrip } from "@/app/_components/swipr/SwiprSlideStrip";
import { SwiprTextOverlayPanel } from "@/app/_components/swipr/SwiprTextOverlayPanel";
import { SWIPR_BACKGROUND_PRESETS } from "@/lib/clipstitchr/constants/swiprBackgroundPresets";
import { SWIPR_CUSTOM_PRODUCT_ID } from "@/lib/clipstitchr/constants/swiprCustomProductId";
import { SWIPR_MIN_SLIDE_COUNT } from "@/lib/clipstitchr/constants/swiprSlideCountBounds";
import { SWIPR_STATIC_DURATION } from "@/lib/clipstitchr/constants/swiprStaticDuration";
import { generateSwiprBackgroundWithAi } from "@/lib/clipstitchr/client/generateSwiprBackgroundWithAi";
import { useClipLibrary } from "@/lib/clipstitchr/hooks/useClipLibrary";
import { useSwiprExport } from "@/lib/clipstitchr/hooks/useSwiprExport";
import { useWorkspaceSettings } from "@/lib/clipstitchr/hooks/useWorkspaceSettings";
import { createSwiprBackgroundBlob } from "@/lib/clipstitchr/media/createSwiprBackgroundBlob";
import type { SwiprBackground } from "@/lib/clipstitchr/types/SwiprBackground";
import type { SwiprBackgroundPresetId } from "@/lib/clipstitchr/types/SwiprBackgroundPresetId";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { clampTextOverlay } from "@/lib/clipstitchr/utils/clampTextOverlay";
import { createSwiprSlides } from "@/lib/clipstitchr/utils/createSwiprSlides";
import { filterClipsByType } from "@/lib/clipstitchr/utils/filterClipsByType";
import { getClampedSwiprSlideCount } from "@/lib/clipstitchr/utils/getClampedSwiprSlideCount";
import { resizeSwiprSlides } from "@/lib/clipstitchr/utils/resizeSwiprSlides";

export function SwiprPageClient() {
  const library = useClipLibrary();
  const workspaceSettings = useWorkspaceSettings();
  const exporter = useSwiprExport();
  const demoClips = useMemo(
    () => filterClipsByType(library.clips, "demo"),
    [library.clips],
  );
  const productOptions = useMemo(
    () => [
      { value: SWIPR_CUSTOM_PRODUCT_ID, label: "Custom product" },
      ...demoClips.map((clip) => ({ value: clip.id, label: clip.name })),
    ],
    [demoClips],
  );
  const [selectedProductId, setSelectedProductId] = useState(
    SWIPR_CUSTOM_PRODUCT_ID,
  );
  const [customProductContext, setCustomProductContext] = useState("");
  const [slideCount, setSlideCount] = useState(SWIPR_MIN_SLIDE_COUNT);
  const [slides, setSlides] = useState(() =>
    createSwiprSlides(SWIPR_MIN_SLIDE_COUNT),
  );
  const [activeSlideId, setActiveSlideId] = useState<string | null>(
    slides[0]?.id ?? null,
  );
  const [selectedPresetId, setSelectedPresetId] =
    useState<SwiprBackgroundPresetId>("studio");
  const [background, setBackground] = useState<SwiprBackground | null>(null);
  const [backgroundError, setBackgroundError] = useState<string | null>(null);
  const [isGeneratingBackground, setIsGeneratingBackground] = useState(false);
  const [isGeneratingAiBackground, setIsGeneratingAiBackground] =
    useState(false);
  const selectedDemo = useMemo(
    () => demoClips.find((clip) => clip.id === selectedProductId),
    [demoClips, selectedProductId],
  );
  const workspaceProductContext =
    workspaceSettings.settings?.productDetails.trim() ?? "";
  const workspaceAudienceContext =
    workspaceSettings.settings?.audienceDetails.trim() ?? "";
  const workspaceSwiprContext = [
    workspaceProductContext,
    workspaceAudienceContext
      ? `Audience: ${workspaceAudienceContext}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
  const productContext =
    selectedProductId === SWIPR_CUSTOM_PRODUCT_ID
      ? customProductContext.trim() || workspaceSwiprContext
      : (selectedDemo?.name ?? "");
  const effectiveProductContext = productContext || "Product";
  const exportProductName =
    selectedProductId === SWIPR_CUSTOM_PRODUCT_ID
      ? customProductContext.trim() ||
        workspaceProductContext.slice(0, 80) ||
        "Product"
      : (selectedDemo?.name ?? "Product");
  const activeSlideIndex = Math.max(
    0,
    slides.findIndex((slide) => slide.id === activeSlideId),
  );
  const activeSlide = slides[activeSlideIndex] ?? null;
  const isCreatingBackground =
    isGeneratingBackground || isGeneratingAiBackground;

  const generateBackground = useCallback(async (presetId = selectedPresetId) => {
    const preset =
      SWIPR_BACKGROUND_PRESETS.find((item) => item.id === presetId) ??
      SWIPR_BACKGROUND_PRESETS[0];

    setIsGeneratingBackground(true);
    setBackgroundError(null);

    try {
      const blob = await createSwiprBackgroundBlob(
        effectiveProductContext,
        preset.id,
      );

      setBackground({
        name: `${preset.label} background`,
        blob,
        source: "preset",
      });
    } catch (error) {
      setBackgroundError(
        error instanceof Error
          ? error.message
          : "Unable to generate this background.",
      );
    } finally {
      setIsGeneratingBackground(false);
    }
  }, [effectiveProductContext, selectedPresetId]);

  const generateAiBackground = useCallback(async () => {
    setIsGeneratingAiBackground(true);
    setBackgroundError(null);

    try {
      const blob = await generateSwiprBackgroundWithAi({
        productContext: effectiveProductContext,
        presetId: selectedPresetId,
      });

      setBackground({
        name: "Image 2.0 background",
        blob,
        source: "ai",
      });
    } catch (error) {
      setBackgroundError(
        error instanceof Error
          ? error.message
          : "Unable to generate this background.",
      );
    } finally {
      setIsGeneratingAiBackground(false);
    }
  }, [effectiveProductContext, selectedPresetId]);

  const handleSlideCountChange = (count: number) => {
    const nextCount = getClampedSwiprSlideCount(count);

    setSlideCount(nextCount);
    setSlides((currentSlides) => {
      const nextSlides = resizeSwiprSlides(currentSlides, nextCount);

      setActiveSlideId((currentSlideId) =>
        currentSlideId && nextSlides.some((slide) => slide.id === currentSlideId)
          ? currentSlideId
          : (nextSlides[0]?.id ?? null),
      );

      return nextSlides;
    });
  };

  const handleUploadBackground = (file: File) => {
    setBackgroundError(null);
    setBackground({
      name: file.name,
      blob: file,
      source: "upload",
    });
  };

  const handleTextOverlayChange = (textOverlay: TextOverlay) => {
    if (!activeSlide) {
      return;
    }

    setSlides((currentSlides) =>
      currentSlides.map((slide) =>
        slide.id === activeSlide.id
          ? {
              ...slide,
              textOverlay: clampTextOverlay(
                textOverlay,
                SWIPR_STATIC_DURATION,
              ),
            }
          : slide,
      ),
    );
  };

  const handleExport = () => {
    void exporter.exportCarousel({
      background,
      slides,
      productName: exportProductName,
    });
  };

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <DashboardPageHeader
          eyebrow="Carousel generator"
          title="Create TikTok carousels"
          description="Build 3-8 vertical images from one reusable background and per-image text overlays."
        />

        {library.error || workspaceSettings.error || backgroundError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {library.error ?? workspaceSettings.error ?? backgroundError}
          </div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[390px_minmax(0,1fr)] xl:items-start">
          <div className="order-2 flex min-w-0 flex-col gap-4 xl:order-1">
            <SwiprProductPanel
              productOptions={productOptions}
              selectedProductId={selectedProductId}
              customProductContext={customProductContext}
              slideCount={slideCount}
              onProductChange={setSelectedProductId}
              onCustomProductContextChange={setCustomProductContext}
              onSlideCountChange={handleSlideCountChange}
            />
            <SwiprBackgroundPanel
              background={background}
              selectedPresetId={selectedPresetId}
              isGenerating={isGeneratingBackground}
              isGeneratingAi={isGeneratingAiBackground}
              onPresetChange={(presetId) => {
                setSelectedPresetId(presetId);
                void generateBackground(presetId);
              }}
              onGenerateAiBackground={() => void generateAiBackground()}
              onGenerateBackground={() => void generateBackground()}
              onUploadBackground={handleUploadBackground}
            />
            <SwiprSlideStrip
              slides={slides}
              activeSlideId={activeSlide?.id ?? null}
              onSelectSlide={setActiveSlideId}
            />
            <SwiprTextOverlayPanel
              activeSlide={activeSlide}
              activeSlideIndex={activeSlideIndex}
              onChange={handleTextOverlayChange}
            />
            <SwiprExportPanel
              status={exporter.status}
              progress={exporter.progress}
              error={exporter.error}
              isDisabled={!background || isCreatingBackground}
              onExport={handleExport}
            />
          </div>
          <div className="order-1 min-w-0 xl:sticky xl:top-5 xl:order-2">
            <SwiprPreviewPanel
              background={background}
              activeSlide={activeSlide}
              activeSlideIndex={activeSlideIndex}
              onTextOverlayChange={handleTextOverlayChange}
            />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
