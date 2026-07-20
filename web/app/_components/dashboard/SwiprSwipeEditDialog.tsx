"use client";

import { Save, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { TextOverlayBox } from "@/app/_components/stitchr/TextOverlayBox";
import { TextOverlayQuickControls } from "@/app/_components/stitchr/TextOverlayQuickControls";
import { SwiprSlideStrip } from "@/app/_components/swipr/SwiprSlideStrip";
import { SwiprTextOverlayPanel } from "@/app/_components/swipr/SwiprTextOverlayPanel";
import { Badge } from "@/app/_components/ui/Badge";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import { SWIPR_STATIC_DURATION } from "@/lib/clipstitchr/constants/swiprStaticDuration";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import type { SaveSwiprSwipeInput } from "@/lib/clipstitchr/types/SwiprLibraryValue";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprSlide } from "@/lib/clipstitchr/types/SwiprSlide";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { getSwiprSlideBackgroundId } from "@/lib/clipstitchr/utils/getSwiprSlideBackgroundId";

type SwiprSwipeEditDialogProps = {
  background: SwiprBackgroundAsset;
  backgrounds: SwiprBackgroundAsset[];
  isSaving: boolean;
  swipe: SwiprSwipe;
  onClose: () => void;
  onLoadBackgroundBlob: (id: string) => Promise<Blob>;
  onSave: (input: SaveSwiprSwipeInput) => Promise<SwiprSwipe>;
};

