"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { SwiprBackgroundPanel } from "@/app/_components/swipr/SwiprBackgroundPanel";
import { SwiprPreviewPanel } from "@/app/_components/swipr/SwiprPreviewPanel";
import { SwiprProductPanel } from "@/app/_components/swipr/SwiprProductPanel";
import { SwiprSlideStrip } from "@/app/_components/swipr/SwiprSlideStrip";
import { SwiprTextOverlayPanel } from "@/app/_components/swipr/SwiprTextOverlayPanel";
import { Panel } from "@/app/_components/ui/Panel";
import { SWIPR_MIN_SLIDE_COUNT } from "@/lib/clipstitchr/constants/swiprSlideCountBounds";
import { SWIPR_STATIC_DURATION } from "@/lib/clipstitchr/constants/swiprStaticDuration";
import { generateSwiprBackgroundWithAi } from "@/lib/clipstitchr/client/generateSwiprBackgroundWithAi";
import { useProducts } from "@/lib/clipstitchr/hooks/useProducts";
import { useSwiprExport } from "@/lib/clipstitchr/hooks/useSwiprExport";
import { useSwiprLibrary } from "@/lib/clipstitchr/hooks/useSwiprLibrary";
import type { SwiprBackground } from "@/lib/clipstitchr/types/SwiprBackground";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprBackgroundPresetId } from "@/lib/clipstitchr/types/SwiprBackgroundPresetId";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { clampTextOverlay } from "@/lib/clipstitchr/utils/clampTextOverlay";
import { createSwiprSlides } from "@/lib/clipstitchr/utils/createSwiprSlides";
import { filterSwiprBackgroundsBySearchQuery } from "@/lib/clipstitchr/utils/filterSwiprBackgroundsBySearchQuery";
import { getClampedSwiprSlideCount } from "@/lib/clipstitchr/utils/getClampedSwiprSlideCount";
import { getProductSwiprContext } from "@/lib/clipstitchr/utils/getProductSwiprContext";
import { getSwiprBackgroundFromAsset } from "@/lib/clipstitchr/utils/getSwiprBackgroundFromAsset";
import { getSwiprSavedProductIdFromOptionValue } from "@/lib/clipstitchr/utils/getSwiprSavedProductIdFromOptionValue";
import { getSwiprSavedProductOptionValue } from "@/lib/clipstitchr/utils/getSwiprSavedProductOptionValue";
import { getSwiprSwipeName } from "@/lib/clipstitchr/utils/getSwiprSwipeName";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { resizeSwiprSlides } from "@/lib/clipstitchr/utils/resizeSwiprSlides";

