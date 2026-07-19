"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardAlert } from "@/app/_components/dashboard/DashboardAlert";
import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { SwiprBackgroundPanel } from "@/app/_components/swipr/SwiprBackgroundPanel";
import { SwiprAvatarPhotoPanel } from "@/app/_components/swipr/SwiprAvatarPhotoPanel";
import { SwiprBatchControls } from "@/app/_components/swipr/SwiprBatchControls";
import { SwiprEditModeNotice } from "@/app/_components/swipr/SwiprEditModeNotice";
import { SwiprManualControls } from "@/app/_components/swipr/SwiprManualControls";
import { SwiprModeToggle } from "@/app/_components/swipr/SwiprModeToggle";
import { SwiprPexelsPanel } from "@/app/_components/swipr/SwiprPexelsPanel";
import { SwiprPreviewPanel } from "@/app/_components/swipr/SwiprPreviewPanel";
import { SwiprSocialCaptionField } from "@/app/_components/swipr/SwiprSocialCaptionField";
import { SwiprSlideStrip } from "@/app/_components/swipr/SwiprSlideStrip";
import { SwiprTextOverlayPanel } from "@/app/_components/swipr/SwiprTextOverlayPanel";
import { Panel } from "@/app/_components/ui/Panel";
import { StickyPreviewColumn } from "@/app/_components/workflow/StickyPreviewColumn";
import { WorkflowLayout } from "@/app/_components/workflow/WorkflowLayout";
import { SWIPR_BATCH_DRAFT_COUNT } from "@/lib/clipstitchr/constants/swiprBatchDraftCount";
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
import { SWIPR_PEXELS_IMPORT_LIMIT } from "@/lib/clipstitchr/constants/swiprPexelsImportLimit";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";
import { usePhotoLibrary } from "@/lib/clipstitchr/hooks/usePhotoLibrary";
import { useSwiprExport } from "@/lib/clipstitchr/hooks/useSwiprExport";
import { useSwiprLibrary } from "@/lib/clipstitchr/hooks/useSwiprLibrary";
import type { PexelsPhotoResult } from "@/lib/clipstitchr/types/PexelsPhotoResult";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";
import type { SwiprBackground } from "@/lib/clipstitchr/types/SwiprBackground";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprCallToActionStyle } from "@/lib/clipstitchr/types/SwiprCallToActionStyle";
import type { SwiprMode } from "@/lib/clipstitchr/types/SwiprMode";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";
import type { SwiprTextGenerationScope } from "@/lib/clipstitchr/types/SwiprTextGenerationScope";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { clampTextOverlay } from "@/lib/clipstitchr/utils/clampTextOverlay";
import { createSwiprSlides } from "@/lib/clipstitchr/utils/createSwiprSlides";
import { createSwiprSlide } from "@/lib/clipstitchr/utils/createSwiprSlide";
import { getProductSwiprContext } from "@/lib/clipstitchr/utils/getProductSwiprContext";
import { getSwiprBackgroundFromAsset } from "@/lib/clipstitchr/utils/getSwiprBackgroundFromAsset";
import { getSwiprSlideBackgroundId } from "@/lib/clipstitchr/utils/getSwiprSlideBackgroundId";
import { getAccountSwiprLibraryPacks } from "@/lib/clipstitchr/utils/getAccountSwiprLibraryPacks";
import { createSwiprSwipeSocialDescription } from "@/lib/clipstitchr/utils/createSwiprSwipeSocialDescription";
import { getSwiprSwipeName } from "@/lib/clipstitchr/utils/getSwiprSwipeName";
import { getSwiprSwipeEditHref } from "@/lib/clipstitchr/utils/getSwiprSwipeEditHref";
import { getImportedPexelsPhotoIds } from "@/lib/clipstitchr/utils/getImportedPexelsPhotoIds";
import { normalizeSwiprLibraryQueryKey } from "@/lib/clipstitchr/utils/normalizeSwiprLibraryQueryKey";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { assignSwiprBackgroundsToSlides } from "@/lib/clipstitchr/utils/assignSwiprBackgroundsToSlides";
import { resizeSwiprSlides } from "@/lib/clipstitchr/utils/resizeSwiprSlides";

const PEXELS_SEARCH_PER_PAGE = 12;

