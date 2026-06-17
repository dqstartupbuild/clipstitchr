"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { SwiprBackgroundPanel } from "@/app/_components/swipr/SwiprBackgroundPanel";
import { SwiprAvatarPhotoPanel } from "@/app/_components/swipr/SwiprAvatarPhotoPanel";
import { SwiprBatchControls } from "@/app/_components/swipr/SwiprBatchControls";
import { SwiprManualControls } from "@/app/_components/swipr/SwiprManualControls";
import { SwiprModeToggle } from "@/app/_components/swipr/SwiprModeToggle";
import { SwiprPexelsPanel } from "@/app/_components/swipr/SwiprPexelsPanel";
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
import { generateSwiprDrafts } from "@/lib/clipstitchr/client/generateSwiprDrafts";
import { importPexelsPhotosToSwiprLibrary } from "@/lib/clipstitchr/client/importPexelsPhotosToSwiprLibrary";
import { loadPexelsPhotoBlob } from "@/lib/clipstitchr/client/loadPexelsPhotoBlob";
import { searchPexelsPhotos } from "@/lib/clipstitchr/client/searchPexelsPhotos";
import { usePhotoLibrary } from "@/lib/clipstitchr/hooks/usePhotoLibrary";
import { useProducts } from "@/lib/clipstitchr/hooks/useProducts";
import { useSwiprExport } from "@/lib/clipstitchr/hooks/useSwiprExport";
import { useSwiprLibrary } from "@/lib/clipstitchr/hooks/useSwiprLibrary";
import type { PexelsPhotoResult } from "@/lib/clipstitchr/types/PexelsPhotoResult";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";
import type { SwiprBackground } from "@/lib/clipstitchr/types/SwiprBackground";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprMode } from "@/lib/clipstitchr/types/SwiprMode";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";
import type { SwiprTextGenerationScope } from "@/lib/clipstitchr/types/SwiprTextGenerationScope";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { clampTextOverlay } from "@/lib/clipstitchr/utils/clampTextOverlay";
import { createSwiprSlides } from "@/lib/clipstitchr/utils/createSwiprSlides";
import { createSwiprSlide } from "@/lib/clipstitchr/utils/createSwiprSlide";
import { getProductSwiprContext } from "@/lib/clipstitchr/utils/getProductSwiprContext";
import { getSwiprBackgroundFromAsset } from "@/lib/clipstitchr/utils/getSwiprBackgroundFromAsset";
import { getSwiprSavedProductIdFromOptionValue } from "@/lib/clipstitchr/utils/getSwiprSavedProductIdFromOptionValue";
import { getSwiprSavedProductOptionValue } from "@/lib/clipstitchr/utils/getSwiprSavedProductOptionValue";
import { getSwiprSlideBackgroundId } from "@/lib/clipstitchr/utils/getSwiprSlideBackgroundId";
import { getSwiprLibraryPacks } from "@/lib/clipstitchr/utils/getSwiprLibraryPacks";
import { getSwiprSwipeName } from "@/lib/clipstitchr/utils/getSwiprSwipeName";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { assignSwiprBackgroundsToSlides } from "@/lib/clipstitchr/utils/assignSwiprBackgroundsToSlides";
import { resizeSwiprSlides } from "@/lib/clipstitchr/utils/resizeSwiprSlides";

const PEXELS_SEARCH_PER_PAGE = 12;

