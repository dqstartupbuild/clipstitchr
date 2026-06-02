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
import {
  SWIPR_MAX_SLIDE_COUNT,
  SWIPR_MIN_SLIDE_COUNT,
} from "@/lib/clipstitchr/constants/swiprSlideCountBounds";
import { SWIPR_STATIC_DURATION } from "@/lib/clipstitchr/constants/swiprStaticDuration";
import { generateSwiprBackgroundWithAi } from "@/lib/clipstitchr/client/generateSwiprBackgroundWithAi";
import { generateCliprText } from "@/lib/clipstitchr/client/generateCliprText";
import { seedSwiprBackgroundLibrary } from "@/lib/clipstitchr/client/seedSwiprBackgroundLibrary";
import { useProducts } from "@/lib/clipstitchr/hooks/useProducts";
import { useSwiprExport } from "@/lib/clipstitchr/hooks/useSwiprExport";
import { useSwiprLibrary } from "@/lib/clipstitchr/hooks/useSwiprLibrary";
import type { SwiprBackground } from "@/lib/clipstitchr/types/SwiprBackground";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
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
import { getSwiprSlideBackgroundId } from "@/lib/clipstitchr/utils/getSwiprSlideBackgroundId";
import { getSwiprSwipeName } from "@/lib/clipstitchr/utils/getSwiprSwipeName";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { assignSwiprBackgroundsToSlides } from "@/lib/clipstitchr/utils/assignSwiprBackgroundsToSlides";
import { resizeSwiprSlides } from "@/lib/clipstitchr/utils/resizeSwiprSlides";