export function SwiprSwipeEditDialog({
  background,
  backgrounds,
  isSaving,
  swipe,
  onClose,
  onLoadBackgroundBlob,
  onSave,
}: SwiprSwipeEditDialogProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [slides, setSlides] = useState<SwiprSlide[]>(() =>
    swipe.slides.map((slide) => ({
      ...slide,
      backgroundId: getSwiprSlideBackgroundId(slide, swipe.backgroundId),
    })),
  );
  const [activeSlideId, setActiveSlideId] = useState<string | null>(
    swipe.slides[0]?.id ?? null,
  );
  const [loadedBackgrounds, setLoadedBackgrounds] = useState<
    Record<string, Blob>
  >({});
  const [areTextControlsOpen, setAreTextControlsOpen] = useState(false);
  const [backgroundError, setBackgroundError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const backgroundsById = useMemo(
    () =>
      new Map([
        [background.id, background],
        ...backgrounds.map((item) => [item.id, item] as const),
      ]),
    [background, backgrounds],
  );
  const activeSlideIndex = Math.max(
    0,
    slides.findIndex((slide) => slide.id === activeSlideId),
  );
  const activeSlide = slides[activeSlideIndex] ?? null;
  const activeBackgroundId = activeSlide
    ? getSwiprSlideBackgroundId(activeSlide, swipe.backgroundId)
    : swipe.backgroundId;
  const activeBackgroundAsset = backgroundsById.get(activeBackgroundId);
  const activeBackgroundBlob =
    activeBackgroundAsset?.blob ?? loadedBackgrounds[activeBackgroundId];
  const activeBackgroundUrl = useObjectUrl(activeBackgroundBlob);

  useEffect(() => {
    let isCancelled = false;

    if (!activeBackgroundAsset || activeBackgroundBlob) {
      return () => {
        isCancelled = true;
      };
    }

    void onLoadBackgroundBlob(activeBackgroundAsset.id)
      .then((blob) => {
        if (!isCancelled) {
          setLoadedBackgrounds((currentBackgrounds) => ({
            ...currentBackgrounds,
            [activeBackgroundAsset.id]: blob,
          }));
        }
      })
      .catch((error) => {
        if (!isCancelled) {
          setBackgroundError(
            error instanceof Error
              ? error.message
              : "Unable to load this Swipe photo.",
          );
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [
    activeBackgroundAsset,
    activeBackgroundBlob,
    onLoadBackgroundBlob,
  ]);

  const handleTextOverlayChange = (textOverlay: TextOverlay) => {
    if (!activeSlide) {
      return;
    }

    setSaveMessage(null);
    setSlides((currentSlides) =>
      currentSlides.map((slide) =>
        slide.id === activeSlide.id
          ? {
              ...slide,
              textOverlay,
            }
          : slide,
      ),
    );
  };

  const handleSave = async () => {
    setSaveMessage(null);

    try {
      await onSave({
        backgroundId: swipe.backgroundId,
        caption: swipe.caption,
        createdAt: swipe.createdAt,
        description: swipe.description,
        hashtags: swipe.hashtags,
        id: swipe.id,
        name: swipe.name,
        productContext: swipe.productContext,
        productName: swipe.productName,
        productSourceId: swipe.productSourceId,
        productSourceType: swipe.productSourceType,
        rationale: swipe.rationale,
        slides: slides.map((slide) => ({
          ...slide,
          backgroundId: getSwiprSlideBackgroundId(slide, swipe.backgroundId),
        })),
        socialCaption: swipe.socialCaption,
      });
      setSaveMessage("Swipe saved.");
    } catch (error) {
      setSaveMessage(
        error instanceof Error ? error.message : "Unable to save this Swipe.",
      );
    }
  };

  return (
    <div
      className="dashboard-dialog-viewport"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="swipr-swipe-edit-dialog-title"
        className="max-h-full w-full max-w-5xl overflow-y-auto rounded-lg bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-dark">
              Edit Swipe
            </p>
            <h2
              id="swipr-swipe-edit-dialog-title"
              className="mt-1 truncate text-xl font-bold text-text-primary"
            >
              {swipe.name}
            </h2>
          </div>
          <IconButton
            type="button"
            label="Close Swipe editor"
            icon={<X aria-hidden className="h-4 w-4" />}
            onClick={onClose}
          />
        </div>
        <div className="grid gap-5 p-5 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
            <div
              ref={stageRef}
              className="relative mx-auto aspect-[9/16] w-full max-w-[280px] overflow-hidden rounded-lg bg-slate-950"
              style={{ containerType: "size" }}
            >
              {activeBackgroundUrl ? (
                <div
                  aria-hidden
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${activeBackgroundUrl})` }}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">
                  Photo unavailable
                </div>
              )}
              {activeSlide ? (
                <TextOverlayBox
                  emptyLabel="Text"
                  textOverlay={activeSlide.textOverlay}
                  stageRef={stageRef}
                  totalDuration={SWIPR_STATIC_DURATION}
                  onChange={handleTextOverlayChange}
                  onOpenStyleControls={() => setAreTextControlsOpen(true)}
                />
              ) : null}
              {activeSlide && areTextControlsOpen ? (
                <TextOverlayQuickControls
                  textOverlay={activeSlide.textOverlay}
                  totalDuration={SWIPR_STATIC_DURATION}
                  onChange={handleTextOverlayChange}
                  onClose={() => setAreTextControlsOpen(false)}
                />
              ) : null}
            </div>
            {backgroundError ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {backgroundError}
              </p>
            ) : null}
            <div className="rounded-lg border border-border bg-surface-elevated p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>
                  {swipe.isPosted ? "POSTED" : "SWIPE"}
                </Badge>
                <span className="text-xs font-semibold text-text-tertiary">
                  {slides.length} images
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-text-primary">
                {swipe.productName}
              </p>
              <p className="mt-1 text-xs text-text-tertiary">
                Image {activeSlideIndex + 1} of {slides.length}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <section className="rounded-lg border border-border p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-text-primary">Images</h3>
                <Button
                  type="button"
                  size="sm"
                  icon={<Save aria-hidden className="h-4 w-4" />}
                  isLoading={isSaving}
                  onClick={() => void handleSave()}
                >
                  Save Swipe
                </Button>
              </div>
              <SwiprSlideStrip
                slides={slides}
                activeSlideId={activeSlideId}
                onSelectSlide={(slideId) => {
                  setBackgroundError(null);
                  setAreTextControlsOpen(false);
                  setActiveSlideId(slideId);
                }}
              />
              {saveMessage ? (
                <p className="mt-3 text-sm font-semibold text-text-secondary">
                  {saveMessage}
                </p>
              ) : null}
            </section>
            <section className="rounded-lg border border-border p-4">
              <SwiprTextOverlayPanel
                activeSlide={activeSlide}
                activeSlideIndex={activeSlideIndex}
                onChange={handleTextOverlayChange}
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