export function SwiprPageClient() {
  const photoLibrary = usePhotoLibrary();
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
  const [swiprMode, setSwiprMode] = useState<SwiprMode>(() => {
    if (typeof window === "undefined") {
      return "batch";
    }

    return new URL(window.location.href).searchParams.get("swipe")
      ? "manual"
      : "batch";
  });
  const [slides, setSlides] = useState(() =>
    createSwiprSlides(SWIPR_MIN_SLIDE_COUNT),
  );
  const slideCount = slides.length;
  const [activeSlideId, setActiveSlideId] = useState<string | null>(
    slides[0]?.id ?? null,
  );
  const [background, setBackground] = useState<SwiprBackground | null>(null);
  const [generationPrompt, setGenerationPrompt] = useState("");
  const [pexelsQuery, setPexelsQuery] = useState("");
  const [pexelsImportCount, setPexelsImportCount] = useState(24);
  const [pexelsPhotos, setPexelsPhotos] = useState<PexelsPhotoResult[]>([]);
  const [pexelsPage, setPexelsPage] = useState(1);
  const [hasMorePexelsPhotos, setHasMorePexelsPhotos] = useState(false);
  const [selectedLibraryQueries, setSelectedLibraryQueries] = useState<
    string[]
  >([]);
  const [backgroundError, setBackgroundError] = useState<string | null>(null);
  const [pexelsError, setPexelsError] = useState<string | null>(null);
  const [isGeneratingAiBackground, setIsGeneratingAiBackground] =
    useState(false);
  const [isImportingBackground, setIsImportingBackground] = useState(false);
  const [isImportingPexelsLibrary, setIsImportingPexelsLibrary] =
    useState(false);
  const [isSearchingPexels, setIsSearchingPexels] = useState(false);
  const [isLoadingMorePexels, setIsLoadingMorePexels] = useState(false);
  const [isGeneratingDrafts, setIsGeneratingDrafts] = useState(false);
  const [isGeneratingAutoText, setIsGeneratingAutoText] = useState(false);
  const [draftGenerationCount, setDraftGenerationCount] = useState(3);
  const [textGenerationScope, setTextGenerationScope] =
    useState<SwiprTextGenerationScope>("all");
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
  const activeSlideBackgroundAsset = activeSlide?.backgroundId
    ? swiprLibrary.backgrounds.find(
        (item) => item.id === activeSlide.backgroundId,
      )
    : undefined;
  const activeBackground =
    activeSlide?.backgroundId && activeSlideBackgroundAsset?.blob
      ? getSwiprBackgroundFromAsset({
          ...activeSlideBackgroundAsset,
          blob: activeSlideBackgroundAsset.blob,
        })
      : activeSlide?.backgroundId === background?.id
        ? background
        : null;
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
  const isCreatingBackground =
    swiprLibrary.isSavingBackground ||
    isImportingBackground ||
    isGeneratingAiBackground;
  const hasSlidePhotos =
    slides.length > 0 && slides.every((slide) => Boolean(slide.backgroundId));
  const isSavedExportReady = Boolean(
    savedSwipeSnapshot &&
      savedSwipeBackground &&
      savedSwipeBackgroundIds.every((id) =>
        swiprLibrary.backgrounds.some((item) => item.id === id),
      ),
  );
  const libraryPacks = useMemo(
    () => getSwiprLibraryPacks(swiprLibrary.backgrounds),
    [swiprLibrary.backgrounds],
  );
  const libraryBackgrounds = useMemo(
    () =>
      swiprLibrary.backgrounds.filter((backgroundAsset) => {
        if (
          backgroundAsset.source !== "pexels" ||
          !backgroundAsset.libraryQuery
        ) {
          return false;
        }

        return (
          selectedLibraryQueries.length === 0 ||
          selectedLibraryQueries.includes(backgroundAsset.libraryQuery)
        );
      }),
    [selectedLibraryQueries, swiprLibrary.backgrounds],
  );

  const assignSavedBackgroundsToSlides = useCallback(
    (savedBackgrounds: Array<SwiprBackgroundAsset & { blob: Blob }>) => {
      if (!savedBackgrounds.length) {
        return;
      }

      const backgroundIds = savedBackgrounds.map(
        (savedBackground) => savedBackground.id,
      );
      const nextSlideCount = Math.min(
        SWIPR_MAX_SLIDE_COUNT,
        Math.max(slideCount, backgroundIds.length),
      );

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

  const assignSavedBackgroundToActiveSlide = useCallback(
    (savedBackground: SwiprBackgroundAsset & { blob: Blob }) => {
      setBackground(getSwiprBackgroundFromAsset(savedBackground));
      setSlides((currentSlides) => {
        const nextSlides = currentSlides.length
          ? currentSlides
          : createSwiprSlides(SWIPR_MIN_SLIDE_COUNT);
        const targetSlideId =
          activeSlideId && nextSlides.some((slide) => slide.id === activeSlideId)
            ? activeSlideId
            : (nextSlides[0]?.id ?? null);

        if (!targetSlideId) {
          return nextSlides;
        }

        setActiveSlideId(targetSlideId);

        return nextSlides.map((slide) =>
          slide.id === targetSlideId
            ? { ...slide, backgroundId: savedBackground.id }
            : slide,
        );
      });
    },
    [activeSlideId],
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
      const generatedBackground = await generateSwiprBackgroundWithAi({
        productContext: effectiveProductContext,
        prompt: generationPrompt,
      });
      const savedBackground = await swiprLibrary.saveBackground({
        blob: generatedBackground.blob,
        generationDetails: generatedBackground.generationDetails,
        originalName: `AI photo for slide ${activeSlideIndex + 1}`,
        source: "ai",
      });

      assignSavedBackgroundToActiveSlide({
        ...savedBackground,
        blob: generatedBackground.blob,
      });
      setAutoTextMessage(`Generated photo for slide ${activeSlideIndex + 1}.`);
    } catch (error) {
      setBackgroundError(
        error instanceof Error
          ? error.message
          : "Unable to generate this photo.",
      );
    } finally {
      setIsGeneratingAiBackground(false);
    }
  }, [
    activeSlideIndex,
    assignSavedBackgroundToActiveSlide,
    effectiveProductContext,
    generationPrompt,
    selectedSavedProduct,
    swiprLibrary,
  ]);

  const handleSelectAvatarPhoto = useCallback(
    (photo: PhotoAssetMetadata) => {
      setIsImportingBackground(true);
      setBackgroundError(null);
      setAutoTextMessage(null);

      void Promise.resolve()
        .then(async () => {
          const loadedPhoto = await photoLibrary.loadPhoto(photo.id);

          if (!loadedPhoto) {
            throw new Error("Unable to load this avatar photo.");
          }

          const savedBackground = await swiprLibrary.saveBackground({
            blob: loadedPhoto.blob,
            generationDetails: [
              `Avatar photo: ${photo.name}`,
              photo.avatarDescription
                ? `Avatar notes: ${photo.avatarDescription}`
                : undefined,
            ]
              .filter(Boolean)
              .join("\n"),
            originalName: photo.originalName || photo.name,
            source: "avatar-photo",
          });

          assignSavedBackgroundToActiveSlide({
            ...savedBackground,
            blob: loadedPhoto.blob,
          });
          setAutoTextMessage(`Added avatar photo to slide ${activeSlideIndex + 1}.`);
        })
        .catch((error) => {
          setBackgroundError(
            error instanceof Error
              ? error.message
              : "Unable to add this avatar photo.",
          );
        })
        .finally(() => setIsImportingBackground(false));
    },
    [
      activeSlideIndex,
      assignSavedBackgroundToActiveSlide,
      photoLibrary,
      swiprLibrary,
    ],
  );

  const handlePexelsQueryChange = useCallback((query: string) => {
    setPexelsQuery(query);
    setPexelsPage(1);
    setHasMorePexelsPhotos(false);
    setPexelsPhotos([]);
  }, []);

  const handleSearchPexels = useCallback(() => {
    const nextPage = 1;

    setIsSearchingPexels(true);
    setPexelsError(null);

    void searchPexelsPhotos({
      page: nextPage,
      perPage: PEXELS_SEARCH_PER_PAGE,
      query: pexelsQuery,
    })
      .then((photos) => {
        setPexelsPhotos(photos);
        setPexelsPage(nextPage);
        setHasMorePexelsPhotos(photos.length === PEXELS_SEARCH_PER_PAGE);
        setPexelsError(photos.length ? null : "No matching photos found.");
      })
      .catch((error) => {
        setPexelsError(
          error instanceof Error ? error.message : "Unable to search Pexels.",
        );
      })
      .finally(() => setIsSearchingPexels(false));
  }, [pexelsQuery]);

  const handleLoadMorePexels = useCallback(() => {
    const nextPage = pexelsPage + 1;

    setIsLoadingMorePexels(true);
    setPexelsError(null);

    void searchPexelsPhotos({
      page: nextPage,
      perPage: PEXELS_SEARCH_PER_PAGE,
      query: pexelsQuery,
    })
      .then((photos) => {
        setPexelsPhotos((currentPhotos) => {
          const existingPhotoIds = new Set(
            currentPhotos.map((photo) => photo.id),
          );

          return [
            ...currentPhotos,
            ...photos.filter((photo) => !existingPhotoIds.has(photo.id)),
          ];
        });
        setPexelsPage(nextPage);
        setHasMorePexelsPhotos(photos.length === PEXELS_SEARCH_PER_PAGE);
      })
      .catch((error) => {
        setPexelsError(
          error instanceof Error ? error.message : "Unable to search Pexels.",
        );
      })
      .finally(() => setIsLoadingMorePexels(false));
  }, [pexelsPage, pexelsQuery]);

  const handleSelectPexelsPhoto = useCallback(
    (photo: PexelsPhotoResult) => {
      setIsImportingBackground(true);
      setPexelsError(null);
      setBackgroundError(null);
      setAutoTextMessage(null);

      void Promise.resolve()
        .then(async () => {
          const blob = await loadPexelsPhotoBlob(photo);
          const savedBackground = await swiprLibrary.saveBackground({
            blob,
            generationDetails: [
              `Pexels photo: ${photo.pexelsUrl}`,
              `Photographer: ${photo.photographer}`,
              photo.alt ? `Alt text: ${photo.alt}` : undefined,
            ]
              .filter(Boolean)
              .join("\n"),
            libraryQuery: pexelsQuery.trim() || undefined,
            originalName: `Pexels - ${photo.photographer}`,
            source: "pexels",
          });

          assignSavedBackgroundToActiveSlide({
            ...savedBackground,
            blob,
          });
          setAutoTextMessage(`Added Pexels photo to slide ${activeSlideIndex + 1}.`);
        })
        .catch((error) => {
          setPexelsError(
            error instanceof Error
              ? error.message
              : "Unable to add this Pexels photo.",
          );
        })
        .finally(() => setIsImportingBackground(false));
    },
    [
      activeSlideIndex,
      assignSavedBackgroundToActiveSlide,
      pexelsQuery,
      swiprLibrary,
    ],
  );

  const handleImportPexelsLibraryQuery = useCallback(() => {
    setIsImportingPexelsLibrary(true);
    setPexelsError(null);
    setAutoTextMessage(null);

    void importPexelsPhotosToSwiprLibrary({
      count: pexelsImportCount,
      page: pexelsPage,
      query: pexelsQuery,
    })
      .then((result) => {
        setSelectedLibraryQueries((currentQueries) =>
          currentQueries.includes(result.query)
            ? currentQueries
            : [result.query, ...currentQueries],
        );
        setAutoTextMessage(
          `Imported ${result.imported} Pexels photos for ${result.query}.`,
        );
      })
      .catch((error) => {
        setPexelsError(
          error instanceof Error
            ? error.message
            : "Unable to import Pexels photos.",
        );
      })
      .finally(() => setIsImportingPexelsLibrary(false));
  }, [pexelsImportCount, pexelsPage, pexelsQuery]);

  const handleSelectSavedBackground = useCallback(
    (savedBackground: SwiprBackgroundAsset) => {
      setIsImportingBackground(true);
      setBackgroundError(null);
      setAutoTextMessage(null);

      void swiprLibrary
        .loadBackgroundBlob(savedBackground.id)
        .then((blob) => {
          assignSavedBackgroundToActiveSlide({
            ...savedBackground,
            blob,
          });
          setAutoTextMessage(`Added saved photo to slide ${activeSlideIndex + 1}.`);
        })
        .catch((error) => {
          setBackgroundError(
            error instanceof Error
              ? error.message
              : "Unable to add this saved photo.",
          );
        })
        .finally(() => setIsImportingBackground(false));
    },
    [activeSlideIndex, assignSavedBackgroundToActiveSlide, swiprLibrary],
  );

  const handleAddSlide = () => {
    setSlides((currentSlides) => {
      if (currentSlides.length >= SWIPR_MAX_SLIDE_COUNT) {
        return currentSlides;
      }

      const nextSlide = createSwiprSlide(currentSlides.length);
      const nextSlides = [...currentSlides, nextSlide];

      setActiveSlideId(nextSlide.id);

      return nextSlides;
    });
  };

  const handleRemoveSlide = (slideId: string) => {
    setSlides((currentSlides) => {
      if (currentSlides.length <= 1) {
        return currentSlides;
      }

      const removedSlideIndex = currentSlides.findIndex(
        (slide) => slide.id === slideId,
      );
      const nextSlides = currentSlides.filter((slide) => slide.id !== slideId);

      setActiveSlideId((currentSlideId) => {
        if (currentSlideId && currentSlideId !== slideId) {
          return currentSlideId;
        }

        return (
          nextSlides[Math.max(0, Math.min(removedSlideIndex, nextSlides.length - 1))]
            ?.id ?? null
        );
      });

      return nextSlides;
    });
  };

  const handleCopyActivePhotoToAllSlides = () => {
    if (!activeSlide?.backgroundId) {
      return;
    }

    setSlides((currentSlides) =>
      currentSlides.map((slide) => ({
        ...slide,
        backgroundId: activeSlide.backgroundId,
      })),
    );
    setAutoTextMessage("Copied this photo to every slide.");
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

  const handleGenerateDrafts = () => {
    if (!selectedSavedProductId) {
      setAutoTextMessage(
        "Choose a saved Settings product before generating drafts.",
      );
      return;
    }

    if (!libraryBackgrounds.length) {
      setAutoTextMessage("Import Pexels photos before generating drafts.");
      return;
    }

    setIsGeneratingDrafts(true);
    setAutoTextMessage(null);

    void generateSwiprDrafts({
      count: draftGenerationCount,
      productId: selectedSavedProductId,
      selectedLibraryQueries,
      slideCount: SWIPR_MAX_SLIDE_COUNT,
    })
      .then((result) => {
        setAutoTextMessage(
          `Created ${result.count} editable draft Swipe${
            result.count === 1 ? "" : "s"
          }.`,
        );
      })
      .catch((error) => {
        setAutoTextMessage(
          error instanceof Error
            ? error.message
            : "Unable to generate draft Swipes.",
        );
      })
      .finally(() => setIsGeneratingDrafts(false));
  };

  const handleGenerateAutoText = () => {
    if (!selectedSavedProductId) {
      setAutoTextMessage(
        "Choose a saved Settings product before generating text.",
      );
      return;
    }

    if (textGenerationScope === "selected" && !activeSlide) {
      setAutoTextMessage("Choose a slide before generating text.");
      return;
    }

    setIsGeneratingAutoText(true);
    setAutoTextMessage(null);

    void generateCliprText({
      productId: selectedSavedProductId,
      purpose: "swipr",
      slideCount: textGenerationScope === "selected" ? 1 : slideCount,
      swiprSelectedSlideTextContext:
        textGenerationScope === "selected" && activeSlide
          ? {
              currentSlideText: activeSlide.textOverlay.text,
              nextSlideText: slides[activeSlideIndex + 1]?.textOverlay.text,
              previousSlideText: slides[activeSlideIndex - 1]?.textOverlay.text,
              slideNumber: activeSlideIndex + 1,
              totalSlides: slideCount,
            }
          : undefined,
    })
      .then((text) => {
        setSlides((currentSlides) =>
          currentSlides.map((slide, index) => {
            if (textGenerationScope === "selected") {
              return slide.id === activeSlide?.id
                ? {
                    ...slide,
                    textOverlay: {
                      ...slide.textOverlay,
                      text: text.slides[0] ?? slide.textOverlay.text,
                    },
                  }
                : slide;
            }

            return {
              ...slide,
              textOverlay: {
                ...slide.textOverlay,
                text: text.slides[index] ?? slide.textOverlay.text,
              },
            };
          }),
        );
        setAutoTextMessage(
          textGenerationScope === "selected"
            ? `Text generated for slide ${activeSlideIndex + 1}.`
            : "Text generated.",
        );
      })
      .catch((error) => {
        setAutoTextMessage(
          error instanceof Error ? error.message : "Unable to generate text.",
        );
      })
      .finally(() => setIsGeneratingAutoText(false));
  };

  const handleSave = () => {
    const slidesForSave = slides.map((slide) => ({
      ...slide,
      backgroundId: slide.backgroundId,
    }));
    const fallbackBackgroundId = slidesForSave[0]?.backgroundId;

    if (!fallbackBackgroundId || slidesForSave.some((slide) => !slide.backgroundId)) {
      setSaveMessage("Choose a photo for every slide before saving.");
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
        backgroundId: fallbackBackgroundId,
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
        setSlides(slidesWithBackgrounds);
        setActiveSlideId(slidesWithBackgrounds[0]?.id ?? null);
        setBackground(getSwiprBackgroundFromAsset({ ...savedBackground, blob }));
        setSwiprMode("manual");
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
          description="Build vertical slides with a different photo and text on each one."
        />

        {products.error ||
        swiprLibrary.error ||
        photoLibrary.error ||
        backgroundError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {products.error ??
              swiprLibrary.error ??
              photoLibrary.error ??
              backgroundError}
          </div>
        ) : null}
        {autoTextMessage ? (
          <div className="rounded-lg border border-accent/25 bg-surface-muted p-4 text-sm font-semibold text-accent-dark">
            {autoTextMessage}
          </div>
        ) : null}

        <div
          className={[
            "grid gap-5 xl:items-start",
            swiprMode === "manual"
              ? "xl:grid-cols-[minmax(0,1fr)_340px]"
              : "",
          ].join(" ")}
        >
          <Panel className="order-2 min-w-0 p-4 xl:order-1">
            <div
              className={[
                "grid gap-4",
                swiprMode === "manual"
                  ? "lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)] lg:items-start"
                  : "",
              ].join(" ")}
            >
              <div className="grid gap-4">
                <SwiprModeToggle value={swiprMode} onChange={setSwiprMode} />
                <SwiprProductPanel
                  productOptions={productOptions}
                  selectedProductId={activeProductId}
                  onProductChange={setSelectedProductId}
                />
                {swiprMode === "batch" ? (
                  <SwiprBatchControls
                    draftGenerationCount={draftGenerationCount}
                    isDisabled={!selectedSavedProduct}
                    isGeneratingDrafts={isGeneratingDrafts}
                    onDraftGenerationCountChange={setDraftGenerationCount}
                    onGenerateDrafts={handleGenerateDrafts}
                  />
                ) : (
                  <SwiprManualControls
                    canAddSlide={slideCount < SWIPR_MAX_SLIDE_COUNT}
                    isDisabled={!selectedSavedProduct}
                    isGeneratingText={isGeneratingAutoText}
                    slideCount={slideCount}
                    textGenerationScope={textGenerationScope}
                    onAddSlide={handleAddSlide}
                    onGenerateText={handleGenerateAutoText}
                    onTextGenerationScopeChange={setTextGenerationScope}
                  />
                )}
                {swiprMode === "manual" ? (
                  <>
                    <SwiprBackgroundPanel
                      generationPrompt={generationPrompt}
                      isSaving={swiprLibrary.isSavingBackground}
                      isGeneratingAi={isGeneratingAiBackground}
                      isAiDisabled={!selectedSavedProduct}
                      activeSlideIndex={activeSlideIndex}
                      onGenerationPromptChange={setGenerationPrompt}
                      onGenerateAiBackground={() => void generateAiBackgrounds()}
                      onUploadBackground={handleUploadBackgrounds}
                    />
                    <SwiprAvatarPhotoPanel
                      photos={photoLibrary.photos}
                      onLoadPhoto={photoLibrary.loadPhoto}
                      onSelectPhoto={handleSelectAvatarPhoto}
                    />
                  </>
                ) : null}
                <SwiprPexelsPanel
                  error={pexelsError}
                  hasMorePhotos={hasMorePexelsPhotos}
                  importCount={pexelsImportCount}
                  isLoadingMore={isLoadingMorePexels}
                  isSaving={isImportingBackground}
                  isImportingLibrary={isImportingPexelsLibrary}
                  isSearching={isSearchingPexels}
                  libraryBackgrounds={libraryBackgrounds}
                  libraryPacks={libraryPacks}
                  photos={pexelsPhotos}
                  query={pexelsQuery}
                  selectedLibraryQueries={selectedLibraryQueries}
                  showImportControls={swiprMode === "batch"}
                  showLibraryPacks={swiprMode === "batch"}
                  showSavedLibraryPhotos={swiprMode === "manual"}
                  onImportCountChange={setPexelsImportCount}
                  onImportQuery={handleImportPexelsLibraryQuery}
                  onLoadBackgroundBlob={swiprLibrary.loadBackgroundBlob}
                  onLoadMore={handleLoadMorePexels}
                  onQueryChange={handlePexelsQueryChange}
                  onSearch={handleSearchPexels}
                  onSelectPhoto={
                    swiprMode === "manual" ? handleSelectPexelsPhoto : undefined
                  }
                  onSelectSavedBackground={
                    swiprMode === "manual"
                      ? handleSelectSavedBackground
                      : undefined
                  }
                  onSelectedLibraryQueriesChange={setSelectedLibraryQueries}
                />
                {swiprMode === "manual" ? (
                  <SwiprSlideStrip
                    canCopyActivePhotoToAllSlides={Boolean(
                      activeSlide?.backgroundId && slideCount > 1,
                    )}
                    slides={slides}
                    activeSlideId={activeSlide?.id ?? null}
                    onCopyActivePhotoToAllSlides={handleCopyActivePhotoToAllSlides}
                    onRemoveSlide={handleRemoveSlide}
                    onSelectSlide={setActiveSlideId}
                  />
                ) : null}
              </div>
              {swiprMode === "manual" ? (
                <SwiprTextOverlayPanel
                  activeSlide={activeSlide}
                  activeSlideIndex={activeSlideIndex}
                  onChange={handleTextOverlayChange}
                />
              ) : null}
            </div>
          </Panel>
          {swiprMode === "manual" ? (
            <div className="order-1 min-w-0 w-full max-w-[340px] justify-self-center xl:sticky xl:top-5 xl:order-2 xl:justify-self-end">
              <SwiprPreviewPanel
                background={activeBackground}
                activeSlide={activeSlide}
                activeSlideIndex={activeSlideIndex}
                saveMessage={saveMessage}
                isSaveDisabled={
                  !selectedSavedProduct ||
                  !hasSlidePhotos ||
                  isCreatingBackground
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
          ) : null}
        </div>
      </div>
    </DashboardShell>
  );
}
