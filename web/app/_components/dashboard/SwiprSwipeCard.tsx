"use client";

import {
  CheckCircle2,
  CalendarClock,
  Download,
  Edit3,
  Eye,
  ImageOff,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MediaPrimaryAction } from "@/app/_components/dashboard/MediaPrimaryAction";
import { SwiprSwipeDetailsDialog } from "@/app/_components/dashboard/SwiprSwipeDetailsDialog";
import { PostBridgeScheduleDialog } from "@/app/_components/postBridge/PostBridgeScheduleDialog";
import { Badge } from "@/app/_components/ui/Badge";
import {
  MediaCardActionMenu,
  type MediaCardActionMenuItem,
} from "@/app/_components/ui/MediaCardActionMenu";
import { Panel } from "@/app/_components/ui/Panel";
import { SelectionCheckboxButton } from "@/app/_components/ui/SelectionCheckboxButton";
import { useLazyBlobObjectUrl } from "@/lib/clipstitchr/hooks/useLazyBlobObjectUrl";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import { useSwiprExport } from "@/lib/clipstitchr/hooks/useSwiprExport";
import { downloadMusicBlob } from "@/lib/clipstitchr/client/r2/downloadMusicBlob";
import { renderSwiprSlideBlob } from "@/lib/clipstitchr/media/renderSwiprSlideBlob";
import { renderSwiprSwipeVideoBlob } from "@/lib/clipstitchr/media/renderSwiprSwipeVideoBlob";
import type { PostBridgePlatform } from "@/lib/clipstitchr/types/PostBridgePlatform";
import type { PostBridgeScheduleMediaFile } from "@/lib/clipstitchr/types/PostBridgeScheduleMediaFile";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";
import { createSwiprSwipeSocialDescription } from "@/lib/clipstitchr/utils/createSwiprSwipeSocialDescription";
import { formatDate } from "@/lib/clipstitchr/utils/formatDate";
import { getPostBridgeMediaFileName } from "@/lib/clipstitchr/utils/getPostBridgeMediaFileName";
import { getSwiprBackgroundFromAsset } from "@/lib/clipstitchr/utils/getSwiprBackgroundFromAsset";
import { getSwiprPostBridgeMediaKind } from "@/lib/clipstitchr/utils/getSwiprPostBridgeMediaKind";
import { getSwiprPostBridgeTitle } from "@/lib/clipstitchr/utils/getSwiprPostBridgeTitle";
import { getSwiprSlideBackgroundId } from "@/lib/clipstitchr/utils/getSwiprSlideBackgroundId";
import { getSwiprSlideFileName } from "@/lib/clipstitchr/utils/getSwiprSlideFileName";
import { getSwiprSwipeEditHref } from "@/lib/clipstitchr/utils/getSwiprSwipeEditHref";

type SwiprSwipeCardProps = {
  background?: SwiprBackgroundAsset;
  backgrounds: SwiprBackgroundAsset[];
  isSelected?: boolean;
  isSelectionDisabled?: boolean;
  swipe: SwiprSwipe;
  onLoadBackgroundBlob: (id: string) => Promise<Blob>;
  onLoadPoster?: (id: string) => Promise<Blob | null>;
  onDelete: (id: string) => void | Promise<void>;
  onSelect?: () => void;
  onPostBridgeScheduled?: () => void | Promise<void>;
  onUpdatePostedStatus?: (
    swipe: SwiprSwipe,
    isPosted: boolean,
  ) => void | Promise<void>;
};