const SWIPR_DEV_SEED_BATCH_SIZE = 5;
const isDevelopment = process.env.NODE_ENV === "development";

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
  const [background, setBackground] = useState<SwiprBackground | null>(null);
  const [backgroundSearchQuery, setBackgroundSearchQuery] = useState("");
  const [generationPrompt, setGenerationPrompt] = useState("");
  const [backgroundError, setBackgroundError] = useState<string | null>(null);
  const [isGeneratingAiBackground, setIsGeneratingAiBackground] =
    useState(false);
  const [isSeedingDevBackgrounds, setIsSeedingDevBackgrounds] = useState(false);
  const [isGeneratingAutoText, setIsGeneratingAutoText] = useState(false);
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
  const [autoTextMessage, setAutoTextMessage] = useState<string | null>(null);
  const defaultProductId = products.defaultProductId ?? products.products[0]?.id;
  const defaultSavedProductId = defaultProductId
    ? getSwiprSavedProductOptionValue(defaultProductId)
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
  const activeSlideBackgroundAsset = activeSlide?.backgroundId
    ? swiprLibrary.backgrounds.find(
        (item) => item.id === activeSlide.backgroundId,
      )
    : undefined;
  const activeBackground =
    activeSlide?.backgroundId && background?.id !== activeSlide.backgroundId
      ? activeSlideBackgroundAsset?.blob
        ? getSwiprBackgroundFromAsset({
            ...activeSlideBackgroundAsset,
            blob: activeSlideBackgroundAsset.blob,
          })
        : null
      : background;
  const savedSwipeBackground = savedSwipeSnapshot
    ? swiprLibrary.backgrounds.find(
        (item) => item.id === savedSwipeSnapshot.backgroundId,
      )
    : undefined;
  const savedSwipeBackgroundIds =
    savedSwipeSnapshot && savedSwipeBackground
      ? savedSwipeSnapshot.slides.map((slide) =>
          getSwiprSlideBackgroundId(slide, savedSwipeSnapshot.backgroundId),
        )
      : [];
  const filteredBackgrounds = useMemo(
    () =>
      filterSwiprBackgroundsBySearchQuery(
        swiprLibrary.backgrounds,
        backgroundSearchQuery,
      ),
    [backgroundSearchQuery, swiprLibrary.backgrounds],
  );
  const isCreatingBackground =
    swiprLibrary.isSavingBackground ||
    isGeneratingAiBackground ||
    isSeedingDevBackgrounds;
  const hasSlidePhotos = Boolean(
    background?.id && slides.every((slide) => slide.backgroundId ?? background.id),
  );
  const isSavedExportReady = Boolean(
    savedSwipeSnapshot &&
      savedSwipeBackground &&
      savedSwipeBackgroundIds.every((id) =>
        swiprLibrary.backgrounds.some((item) => item.id === id),
      ),
  );

  const assignSavedBackgroundsToSlides = useCallback(
    (savedBackgrounds: Array<SwiprBackgroundAsset & { blob: Blob }>) => {
      if (!savedBackgrounds.length) {
        return;
      }

      const backgroundIds = savedBackgrounds.map(
        (savedBackground) => savedBackground.id,
      );
      const nextSlideCount = getClampedSwiprSlideCount(
        Math.max(slideCount, backgroundIds.length),
      );

      setSlideCount(nextSlideCount);
      setSlides((currentSlides) => {
        const nextSlides = assignSwiprBackgroundsToSlides(
          resizeSwiprSlides(currentSlides, nextSlideCount),
          backgroundIds,
        );

        setActiveSlideId(nextSlides[0]?.id ?? null);

        return nextSlides;
      });
      setBackground(getSwiprBackgroundFromAsset(savedBackgrounds[0]));
    },
    [slideCount],
  );

  const generateAiBackgrounds = useCallback(async () => {
    if (!selectedSavedProduct) {
      setBackgroundError(
        "Choose a saved Settings product before generating photos.",
      );
      return;
    }

    setIsGeneratingAiBackground(true);
    setBackgroundError(null);
    setAutoTextMessage(null);

    try {
      const savedBackgrounds: Array<SwiprBackgroundAsset & { blob: Blob }> = [];

      for (let index = 0; index < slideCount; index += 1) {
        const generatedBackground = await generateSwiprBackgroundWithAi({
          productContext: effectiveProductContext,
          prompt: generationPrompt,
        });
        const savedBackground = await swiprLibrary.saveBackground({
          blob: generatedBackground.blob,
          generationDetails: generatedBackground.generationDetails,
          originalName: `AI photo ${index + 1}`,
          source: "ai",
        });

        savedBackgrounds.push({
          ...savedBackground,
          blob: generatedBackground.blob,
        });
      }

      assignSavedBackgroundsToSlides(savedBackgrounds);
      setAutoTextMessage(`Generated ${savedBackgrounds.length} photos.`);
    } catch (error) {
      setBackgroundError(
        error instanceof Error
          ? error.message
          : "Unable to generate these photos.",
      );
    } finally {
      setIsGeneratingAiBackground(false);
    }
  }, [
    assignSavedBackgroundsToSlides,
    effectiveProductContext,
    generationPrompt,
    selectedSavedProduct,
    slideCount,
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

  const handleUploadBackgrounds = (files: File[]) => {
    const selectedFiles = files.slice(0, SWIPR_MAX_SLIDE_COUNT);

    if (!selectedFiles.length) {
      return;
    }

    setBackgroundError(null);
    setAutoTextMessage(null);
    void Promise.resolve()
      .then(async () => {
        const savedBackgrounds: Array<SwiprBackgroundAsset & { blob: Blob }> =
          [];

        for (const file of selectedFiles) {
          const savedBackground = await swiprLibrary.saveBackground({
            blob: file,
            originalName: file.name,
            source: "upload",
          });

          savedBackgrounds.push({ ...savedBackground, blob: file });
        }

        assignSavedBackgroundsToSlides(savedBackgrounds);
        setAutoTextMessage(
          files.length > selectedFiles.length
            ? `Uploaded ${selectedFiles.length} photos.`
            : `Uploaded ${savedBackgrounds.length} photos.`,
        );
      })
      .catch((error) => {
        setBackgroundError(
          error instanceof Error
            ? error.message
            : "Unable to save these photos.",
        );
      });
  };

  const handleSeedBackgroundLibrary = () => {
    setIsSeedingDevBackgrounds(true);
    setBackgroundError(null);
    setAutoTextMessage(null);

    void seedSwiprBackgroundLibrary({
      count: SWIPR_DEV_SEED_BATCH_SIZE,
    })
      .then(async (result) => {
        await swiprLibrary.refresh();
        setAutoTextMessage(
          result.saved
            ? `Seeded ${result.saved} backgrounds. ${result.remaining} remaining.`
            : `Seed catalog already complete. ${result.skipped} backgrounds found.`,
        );
      })
      .catch((error) => {
        setBackgroundError(
          error instanceof Error
            ? error.message
            : "Unable to seed Swipr backgrounds.",
        );
      })
      .finally(() => setIsSeedingDevBackgrounds(false));
  };

  const handleSelectBackground = (backgroundAsset: SwiprBackgroundAsset) => {
    setBackgroundError(null);

    void Promise.resolve()
      .then(async () => {
        const blob =
          backgroundAsset.blob ??
          (await swiprLibrary.loadBackgroundBlob(backgroundAsset.id));

        setBackground(getSwiprBackgroundFromAsset({ ...backgroundAsset, blob }));
        setSlides((currentSlides) =>
          activeSlide
            ? currentSlides.map((slide) =>
                slide.id === activeSlide.id
                  ? { ...slide, backgroundId: backgroundAsset.id }
                  : slide,
              )
            : currentSlides,
        );
      })
      .catch((error) => {
        setBackgroundError(
          error instanceof Error
            ? error.message
            : "Unable to load this background.",
        );
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

  const handleGenerateAutoText = () => {
    if (!selectedSavedProductId) {
      setAutoTextMessage(
        "Choose a saved Settings product before generating text.",
      );
      return;
    }

    setIsGeneratingAutoText(true);
    setAutoTextMessage(null);

    void generateCliprText({
      productId: selectedSavedProductId,
      purpose: "swipr",
      slideCount,
    })
      .then((text) => {
        setSlides((currentSlides) =>
          currentSlides.map((slide, index) => ({
            ...slide,
            textOverlay: {
              ...slide.textOverlay,
              text: text.slides[index] ?? slide.textOverlay.text,
            },
          })),
        );
        setAutoTextMessage("Text generated.");
      })
      .catch((error) => {
        setAutoTextMessage(
          error instanceof Error ? error.message : "Unable to generate text.",
        );
      })
      .finally(() => setIsGeneratingAutoText(false));
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
    const slidesForSave = slides.map((slide) => ({
      ...slide,
      backgroundId: slide.backgroundId ?? selectedBackgroundAsset.id,
    }));

    void swiprLibrary
      .saveSwipe({
        id,
        name: getSwiprSwipeName(exportProductName),
        productSourceType: "saved-product",
        productSourceId: selectedSavedProductId,
        productContext: effectiveProductContext,
        productName: exportProductName,
        backgroundId: selectedBackgroundAsset.id,
        slides: slidesForSave,
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

    setBackgroundError(null);

    void Promise.resolve()
      .then(async () => {
        const fallbackBlob =
          savedSwipeBackground.blob ??
          (await swiprLibrary.loadBackgroundBlob(savedSwipeBackground.id));
        const fallbackBackground = getSwiprBackgroundFromAsset({
          ...savedSwipeBackground,
          blob: fallbackBlob,
        });
        const slideBackgrounds: Record<string, SwiprBackground> = {};

        for (const slide of savedSwipeSnapshot.slides) {
          const backgroundId = getSwiprSlideBackgroundId(
            slide,
            savedSwipeSnapshot.backgroundId,
          );
          const backgroundAsset =
            backgroundId === savedSwipeBackground.id
              ? savedSwipeBackground
              : swiprLibrary.backgrounds.find((item) => item.id === backgroundId);

          if (!backgroundAsset) {
            throw new Error("Unable to load this Swipe photo.");
          }

          const blob =
            backgroundId === savedSwipeBackground.id
              ? fallbackBlob
              : backgroundAsset.blob ??
                (await swiprLibrary.loadBackgroundBlob(backgroundAsset.id));

          slideBackgrounds[slide.id] = getSwiprBackgroundFromAsset({
            ...backgroundAsset,
            blob,
          });
        }

        await exporter.exportCarousel({
          background: fallbackBackground,
          slideBackgrounds,
          slides: savedSwipeSnapshot.slides,
          productName: savedSwipeSnapshot.productName,
        });
      })
      .catch((error) => {
        setBackgroundError(
          error instanceof Error
            ? error.message
            : "Unable to load this background.",
        );
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

    let isCancelled = false;

    void Promise.resolve()
      .then(async () => {
        const slidesWithBackgrounds = savedSwipe.slides.map((slide) => ({
          ...slide,
          backgroundId: slide.backgroundId ?? savedSwipe.backgroundId,
        }));
        const backgroundIds = [
          ...new Set([
            savedSwipe.backgroundId,
            ...slidesWithBackgrounds.map((slide) => slide.backgroundId),
          ]),
        ];
        const backgroundBlobs = new Map<string, Blob>();

        for (const backgroundId of backgroundIds) {
          const backgroundAsset =
            backgroundId === savedBackground.id
              ? savedBackground
              : swiprLibrary.backgrounds.find((item) => item.id === backgroundId);

          if (!backgroundAsset) {
            throw new Error("Unable to load this Swipe photo.");
          }

          backgroundBlobs.set(
            backgroundId,
            backgroundAsset.blob ??
              (await swiprLibrary.loadBackgroundBlob(backgroundAsset.id)),
          );
        }
        const blob = backgroundBlobs.get(savedBackground.id);

        if (!blob) {
          throw new Error("Unable to load this background.");
        }

        if (isCancelled) {
          return;
        }

        setSelectedProductId(
          getSwiprSavedProductOptionValue(savedSwipe.productSourceId),
        );
        setSlideCount(slidesWithBackgrounds.length);
        setSlides(slidesWithBackgrounds);
        setActiveSlideId(slidesWithBackgrounds[0]?.id ?? null);
        setBackground(getSwiprBackgroundFromAsset({ ...savedBackground, blob }));
        setSavedSwipeSnapshot(savedSwipe);
        setLoadedSwipeId(savedSwipe.id);
        setSaveMessage("Loaded saved Swipe.");
      })
      .catch((error) => {
        if (!isCancelled) {
          setBackgroundError(
            error instanceof Error
              ? error.message
              : "Unable to load this background.",
          );
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [
    editingSwipeId,
    loadedSwipeId,
    swiprLibrary.backgrounds,
    swiprLibrary.loadBackgroundBlob,
    swiprLibrary.swipes,
    swiprLibrary,
  ]);

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <DashboardPageHeader
          eyebrow="Carousel generator"
          title="Create TikTok carousels"
          description="Build 3-8 vertical images from reusable photos and per-image text overlays."
        />

        {products.error || swiprLibrary.error || backgroundError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {products.error ?? swiprLibrary.error ?? backgroundError}
          </div>
        ) : null}
        {autoTextMessage ? (
          <div className="rounded-lg border border-accent/25 bg-surface-muted p-4 text-sm font-semibold text-accent-dark">
            {autoTextMessage}
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
                  isGeneratingText={isGeneratingAutoText}
                  onProductChange={setSelectedProductId}
                  onGenerateText={handleGenerateAutoText}
                  onSlideCountChange={handleSlideCountChange}
                />
                <SwiprBackgroundPanel
                  background={activeBackground ?? background}
                  backgrounds={filteredBackgrounds}
                  backgroundSearchQuery={backgroundSearchQuery}
                  generationPrompt={generationPrompt}
                  isSaving={swiprLibrary.isSavingBackground}
                  isGeneratingAi={isGeneratingAiBackground}
                  isAiDisabled={!selectedSavedProduct}
                  isSeedingDevBackgrounds={isSeedingDevBackgrounds}
                  slideCount={slideCount}
                  onBackgroundSearchChange={setBackgroundSearchQuery}
                  onGenerationPromptChange={setGenerationPrompt}
                  onLoadBackgroundBlob={swiprLibrary.loadBackgroundBlob}
                  onSelectBackground={handleSelectBackground}
                  onGenerateAiBackground={() => void generateAiBackgrounds()}
                  onSeedBackgroundLibrary={
                    isDevelopment ? handleSeedBackgroundLibrary : undefined
                  }
                  onUploadBackground={handleUploadBackgrounds}
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
              background={activeBackground}
              activeSlide={activeSlide}
              activeSlideIndex={activeSlideIndex}
              saveMessage={saveMessage}
              isSaveDisabled={
                !selectedSavedProduct || !hasSlidePhotos || isCreatingBackground
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