export function SwiprPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedSwipeId = searchParams.get("swipe")?.trim() || null;
  const photoLibrary = usePhotoLibrary();
  const products = useDashboardProduct();
  const swiprLibrary = useSwiprLibrary();
  const exporter = useSwiprExport();
  const [swiprMode, setSwiprMode] = useState<SwiprMode>(() => {
    return requestedSwipeId ? "manual" : "batch";
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
  const [swiprCallToActionStyle, setSwiprCallToActionStyle] =
    useState<SwiprCallToActionStyle>("any");
  const [swiprCreativeContext, setSwiprCreativeContext] = useState("");
  const [textGenerationScope, setTextGenerationScope] =
    useState<SwiprTextGenerationScope>("all");
  const editingSwipeId = requestedSwipeId;
  const [loadedSwipeId, setLoadedSwipeId] = useState<string | null>(null);
  const [savedSwipeSnapshot, setSavedSwipeSnapshot] =
    useState<SwiprSwipe | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [autoTextMessage, setAutoTextMessage] = useState<string | null>(null);
  const [socialCaption, setSocialCaption] = useState("");
  const [socialDescription, setSocialDescription] = useState("");
  const [socialCopyMessage, setSocialCopyMessage] = useState<string | null>(
    null,
  );
  const selectedSavedProduct = products.activeProduct;
  const selectedSavedProductId = selectedSavedProduct?.id;
  const productContext = selectedSavedProduct
    ? getProductSwiprContext(selectedSavedProduct)
    : "";
  const effectiveProductContext = productContext || "Product";
  const exportProductName = selectedSavedProduct?.name ?? "Product";
  const swiprBackgrounds = swiprLibrary.backgrounds;
  const loadLibraryBackgroundAsset = swiprLibrary.loadBackgroundAsset;
  const loadLibraryBackgroundBlob = swiprLibrary.loadBackgroundBlob;
  const activeSlideIndex = Math.max(
    0,
    slides.findIndex((slide) => slide.id === activeSlideId),
  );
  const activeSlide = slides[activeSlideIndex] ?? null;
  const isEditingSavedSwipe = Boolean(editingSwipeId);
  const activeSwiprMode = isEditingSavedSwipe ? "manual" : swiprMode;
  const hasEditSwipeRecord = Boolean(
    editingSwipeId &&
    (savedSwipeSnapshot?.id === editingSwipeId ||
      swiprLibrary.swipes.some((swipe) => swipe.id === editingSwipeId)),
  );
  const isEditSwipeMissing = Boolean(
    editingSwipeId && swiprLibrary.isLoading === false && !hasEditSwipeRecord,
  );
  const isEditSwipeLoading = Boolean(
    editingSwipeId &&
    !isEditSwipeMissing &&
    editingSwipeId !== loadedSwipeId &&
    savedSwipeSnapshot?.id !== editingSwipeId,
  );
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
  const savedSwipeBackgroundIds = savedSwipeSnapshot
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
    savedSwipeSnapshot && savedSwipeBackgroundIds.length > 0,
  );
  const libraryPacks = useMemo(
    () => getAccountSwiprLibraryPacks(swiprLibrary.globalPexelsPacks),
    [swiprLibrary.globalPexelsPacks],
  );
  const allPexelsLibraryBackgrounds = useMemo(
    () =>
      swiprLibrary.backgrounds.filter(
        (backgroundAsset) =>
          backgroundAsset.source === "pexels" &&
          Boolean(backgroundAsset.libraryQuery),
      ),
    [swiprLibrary.backgrounds],
  );
  const selectedLibraryQueryKeys = useMemo(
    () =>
      selectedLibraryQueries.map((libraryQuery) =>
        normalizeSwiprLibraryQueryKey(libraryQuery),
      ),
    [selectedLibraryQueries],
  );
  const selectedLibraryBackgrounds = useMemo(
    () =>
      allPexelsLibraryBackgrounds.filter((backgroundAsset) => {
        return (
          selectedLibraryQueryKeys.length > 0 &&
          selectedLibraryQueryKeys.includes(
            normalizeSwiprLibraryQueryKey(backgroundAsset.libraryQuery),
          )
        );
      }),
    [allPexelsLibraryBackgrounds, selectedLibraryQueryKeys],
  );
  const importedPexelsPhotoIds = useMemo(
    () => getImportedPexelsPhotoIds(swiprLibrary.backgrounds),
    [swiprLibrary.backgrounds],
  );
  const visiblePexelsPhotos = useMemo(
    () => pexelsPhotos.filter((photo) => !importedPexelsPhotoIds.has(photo.id)),
    [importedPexelsPhotoIds, pexelsPhotos],
  );

  const loadSwiprBackgroundAsset = useCallback(
    async (id: string) => {
      const backgroundAsset =
        swiprBackgrounds.find((item) => item.id === id) ??
        (await loadLibraryBackgroundAsset(id));

      if (!backgroundAsset) {
        throw new Error("Unable to load this Swipe photo.");
      }

      const blob =
        backgroundAsset.blob ??
        (await loadLibraryBackgroundBlob(backgroundAsset.id));

      return {
        ...backgroundAsset,
        blob,
      };
    },
    [loadLibraryBackgroundAsset, loadLibraryBackgroundBlob, swiprBackgrounds],
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
          activeSlideId &&
          nextSlides.some((slide) => slide.id === activeSlideId)
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
        "Create or choose a product before generating photos.",
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
          setAutoTextMessage(
            `Added avatar photo to slide ${activeSlideIndex + 1}.`,
          );
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
      .then(({ hasMore, photos }) => {
        setPexelsPhotos(photos);
        setPexelsPage(nextPage);
        setHasMorePexelsPhotos(hasMore);
        setPexelsError(
          photos.some((photo) => !importedPexelsPhotoIds.has(photo.id))
            ? null
            : "No new photos found. Try loading more.",
        );
      })
      .catch((error) => {
        setPexelsError(
          error instanceof Error ? error.message : "Unable to search Pexels.",
        );
      })
      .finally(() => setIsSearchingPexels(false));
  }, [importedPexelsPhotoIds, pexelsQuery]);

  const handleLoadMorePexels = useCallback(() => {
    if (pexelsPhotos.length >= SWIPR_PEXELS_IMPORT_LIMIT) {
      setHasMorePexelsPhotos(false);
      return;
    }

    const nextPage = pexelsPage + 1;

    setIsLoadingMorePexels(true);
    setPexelsError(null);

    void searchPexelsPhotos({
      page: nextPage,
      perPage: PEXELS_SEARCH_PER_PAGE,
      query: pexelsQuery,
    })
      .then(({ hasMore, photos }) => {
        const existingPhotoIds = new Set(pexelsPhotos.map((photo) => photo.id));
        const nextPhotos = [
          ...pexelsPhotos,
          ...photos.filter((photo) => !existingPhotoIds.has(photo.id)),
        ].slice(0, SWIPR_PEXELS_IMPORT_LIMIT);

        setPexelsPhotos(nextPhotos);
        setPexelsPage(nextPage);
        setHasMorePexelsPhotos(
          hasMore && nextPhotos.length < SWIPR_PEXELS_IMPORT_LIMIT,
        );
      })
      .catch((error) => {
        setPexelsError(
          error instanceof Error ? error.message : "Unable to search Pexels.",
        );
      })
      .finally(() => setIsLoadingMorePexels(false));
  }, [pexelsPage, pexelsPhotos, pexelsQuery]);

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
            pexelsPhotoId: photo.id,
            source: "pexels",
          });

          assignSavedBackgroundToActiveSlide({
            ...savedBackground,
            blob,
          });
          setAutoTextMessage(
            `Added Pexels photo to slide ${activeSlideIndex + 1}.`,
          );
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
    if (!visiblePexelsPhotos.length) {
      setPexelsError("No new loaded photos to import.");
      return;
    }

    setIsImportingPexelsLibrary(true);
    setPexelsError(null);
    setAutoTextMessage(null);

    void importPexelsPhotosToSwiprLibrary({
      page: pexelsPage,
      photos: visiblePexelsPhotos,
      query: pexelsQuery,
    })
      .then((result) => {
        const importedPhotoIds = new Set(result.importedPexelsPhotoIds);

        setPexelsPhotos((currentPhotos) =>
          currentPhotos.filter((photo) => !importedPhotoIds.has(photo.id)),
        );
        setSelectedLibraryQueries((currentQueries) =>
          currentQueries.includes(result.query)
            ? currentQueries
            : [result.query, ...currentQueries],
        );
        setAutoTextMessage(
          result.imported
            ? `Imported ${result.imported} Pexels photos for ${result.query}.`
            : `No new Pexels photos to import for ${result.query}.`,
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
  }, [pexelsPage, pexelsQuery, visiblePexelsPhotos]);

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
          setAutoTextMessage(
            `Added saved photo to slide ${activeSlideIndex + 1}.`,
          );
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
          nextSlides[
            Math.max(0, Math.min(removedSlideIndex, nextSlides.length - 1))
          ]?.id ?? null
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

  const handleCreateNewSwipe = useCallback(() => {
    const nextSlides = createSwiprSlides(SWIPR_MIN_SLIDE_COUNT);

    setSwiprMode("batch");
    setSlides(nextSlides);
    setActiveSlideId(nextSlides[0]?.id ?? null);
    setBackground(null);
    setLoadedSwipeId(null);
    setSavedSwipeSnapshot(null);
    setSaveMessage(null);
    setAutoTextMessage(null);
    setSocialCaption("");
    setSocialDescription("");
    setSocialCopyMessage(null);
    setBackgroundError(null);
  }, []);

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
              textOverlay: clampTextOverlay(textOverlay, SWIPR_STATIC_DURATION),
            }
          : slide,
      ),
    );
  };

  const handleGenerateDrafts = () => {
    if (!selectedSavedProductId) {
      setAutoTextMessage(
        "Create or choose a product before generating drafts.",
      );
      return;
    }

    if (!selectedLibraryQueries.length) {
      setAutoTextMessage(
        "Choose at least one Pexels pack before generating drafts.",
      );
      return;
    }

    const selectedLibraryPackKeys = new Set(selectedLibraryQueryKeys);
    const hasSelectedLibraryPhotos = libraryPacks.some(
      (pack) =>
        selectedLibraryPackKeys.has(
          normalizeSwiprLibraryQueryKey(pack.name),
        ) && pack.count > 0,
    );

    if (!hasSelectedLibraryPhotos) {
      setAutoTextMessage("Choose a Pexels pack with saved photos.");
      return;
    }

    setIsGeneratingDrafts(true);
    setAutoTextMessage(null);

    void generateSwiprDrafts({
      callToActionStyle: swiprCallToActionStyle,
      count: SWIPR_BATCH_DRAFT_COUNT,
      creativeContext: swiprCreativeContext,
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
      setAutoTextMessage("Create or choose a product before generating text.");
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
      swiprCallToActionStyle,
      swiprCreativeContext,
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
        if (textGenerationScope === "all") {
          setSocialCaption(text.socialCaption ?? "");
          setSocialDescription(text.description ?? "");
          setSocialCopyMessage(null);
        }
        setAutoTextMessage(
          textGenerationScope === "selected"
            ? `Text generated for slide ${activeSlideIndex + 1}.`
            : "Text and post copy generated.",
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

    if (
      !fallbackBackgroundId ||
      slidesForSave.some((slide) => !slide.backgroundId)
    ) {
      setSaveMessage("Choose a photo for every slide before saving.");
      return;
    }

    if (!selectedSavedProductId) {
      setSaveMessage("Create or choose a product before saving.");
      return;
    }

    const id = editingSwipeId ?? createId();
    const existingSwipe = swiprLibrary.swipes.find((swipe) => swipe.id === id);
    const socialCopySource = savedSwipeSnapshot ?? existingSwipe;
    const savedSocialCaption = socialCaption.trim();

    void swiprLibrary
      .saveSwipe({
        id,
        caption: savedSocialCaption ? socialCopySource?.caption : undefined,
        description: savedSocialCaption
          ? socialDescription || socialCopySource?.description
          : undefined,
        name: getSwiprSwipeName(exportProductName),
        productSourceType: "saved-product",
        productSourceId: selectedSavedProductId,
        productContext: effectiveProductContext,
        productName: exportProductName,
        backgroundId: fallbackBackgroundId,
        hashtags: savedSocialCaption ? socialCopySource?.hashtags : undefined,
        rationale: socialCopySource?.rationale,
        socialCaption: savedSocialCaption || undefined,
        slides: slidesForSave,
        createdAt: existingSwipe?.createdAt ?? savedSwipeSnapshot?.createdAt,
      })
      .then((savedSwipe) => {
        setSavedSwipeSnapshot(savedSwipe);
        setLoadedSwipeId(savedSwipe.id);
        setSaveMessage("Swipe saved.");
        router.replace(getSwiprSwipeEditHref(savedSwipe.id), {
          scroll: false,
        });
      })
      .catch((error) => {
        setSaveMessage(
          error instanceof Error ? error.message : "Unable to save this Swipe.",
        );
      });
  };

  const handleExport = () => {
    if (!savedSwipeSnapshot) {
      return;
    }

    setBackgroundError(null);

    void Promise.resolve()
      .then(async () => {
        const fallbackBackgroundAsset = await loadSwiprBackgroundAsset(
          savedSwipeSnapshot.backgroundId,
        );
        const fallbackBackground = getSwiprBackgroundFromAsset(
          fallbackBackgroundAsset,
        );
        const slideBackgrounds: Record<string, SwiprBackground> = {};

        for (const slide of savedSwipeSnapshot.slides) {
          const backgroundId = getSwiprSlideBackgroundId(
            slide,
            savedSwipeSnapshot.backgroundId,
          );
          const backgroundAsset =
            backgroundId === fallbackBackgroundAsset.id
              ? fallbackBackgroundAsset
              : await loadSwiprBackgroundAsset(backgroundId);

          slideBackgrounds[slide.id] =
            getSwiprBackgroundFromAsset(backgroundAsset);
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

    if (!savedSwipe) {
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
        const backgroundAssets = new Map<
          string,
          SwiprBackgroundAsset & { blob: Blob }
        >();

        for (const backgroundId of backgroundIds) {
          backgroundAssets.set(
            backgroundId,
            await loadSwiprBackgroundAsset(backgroundId),
          );
        }
        const savedBackground = backgroundAssets.get(savedSwipe.backgroundId);

        if (!savedBackground) {
          throw new Error("Unable to load this background.");
        }

        if (isCancelled) {
          return;
        }

        setSlides(slidesWithBackgrounds);
        setActiveSlideId(slidesWithBackgrounds[0]?.id ?? null);
        setBackground(getSwiprBackgroundFromAsset(savedBackground));
        setSwiprMode("manual");
        setSavedSwipeSnapshot(savedSwipe);
        setSocialCaption(createSwiprSwipeSocialDescription(savedSwipe));
        setSocialDescription(savedSwipe.description ?? "");
        setSocialCopyMessage(null);
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
    loadSwiprBackgroundAsset,
    loadedSwipeId,
    swiprLibrary.swipes,
  ]);

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <DashboardPageHeader
          eyebrow={isEditingSavedSwipe ? "Swipe editor" : "Swipr"}
          title={isEditingSavedSwipe ? "Edit Swipe" : "Swipr"}
          description={
            isEditingSavedSwipe
              ? "Change the photos or text, then save the latest version."
              : "Build vertical carousel drafts from saved photos, Pexels packs, and plain text."
          }
        />

        {products.error ||
        swiprLibrary.error ||
        photoLibrary.error ||
        backgroundError ? (
          <DashboardAlert variant="error">
            {products.error ??
              swiprLibrary.error ??
              photoLibrary.error ??
              backgroundError}
          </DashboardAlert>
        ) : null}
        {autoTextMessage ? (
          <DashboardAlert variant="info">{autoTextMessage}</DashboardAlert>
        ) : null}

        <WorkflowLayout
          aside={
            activeSwiprMode === "manual" ? (
              <StickyPreviewColumn>
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
              </StickyPreviewColumn>
            ) : undefined
          }
        >
          <Panel className="min-w-0 p-4">
            <div
              className={[
                "grid gap-4",
                activeSwiprMode === "manual"
                  ? "lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)] lg:items-start"
                  : "",
              ].join(" ")}
            >
              <div className="grid gap-4">
                {isEditingSavedSwipe ? (
                  <SwiprEditModeNotice
                    isLoading={isEditSwipeLoading}
                    isMissing={isEditSwipeMissing}
                    onCreateNew={handleCreateNewSwipe}
                    swipeName={savedSwipeSnapshot?.name}
                  />
                ) : (
                  <SwiprModeToggle value={swiprMode} onChange={setSwiprMode} />
                )}
                {activeSwiprMode === "batch" ? (
                  <SwiprBatchControls
                    callToActionStyle={swiprCallToActionStyle}
                    creativeContext={swiprCreativeContext}
                    isDisabled={!selectedSavedProduct}
                    isGeneratingDrafts={isGeneratingDrafts}
                    onCallToActionStyleChange={setSwiprCallToActionStyle}
                    onCreativeContextChange={setSwiprCreativeContext}
                    onGenerateDrafts={handleGenerateDrafts}
                  />
                ) : (
                  <SwiprManualControls
                    callToActionStyle={swiprCallToActionStyle}
                    canAddSlide={slideCount < SWIPR_MAX_SLIDE_COUNT}
                    creativeContext={swiprCreativeContext}
                    isDisabled={!selectedSavedProduct}
                    isGeneratingText={isGeneratingAutoText}
                    slideCount={slideCount}
                    textGenerationScope={textGenerationScope}
                    onAddSlide={handleAddSlide}
                    onCallToActionStyleChange={setSwiprCallToActionStyle}
                    onCreativeContextChange={setSwiprCreativeContext}
                    onGenerateText={handleGenerateAutoText}
                    onTextGenerationScopeChange={setTextGenerationScope}
                  />
                )}
                {activeSwiprMode === "manual" ? (
                  <>
                    <SwiprBackgroundPanel
                      generationPrompt={generationPrompt}
                      isSaving={swiprLibrary.isSavingBackground}
                      isGeneratingAi={isGeneratingAiBackground}
                      isAiDisabled={!selectedSavedProduct}
                      activeSlideIndex={activeSlideIndex}
                      onGenerationPromptChange={setGenerationPrompt}
                      onGenerateAiBackground={() =>
                        void generateAiBackgrounds()
                      }
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
                  isLoadingMore={isLoadingMorePexels}
                  isSaving={isImportingBackground}
                  isImportingLibrary={isImportingPexelsLibrary}
                  isSearching={isSearchingPexels}
                  libraryBackgrounds={
                    activeSwiprMode === "manual"
                      ? allPexelsLibraryBackgrounds
                      : selectedLibraryBackgrounds
                  }
                  libraryPacks={libraryPacks}
                  photos={visiblePexelsPhotos}
                  query={pexelsQuery}
                  selectedLibraryQueries={selectedLibraryQueries}
                  showImportControls={false}
                  showLibraryPacks={activeSwiprMode === "batch"}
                  showSavedLibraryPhotos={activeSwiprMode === "manual"}
                  showSearch={activeSwiprMode === "manual"}
                  onImportQuery={handleImportPexelsLibraryQuery}
                  onLoadBackgroundBlob={swiprLibrary.loadBackgroundBlob}
                  onLoadMore={handleLoadMorePexels}
                  onQueryChange={handlePexelsQueryChange}
                  onSearch={handleSearchPexels}
                  onSelectPhoto={
                    activeSwiprMode === "manual"
                      ? handleSelectPexelsPhoto
                      : undefined
                  }
                  onSelectSavedBackground={
                    activeSwiprMode === "manual"
                      ? handleSelectSavedBackground
                      : undefined
                  }
                  onSelectedLibraryQueriesChange={setSelectedLibraryQueries}
                />
                {activeSwiprMode === "manual" ? (
                  <SwiprSlideStrip
                    canCopyActivePhotoToAllSlides={Boolean(
                      activeSlide?.backgroundId && slideCount > 1,
                    )}
                    slides={slides}
                    activeSlideId={activeSlide?.id ?? null}
                    onCopyActivePhotoToAllSlides={
                      handleCopyActivePhotoToAllSlides
                    }
                    onRemoveSlide={handleRemoveSlide}
                    onSelectSlide={setActiveSlideId}
                  />
                ) : null}
              </div>
              {activeSwiprMode === "manual" ? (
                <div className="flex flex-col gap-4">
                  <SwiprTextOverlayPanel
                    activeSlide={activeSlide}
                    activeSlideIndex={activeSlideIndex}
                    onChange={handleTextOverlayChange}
                  />
                  <section className="rounded-lg border border-border p-4">
                    <SwiprSocialCaptionField
                      copyMessage={socialCopyMessage}
                      socialCaption={socialCaption}
                      onChange={(nextSocialCaption) => {
                        setSocialCaption(nextSocialCaption);
                        setSocialCopyMessage(null);
                      }}
                      onCopyError={() =>
                        setSocialCopyMessage("Could not copy that post text.")
                      }
                      onCopySuccess={() =>
                        setSocialCopyMessage("Post text copied.")
                      }
                    />
                  </section>
                </div>
              ) : null}
            </div>
          </Panel>
        </WorkflowLayout>
      </div>
    </DashboardShell>
  );
}
