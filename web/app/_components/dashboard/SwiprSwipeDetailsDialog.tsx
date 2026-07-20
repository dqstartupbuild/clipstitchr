"use client";

import {
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  ImageOff,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StitchSocialCaptionCopyButton } from "@/app/_components/stitches/StitchSocialCaptionCopyButton";
import { SwiprStaticTextOverlayBox } from "@/app/_components/swipr/SwiprStaticTextOverlayBox";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import { useHorizontalSwipeNavigation } from "@/lib/clipstitchr/hooks/useHorizontalSwipeNavigation";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";
import { formatDate } from "@/lib/clipstitchr/utils/formatDate";
import { getSwiprSlideBackgroundId } from "@/lib/clipstitchr/utils/getSwiprSlideBackgroundId";
import { createSwiprSwipeSocialDescription } from "@/lib/clipstitchr/utils/createSwiprSwipeSocialDescription";

type SwiprSwipeDetailsDialogProps = {
  background?: SwiprBackgroundAsset;
  backgrounds: SwiprBackgroundAsset[];
  editHref: string;
  isDownloadDisabled?: boolean;
  isDownloading: boolean;
  missingBackgroundCount?: number;
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
  isDownloadDisabled = false,
  isDownloading,
  missingBackgroundCount = 0,
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
    () => {
      const entries = backgrounds.map((item) => [item.id, item] as const);

      if (background) {
        entries.unshift([background.id, background]);
      }

      return new Map(entries);
    },
    [background, backgrounds],
  );
  const activeBackgroundId = activeSlide
    ? getSwiprSlideBackgroundId(activeSlide, swipe.backgroundId)
    : swipe.backgroundId;
  const activeBackground = backgroundsById.get(activeBackgroundId);
  const activeBackgroundBlob =
    activeBackground?.blob ?? loadedBackgrounds[activeBackgroundId];
  const backgroundUrl = useObjectUrl(activeBackgroundBlob);
  const isActiveBackgroundMissing = !activeBackground;
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
  const socialDescription = createSwiprSwipeSocialDescription(swipe);

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
      className="dashboard-dialog-viewport"
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
              {isActiveBackgroundMissing ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-100 px-5 text-center">
                  <ImageOff
                    aria-hidden
                    className="h-10 w-10 text-text-tertiary"
                  />
                  <div>
                    <p className="text-sm font-bold text-text-primary">
                      Photo is missing
                    </p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-text-secondary">
                      Edit this Swipe to choose a new photo, or delete it if you no longer need it.
                    </p>
                  </div>
                </div>
              ) : null}
              {!isActiveBackgroundMissing &&
              activeSlide?.textOverlay.text.trim() ? (
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
            {missingBackgroundCount > 0 ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold leading-6 text-amber-800">
                {missingBackgroundCount === 1
                  ? "A photo for this Swipe was deleted. You can edit it to choose a new photo, or delete the Swipe."
                  : "Some photos for this Swipe were deleted. You can edit it to choose new photos, or delete the Swipe."}
              </div>
            ) : null}
            {socialDescription ? (
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                    Caption, description, and hashtags
                  </p>
                  <StitchSocialCaptionCopyButton
                    socialCaption={socialDescription}
                    variant="icon"
                  />
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-text-secondary [overflow-wrap:anywhere]">
                  {socialDescription}
                </p>
              </div>
            ) : null}
            {swipe.rationale?.trim() ? (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                  Why it works
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  {swipe.rationale.trim()}
                </p>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                icon={<Download aria-hidden className="h-4 w-4" />}
                disabled={isDownloadDisabled}
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