export function SwiprSwipeCard({
  background,
  backgrounds,
  isSelected = false,
  isSelectionDisabled = false,
  swipe,
  onLoadBackgroundBlob,
  onLoadPoster,
  onDelete,
  onSelect,
  onPostBridgeScheduled,
  onUpdatePostedStatus,
}: SwiprSwipeCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isSavingPostedStatus, setIsSavingPostedStatus] = useState(false);
  const [loadedBackground, setLoadedBackground] = useState<{
    blob: Blob;
    id: string;
  } | null>(null);
  const [backgroundError, setBackgroundError] = useState<{
    id: string;
    message: string;
  } | null>(null);
  const backgroundsById = useMemo(
    () => {
      const nextBackgroundsById = new Map(
        backgrounds.map((item) => [item.id, item] as const),
      );

      if (background) {
        nextBackgroundsById.set(background.id, background);
      }

      return nextBackgroundsById;
    },
    [background, backgrounds],
  );
  const missingBackgroundCount = useMemo(() => {
    const referencedIds = new Set([
      swipe.backgroundId,
      ...swipe.slides.map((slide) =>
        getSwiprSlideBackgroundId(slide, swipe.backgroundId),
      ),
    ]);

    return [...referencedIds].filter((id) => !backgroundsById.has(id)).length;
  }, [backgroundsById, swipe.backgroundId, swipe.slides]);
  const hasMissingBackground = missingBackgroundCount > 0;
  const backgroundBlob =
    background?.blob ??
    (background && loadedBackground && loadedBackground.id === background.id
      ? loadedBackground.blob
      : undefined);
  const backgroundErrorMessage = backgroundError?.message ?? null;
  const backgroundUrl = useObjectUrl(backgroundBlob);
  const isPosted = Boolean(swipe.isPosted);
  const [postedStatusError, setPostedStatusError] = useState<string | null>(
    null,
  );
  const [hasScheduledPostBridgePost, setHasScheduledPostBridgePost] =
    useState(false);
  const displayIsPosted = isPosted || hasScheduledPostBridgePost;
  const loadPosterBlob = useCallback(
    () => onLoadPoster?.(swipe.id) ?? Promise.resolve(null),
    [onLoadPoster, swipe.id],
  );
  const posterUrl = useLazyBlobObjectUrl({
    cacheKey: swipe.posterObject?.key
      ? `${swipe.posterObject.key}:${swipe.posterVersion ?? 0}:${swipe.updatedAt}`
      : undefined,
    fallbackBlob: swipe.posterBlob,
    loadBlob: loadPosterBlob,
  });
  const exporter = useSwiprExport();
  const editHref = getSwiprSwipeEditHref(swipe.id);
  const socialDescription = createSwiprSwipeSocialDescription(swipe);
  const postBridgeTitle = getSwiprPostBridgeTitle(swipe);

  useEffect(() => {
    let isCancelled = false;

    if (!background || background.blob) {
      return () => {
        isCancelled = true;
      };
    }

    const currentBackgroundId = background.id;

    void onLoadBackgroundBlob(currentBackgroundId)
      .then((blob) => {
        if (!isCancelled) {
          setLoadedBackground({
            id: currentBackgroundId,
            blob,
          });
        }
      })
      .catch((error) => {
        if (!isCancelled) {
          setBackgroundError({
            id: currentBackgroundId,
            message:
              error instanceof Error
                ? error.message
                : "Unable to load this Swipe background.",
          });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [background, onLoadBackgroundBlob]);

  const downloadSwipe = () => {
    void Promise.resolve()
      .then(async () => {
        const currentBackground = background;

        if (hasMissingBackground || !currentBackground) {
          throw new Error("This Swipe is missing a photo.");
        }

        const blob =
          backgroundBlob ?? (await onLoadBackgroundBlob(currentBackground.id));
        const fallbackBackground = getSwiprBackgroundFromAsset({
          ...currentBackground,
          blob,
        });
        const slideBackgrounds: Parameters<
          typeof exporter.exportCarousel
        >[0]["slideBackgrounds"] = {};

        setLoadedBackground({
          id: currentBackground.id,
          blob,
        });

        for (const slide of swipe.slides) {
          const backgroundId = getSwiprSlideBackgroundId(
            slide,
            swipe.backgroundId,
          );
          const slideBackgroundAsset =
            backgroundId === currentBackground.id
              ? currentBackground
              : backgroundsById.get(backgroundId);

          if (!slideBackgroundAsset) {
            throw new Error("Unable to load this Swipe photo.");
          }

          const slideBlob =
            backgroundId === currentBackground.id
              ? blob
              : slideBackgroundAsset.blob ??
                (await onLoadBackgroundBlob(slideBackgroundAsset.id));

          slideBackgrounds[slide.id] = getSwiprBackgroundFromAsset({
            ...slideBackgroundAsset,
            blob: slideBlob,
          });
        }

        await exporter.exportCarousel({
          background: fallbackBackground,
          slideBackgrounds,
          slides: swipe.slides,
          productName: swipe.productName,
        });
      })
      .catch((error) => {
        setBackgroundError({
          id: background?.id ?? swipe.backgroundId,
          message:
            error instanceof Error
              ? error.message
              : "Unable to load this Swipe background.",
        });
      });
  };
  const renderPostBridgeMedia = async ({
    musicTrack,
    onProgress,
    platforms,
  }: {
    musicTrack: SharedMusicTrack | null;
    onProgress: (progress: number) => void;
    platforms: PostBridgePlatform[];
  }) => {
    const currentBackground = background;

    if (hasMissingBackground || !currentBackground) {
      throw new Error("This Swipe is missing a photo.");
    }

    const primaryBlob =
      backgroundBlob ?? (await onLoadBackgroundBlob(currentBackground.id));
    const slideBackgroundBlobs: Record<string, Blob> = {};

    setLoadedBackground({
      id: currentBackground.id,
      blob: primaryBlob,
    });

    for (const slide of swipe.slides) {
      const backgroundId = getSwiprSlideBackgroundId(slide, swipe.backgroundId);
      const slideBackgroundAsset =
        backgroundId === currentBackground.id
          ? currentBackground
          : backgroundsById.get(backgroundId);

      if (!slideBackgroundAsset) {
        throw new Error("Unable to load this Swipe photo.");
      }

      slideBackgroundBlobs[slide.id] =
        backgroundId === currentBackground.id
          ? primaryBlob
          : slideBackgroundAsset.blob ??
            (await onLoadBackgroundBlob(slideBackgroundAsset.id));
    }

    if (
      getSwiprPostBridgeMediaKind({
        hasMusic: Boolean(musicTrack),
        platforms,
      }) === "image"
    ) {
      const mediaFiles: PostBridgeScheduleMediaFile[] = [];

      for (let index = 0; index < swipe.slides.length; index += 1) {
        const slide = swipe.slides[index];
        const slideBlob = await renderSwiprSlideBlob(
          slideBackgroundBlobs[slide.id],
          slide,
        );

        mediaFiles.push({
          blob: slideBlob,
          fileName: getSwiprSlideFileName(index),
          mediaKind: "image",
        });
        onProgress((index + 1) / swipe.slides.length);
      }

      return {
        hasAudio: false,
        mediaFiles,
      };
    }

    const musicBlob = musicTrack
      ? await downloadMusicBlob({
          audioObject: musicTrack.audioObject,
          sharedTrackId: musicTrack.id,
        })
      : null;
    const renderResult = await renderSwiprSwipeVideoBlob({
      musicBlob,
      onProgress,
      slideBackgroundBlobs,
      slides: swipe.slides,
    });

    return {
      hasAudio: Boolean(musicTrack),
      mediaFiles: [
        {
          blob: renderResult.blob,
          fileName: getPostBridgeMediaFileName(swipe.name, "video"),
          mediaKind: "video" as const,
        },
      ],
    };
  };
  const handleUpdatePostedStatus = async (nextIsPosted: boolean) => {
    if (!onUpdatePostedStatus) {
      return;
    }

    setIsSavingPostedStatus(true);
    setPostedStatusError(null);

    try {
      await onUpdatePostedStatus(swipe, nextIsPosted);
      setHasScheduledPostBridgePost(nextIsPosted);
    } catch (error) {
      setPostedStatusError(
        error instanceof Error
          ? error.message
          : "Unable to update posted status.",
      );
    } finally {
      setIsSavingPostedStatus(false);
    }
  };
  const actionItems: MediaCardActionMenuItem[] = [
    {
      label: "View Swipe details",
      icon: <Eye aria-hidden className="h-4 w-4" />,
      onClick: () => setIsDetailsOpen(true),
    },
    {
      label: "Download Swipe",
      icon: <Download aria-hidden className="h-4 w-4" />,
      disabled: exporter.status === "rendering" || hasMissingBackground,
      onClick: downloadSwipe,
    },
    {
      label: "Schedule post",
      icon: <CalendarClock aria-hidden className="h-4 w-4" />,
      disabled: hasMissingBackground,
      onClick: () => setIsScheduleOpen(true),
    },
    {
      label: "Edit Swipe",
      icon: <Edit3 aria-hidden className="h-4 w-4" />,
      href: editHref,
    },
    ...(onUpdatePostedStatus
      ? [
          {
            label: displayIsPosted ? "Mark as active" : "Mark as posted",
            icon: displayIsPosted ? (
              <RotateCcw aria-hidden className="h-4 w-4" />
            ) : (
              <CheckCircle2 aria-hidden className="h-4 w-4" />
            ),
            disabled: isSavingPostedStatus,
            onClick: () => void handleUpdatePostedStatus(!displayIsPosted),
          },
        ]
      : []),
    {
      label: "Delete Swipe",
      variant: "danger",
      icon: <Trash2 aria-hidden className="h-4 w-4" />,
      onClick: () => {
        setIsDetailsOpen(false);
        void onDelete(swipe.id);
      },
    },
  ];

  const previewUrl = hasMissingBackground ? null : (posterUrl ?? backgroundUrl);
  const missingBackgroundCopy =
    missingBackgroundCount === 1
      ? "A photo for this Swipe was deleted."
      : "Some photos for this Swipe were deleted.";

  return (
    <>
      <Panel
        className={[
          "relative w-full max-w-[260px] justify-self-center overflow-hidden",
          isSelected ? "!border-accent ring-2 ring-accent/15" : "",
        ].join(" ")}
      >
        <button
          type="button"
          aria-label={`Open details for ${swipe.name}`}
          className="relative block aspect-[9/11] w-full bg-slate-100 text-left"
          onClick={() => setIsDetailsOpen(true)}
        >
          {previewUrl ? (
            <span
              aria-hidden
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${previewUrl})` }}
            />
          ) : null}
          {hasMissingBackground ? (
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-100 px-5 text-center">
              <ImageOff
                aria-hidden
                className="h-9 w-9 text-text-tertiary"
              />
              <span className="text-sm font-bold text-text-primary">
                Photo is missing
              </span>
              <span className="text-xs font-semibold leading-5 text-text-secondary">
                Edit or delete this Swipe.
              </span>
            </span>
          ) : null}
          {!hasMissingBackground ? (
            <span className="absolute inset-0 bg-slate-950/10" />
          ) : null}
          {!previewUrl && !hasMissingBackground ? (
            <span className="absolute bottom-3 left-3 right-3 rounded-md bg-white/95 px-3 py-2 shadow-sm">
              <span className="block truncate text-sm font-bold text-text-primary">
                {swipe.name}
              </span>
              <span className="mt-0.5 block text-xs font-semibold text-text-secondary">
                {swipe.slides.length} images
              </span>
            </span>
          ) : null}
        </button>
        {onSelect ? (
          <SelectionCheckboxButton
            isSelected={isSelected}
            label={`${isSelected ? "Deselect" : "Select"} ${swipe.name}`}
            disabled={isSelectionDisabled}
            className="absolute right-2 top-2 z-10"
            onClick={onSelect}
          />
        ) : null}
        <div className="p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-text-primary">
                {swipe.name}
              </h3>
              <p className="mt-1 text-xs text-text-tertiary">
                Updated {formatDate(swipe.updatedAt)}
              </p>
              {socialDescription ? (
                <p className="mt-2 line-clamp-2 whitespace-pre-line text-xs text-text-secondary">
                  {socialDescription}
                </p>
              ) : null}
              {hasMissingBackground ? (
                <p className="mt-2 text-xs font-semibold leading-5 text-amber-700">
                  {missingBackgroundCopy}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge>
                {hasMissingBackground
                  ? "MISSING"
                  : displayIsPosted
                    ? "POSTED"
                    : "SWIPE"}
              </Badge>
              <MediaCardActionMenu
                label={`Actions for ${swipe.name}`}
                items={actionItems}
              />
            </div>
          </div>
          <div className="mt-3">
            <MediaPrimaryAction
              href={editHref}
              icon={<Edit3 aria-hidden className="h-4 w-4" />}
              label={hasMissingBackground ? "Fix photos" : "Continue editing"}
            />
          </div>
          {backgroundErrorMessage || exporter.error ? (
            <p className="mt-3 text-xs font-semibold text-red-600">
              {backgroundErrorMessage ?? exporter.error}
            </p>
          ) : null}
          {postedStatusError ? (
            <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
              {postedStatusError}
            </p>
          ) : null}
        </div>
      </Panel>
      {isDetailsOpen ? (
        <SwiprSwipeDetailsDialog
          background={
            background
              ? {
                  ...background,
                  ...(backgroundBlob ? { blob: backgroundBlob } : {}),
                }
              : undefined
          }
          backgrounds={backgrounds}
          editHref={editHref}
          isDownloadDisabled={hasMissingBackground}
          swipe={swipe}
          isDownloading={exporter.status === "rendering"}
          missingBackgroundCount={missingBackgroundCount}
          onClose={() => setIsDetailsOpen(false)}
          onDelete={() => {
            setIsDetailsOpen(false);
            void onDelete(swipe.id);
          }}
          onDownload={downloadSwipe}
          onLoadBackgroundBlob={onLoadBackgroundBlob}
        />
      ) : null}
      {isScheduleOpen ? (
        <PostBridgeScheduleDialog
          allowMusic
          defaultCaption={swipe.socialCaption ?? socialDescription}
          soundSearchContext={[
            swipe.productName,
            swipe.productContext,
            socialDescription,
          ]
            .filter(Boolean)
            .join("\n")}
          sourceId={swipe.id}
          sourceProductId={swipe.productSourceId}
          sourceTitle={postBridgeTitle}
          sourceType="swipe"
          onClose={() => setIsScheduleOpen(false)}
          onRenderMedia={renderPostBridgeMedia}
          onScheduled={() => {
            setHasScheduledPostBridgePost(true);
            void onPostBridgeScheduled?.();
          }}
        />
      ) : null}
    </>
  );
}
