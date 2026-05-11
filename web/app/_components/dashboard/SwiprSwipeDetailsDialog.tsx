"use client";

import { ChevronLeft, ChevronRight, Download, Edit3, X } from "lucide-react";
import { useCallback, useState } from "react";
import { SwiprStaticTextOverlayBox } from "@/app/_components/swipr/SwiprStaticTextOverlayBox";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import { useHorizontalSwipeNavigation } from "@/lib/clipstitchr/hooks/useHorizontalSwipeNavigation";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";
import { formatDate } from "@/lib/clipstitchr/utils/formatDate";

type SwiprSwipeDetailsDialogProps = {
  background: SwiprBackgroundAsset;
  isDownloading: boolean;
  swipe: SwiprSwipe;
  onClose: () => void;
  onDownload: () => void;
};

export function SwiprSwipeDetailsDialog({
  background,
  isDownloading,
  swipe,
  onClose,
  onDownload,
}: SwiprSwipeDetailsDialogProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const backgroundUrl = useObjectUrl(background.blob);
  const activeSlide = swipe.slides[activeIndex] ?? null;
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="swipr-swipe-details-title"
        className="max-h-full w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl"
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
        <div className="grid gap-5 p-5 md:grid-cols-[260px_minmax(0,1fr)]">
          <div>
            <div
              className="relative mx-auto aspect-[9/16] w-full max-w-[260px] max-h-[62vh] overflow-hidden rounded-lg bg-slate-950"
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
                Background
              </p>
              <p className="mt-1 text-sm font-semibold text-text-primary">
                {background.name}
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
              <a
                href={`/dashboard/swipr?swipe=${encodeURIComponent(swipe.id)}`}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-text-primary transition-colors hover:border-accent"
              >
                <Edit3 aria-hidden className="h-4 w-4" />
                Edit
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