export function SwiprPageClient() {
  const products = useProducts();
  const swiprLibrary = useSwiprLibrary();
  const exporter = useSwiprExport();
  const productOptions = useMemo(
    () =>
      products.products.map((product) => ({
        value: getSwiprSavedProductOptionValue(product.id),
        label: product.name,
      })),
    [products.products],
  );
  const [selectedProductId, setSelectedProductId] = useState<string>();
  const [slideCount, setSlideCount] = useState(SWIPR_MIN_SLIDE_COUNT);
  const [slides, setSlides] = useState(() =>
    createSwiprSlides(SWIPR_MIN_SLIDE_COUNT),
  );
  const [activeSlideId, setActiveSlideId] = useState<string | null>(
    slides[0]?.id ?? null,
  );
  const selectedPresetId: SwiprBackgroundPresetId = "studio";
  const [background, setBackground] = useState<SwiprBackground | null>(null);
  const [backgroundSearchQuery, setBackgroundSearchQuery] = useState("");
  const [backgroundError, setBackgroundError] = useState<string | null>(null);
  const [isGeneratingAiBackground, setIsGeneratingAiBackground] =
    useState(false);
  const [editingSwipeId, setEditingSwipeId] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return new URL(window.location.href).searchParams.get("swipe");
  });
  const [loadedSwipeId, setLoadedSwipeId] = useState<string | null>(null);
  const [savedSwipeSnapshot, setSavedSwipeSnapshot] =
    useState<SwiprSwipe | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const defaultSavedProductId = products.products[0]
    ? getSwiprSavedProductOptionValue(products.products[0].id)
    : "";
  const activeProductId = selectedProductId ?? defaultSavedProductId;
  const selectedSavedProductId =
    getSwiprSavedProductIdFromOptionValue(activeProductId);
  const selectedSavedProduct = selectedSavedProductId
    ? products.products.find((product) => product.id === selectedSavedProductId)
    : undefined;
  const productContext = selectedSavedProduct
    ? getProductSwiprContext(selectedSavedProduct)
    : "";
  const effectiveProductContext = productContext || "Product";
  const exportProductName = selectedSavedProduct?.name ?? "Product";
  const activeSlideIndex = Math.max(
    0,
    slides.findIndex((slide) => slide.id === activeSlideId),
  );
  const activeSlide = slides[activeSlideIndex] ?? null;
  const selectedBackgroundAsset = background?.id
    ? swiprLibrary.backgrounds.find((item) => item.id === background.id)
    : undefined;
  const savedSwipeBackground = savedSwipeSnapshot
    ? swiprLibrary.backgrounds.find(
        (item) => item.id === savedSwipeSnapshot.backgroundId,
      )
    : undefined;
  const filteredBackgrounds = useMemo(
    () =>
      filterSwiprBackgroundsBySearchQuery(
        swiprLibrary.backgrounds,
        backgroundSearchQuery,
      ),
    [backgroundSearchQuery, swiprLibrary.backgrounds],
  );
  const isCreatingBackground =
    swiprLibrary.isSavingBackground || isGeneratingAiBackground;
  const isSavedExportReady = Boolean(savedSwipeSnapshot && savedSwipeBackground);

  const generateAiBackground = useCallback(async () => {
    if (!selectedSavedProduct) {
      setBackgroundError("Choose a saved Settings product before generating a background.");
      return;
    }

    setIsGeneratingAiBackground(true);
    setBackgroundError(null);

    try {
      const blob = await generateSwiprBackgroundWithAi({
        productContext: effectiveProductContext,
        presetId: selectedPresetId,
      });
      const savedBackground = await swiprLibrary.saveBackground({
        blob,
        originalName: "Image 2.0 background",
        source: "ai",
      });

      setBackground(getSwiprBackgroundFromAsset(savedBackground));
    } catch (error) {
      setBackgroundError(
        error instanceof Error
          ? error.message
          : "Unable to generate this background.",
      );
    } finally {
      setIsGeneratingAiBackground(false);
    }
  }, [
    effectiveProductContext,
    selectedPresetId,
    selectedSavedProduct,
    swiprLibrary,
  ]);

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
    void Promise.resolve()
      .then(async () => {
        const savedBackground = await swiprLibrary.saveBackground({
          blob: file,
          originalName: file.name,
          source: "upload",
        });

        setBackground(getSwiprBackgroundFromAsset(savedBackground));
      })
      .catch((error) => {
        setBackgroundError(
          error instanceof Error
            ? error.message
            : "Unable to save this background.",
        );
      });
  };

  const handleSelectBackground = (backgroundAsset: SwiprBackgroundAsset) => {
    setBackground(getSwiprBackgroundFromAsset(backgroundAsset));
    setBackgroundError(null);
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

  const handleSave = () => {
    if (!selectedBackgroundAsset) {
      setSaveMessage("Choose a saved background before saving.");
      return;
    }

    if (!selectedSavedProductId) {
      setSaveMessage("Choose a saved Settings product before saving.");
      return;
    }

    const id = editingSwipeId ?? createId();
    const existingSwipe = swiprLibrary.swipes.find((swipe) => swipe.id === id);

    void swiprLibrary
      .saveSwipe({
        id,
        name: getSwiprSwipeName(exportProductName),
        productSourceType: "saved-product",
        productSourceId: selectedSavedProductId,
        productContext: effectiveProductContext,
        productName: exportProductName,
        backgroundId: selectedBackgroundAsset.id,
        slides,
        createdAt: existingSwipe?.createdAt ?? savedSwipeSnapshot?.createdAt,
      })
      .then((savedSwipe) => {
        setEditingSwipeId(savedSwipe.id);
        setSavedSwipeSnapshot(savedSwipe);
        setSaveMessage("Swipe saved.");

        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);

          url.searchParams.set("swipe", savedSwipe.id);
          window.history.replaceState(null, "", url.toString());
        }
      })
      .catch((error) => {
        setSaveMessage(
          error instanceof Error ? error.message : "Unable to save this Swipe.",
        );
      });
  };

  const handleExport = () => {
    if (!savedSwipeSnapshot || !savedSwipeBackground) {
      return;
    }

    void exporter.exportCarousel({
      background: getSwiprBackgroundFromAsset(savedSwipeBackground),
      slides: savedSwipeSnapshot.slides,
      productName: savedSwipeSnapshot.productName,
    });
  };

  useEffect(() => {
    if (!editingSwipeId || editingSwipeId === loadedSwipeId) {
      return;
    }

    const savedSwipe = swiprLibrary.swipes.find(
      (swipe) => swipe.id === editingSwipeId,
    );
    const savedBackground = savedSwipe
      ? swiprLibrary.backgrounds.find(
          (item) => item.id === savedSwipe.backgroundId,
        )
      : undefined;

    if (!savedSwipe || !savedBackground) {
      return;
    }

    void Promise.resolve().then(() => {
      setSelectedProductId(
        getSwiprSavedProductOptionValue(savedSwipe.productSourceId),
      );
      setSlideCount(savedSwipe.slides.length);
      setSlides(savedSwipe.slides);
      setActiveSlideId(savedSwipe.slides[0]?.id ?? null);
      setBackground(getSwiprBackgroundFromAsset(savedBackground));
      setSavedSwipeSnapshot(savedSwipe);
      setLoadedSwipeId(savedSwipe.id);
      setSaveMessage("Loaded saved Swipe.");
    });
  }, [
    editingSwipeId,
    loadedSwipeId,
    swiprLibrary.backgrounds,
    swiprLibrary.swipes,
  ]);

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <DashboardPageHeader
          eyebrow="Carousel generator"
          title="Create TikTok carousels"
          description="Build 3-8 vertical images from one reusable background and per-image text overlays."
        />

        {products.error || swiprLibrary.error || backgroundError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {products.error ?? swiprLibrary.error ?? backgroundError}
          </div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
          <Panel className="order-2 min-w-0 p-4 xl:order-1">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)] lg:items-start">
              <div className="grid gap-4">
                <SwiprProductPanel
                  productOptions={productOptions}
                  selectedProductId={activeProductId}
                  slideCount={slideCount}
                  onProductChange={setSelectedProductId}
                  onSlideCountChange={handleSlideCountChange}
                />
                <SwiprBackgroundPanel
                  background={background}
                  backgrounds={filteredBackgrounds}
                  backgroundSearchQuery={backgroundSearchQuery}
                  isSaving={swiprLibrary.isSavingBackground}
                  isGeneratingAi={isGeneratingAiBackground}
                  isAiDisabled={!selectedSavedProduct}
                  onBackgroundSearchChange={setBackgroundSearchQuery}
                  onSelectBackground={handleSelectBackground}
                  onGenerateAiBackground={() => void generateAiBackground()}
                  onUploadBackground={handleUploadBackground}
                />
                <SwiprSlideStrip
                  slides={slides}
                  activeSlideId={activeSlide?.id ?? null}
                  onSelectSlide={setActiveSlideId}
                />
              </div>
              <SwiprTextOverlayPanel
                activeSlide={activeSlide}
                activeSlideIndex={activeSlideIndex}
                onChange={handleTextOverlayChange}
              />
            </div>
          </Panel>
          <div className="order-1 min-w-0 w-full max-w-[340px] justify-self-center xl:sticky xl:top-5 xl:order-2 xl:justify-self-end">
            <SwiprPreviewPanel
              background={background}
              activeSlide={activeSlide}
              activeSlideIndex={activeSlideIndex}
              saveMessage={saveMessage}
              isSaveDisabled={
                !selectedSavedProduct || !background?.id || isCreatingBackground
              }
              isSaving={swiprLibrary.isSavingSwipe}
              exportStatus={exporter.status}
              exportProgress={exporter.progress}
              exportError={exporter.error}
              isExportDisabled={!isSavedExportReady || isCreatingBackground}
              onSave={handleSave}
              onExport={handleExport}
              onTextOverlayChange={handleTextOverlayChange}
            />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
