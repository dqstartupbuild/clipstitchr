"use client";

import {
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SwiprStaticTextOverlayBox } from "@/app/_components/swipr/SwiprStaticTextOverlayBox";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import { useHorizontalSwipeNavigation } from "@/lib/clipstitchr/hooks/useHorizontalSwipeNavigation";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";
import { formatDate } from "@/lib/clipstitchr/utils/formatDate";
import { getSwiprSlideBackgroundId } from "@/lib/clipstitchr/utils/getSwiprSlideBackgroundId";

type SwiprSwipeDetailsDialogProps = {
  background: SwiprBackgroundAsset;
  backgrounds: SwiprBackgroundAsset[];
  editHref: string;
  isDownloading: boolean;
  swipe: SwiprSwipe;
  onClose: () => void;
  onDelete: () => void;
  onDownload: () => void;
  onLoadBackgroundBlob: (id: string) => Promise<Blob>;
};

export function SwiprSwipeDetailsDialog({
  background,
  backgrounds,
  editHref,
  isDownloading,
  swipe,
  onClose,
  onDelete,
  onDownload,
  onLoadBackgroundBlob,
}: SwiprSwipeDetailsDialogProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadedBackgrounds, setLoadedBackgrounds] = useState<
    Record<string, Blob>
  >({});
  const activeSlide = swipe.slides[activeIndex] ?? null;
  const backgroundsById = useMemo(
    () =>
      new Map([
        [background.id, background],
        ...backgrounds.map((item) => [item.id, item] as const),
      ]),
    [background, backgrounds],
  );
  const activeBackgroundId = activeSlide
    ? getSwiprSlideBackgroundId(activeSlide, swipe.backgroundId)
    : swipe.backgroundId;
  const activeBackground = backgroundsById.get(activeBackgroundId);
  const activeBackgroundBlob =
    activeBackground?.blob ?? loadedBackgrounds[activeBackgroundId];
  const backgroundUrl = useObjectUrl(activeBackgroundBlob);
  const goToPrevious = useCallback(() => {
    setActiveIndex(
      (currentIndex) =>
        (currentIndex - 1 + swipe.slides.length) % swipe.slides.length,
    );
  }, [swipe.slides.length]);
  const goToNext = useCallback(() => {
    setActiveIndex((currentIndex) => (currentIndex + 1) % swipe.slides.length);
  }, [swipe.slides.length]);
  const swipeHandlers = useHorizontalSwipeNavigation({
    isEnabled: swipe.slides.length > 1,
    onSwipeLeft: goToNext,
    onSwipeRight: goToPrevious,
  });

  useEffect(() => {
    let isCancelled = false;

    if (!activeBackground || activeBackgroundBlob) {
      return () => {
        isCancelled = true;
      };
    }

    void onLoadBackgroundBlob(activeBackground.id)
      .then((blob) => {
        if (!isCancelled) {
          setLoadedBackgrounds((currentBackgrounds) => ({
            ...currentBackgrounds,
            [activeBackground.id]: blob,
          }));
        }
      })
      .catch(() => undefined);

    return () => {
      isCancelled = true;
    };
  }, [activeBackground, activeBackgroundBlob, onLoadBackgroundBlob]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-2 py-3 sm:px-4 sm:py-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="swipr-swipe-details-title"
        className="max-h-full w-full max-w-3xl overflow-x-hidden overflow-y-auto rounded-lg bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-dark">
              Swipe details
            </p>
            <h2
              id="swipr-swipe-details-title"
              className="mt-1 truncate text-xl font-bold text-text-primary"
            >
              {swipe.name}
            </h2>
          </div>
          <IconButton
            type="button"
            label="Close Swipe details"
            icon={<X aria-hidden className="h-4 w-4" />}
            onClick={onClose}
          />
        </div>
        <div className="grid gap-5 p-3 sm:p-5 md:grid-cols-[260px_minmax(0,1fr)]">
          <div>
            <div
              className="relative mx-auto aspect-[9/16] w-full max-w-[260px] overflow-hidden rounded-lg bg-slate-950"
              style={{ containerType: "size" }}
              {...swipeHandlers}
            >
              {backgroundUrl ? (
                <div
                  aria-hidden
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${backgroundUrl})` }}
                />
              ) : null}
              {activeSlide?.textOverlay.text.trim() ? (
                <SwiprStaticTextOverlayBox
                  textOverlay={activeSlide.textOverlay}
                />
              ) : null}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <IconButton
                label="Previous carousel image"
                icon={<ChevronLeft aria-hidden className="h-4 w-4" />}
                disabled={swipe.slides.length <= 1}
                onClick={goToPrevious}
              />
              <p className="text-sm font-semibold text-text-secondary">
                Image {activeIndex + 1} of {swipe.slides.length}
              </p>
              <IconButton
                label="Next carousel image"
                icon={<ChevronRight aria-hidden className="h-4 w-4" />}
                disabled={swipe.slides.length <= 1}
                onClick={goToNext}
              />
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                Product
              </p>
              <p className="mt-1 text-sm font-semibold text-text-primary">
                {swipe.productName}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                Updated
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                {formatDate(swipe.updatedAt)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                icon={<Download aria-hidden className="h-4 w-4" />}
                isLoading={isDownloading}
                onClick={onDownload}
              >
                Download
              </Button>
              <Link
                href={editHref}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-text-primary transition-colors hover:border-accent"
              >
                <Edit3 aria-hidden className="h-4 w-4" />
                Edit
              </Link>
              <Button
                type="button"
                variant="danger"
                icon={<Trash2 aria-hidden className="h-4 w-4" />}
                onClick={onDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
