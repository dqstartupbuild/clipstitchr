"use client";

import { Download, Edit3, Eye, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { SwiprSwipeDetailsDialog } from "@/app/_components/dashboard/SwiprSwipeDetailsDialog";
import { SwiprSwipeEditDialog } from "@/app/_components/dashboard/SwiprSwipeEditDialog";
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
import type { SaveSwiprSwipeInput } from "@/lib/clipstitchr/types/SwiprLibraryValue";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";
import { formatDate } from "@/lib/clipstitchr/utils/formatDate";
import { getSwiprBackgroundFromAsset } from "@/lib/clipstitchr/utils/getSwiprBackgroundFromAsset";

type SwiprSwipeCardProps = {
  background: SwiprBackgroundAsset;
  backgrounds: SwiprBackgroundAsset[];
  isSaving?: boolean;
  isSelected?: boolean;
  isSelectionDisabled?: boolean;
  swipe: SwiprSwipe;
  onLoadBackgroundBlob: (id: string) => Promise<Blob>;
  onLoadPoster?: (id: string) => Promise<Blob | null>;
  onDelete: (id: string) => void | Promise<void>;
  onSelect?: () => void;
  onSave: (input: SaveSwiprSwipeInput) => Promise<SwiprSwipe>;
};

export function SwiprSwipeCard({
  background,
  backgrounds,
  isSaving = false,
  isSelected = false,
  isSelectionDisabled = false,
  swipe,
  onLoadBackgroundBlob,
  onLoadPoster,
  onDelete,
  onSelect,
  onSave,
}: SwiprSwipeCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loadedBackground, setLoadedBackground] = useState<{
    blob: Blob;
    id: string;
  } | null>(null);
  const [backgroundError, setBackgroundError] = useState<{
    id: string;
    message: string;
  } | null>(null);
  const backgroundBlob =
    background.blob ??
    (loadedBackground?.id === background.id ? loadedBackground.blob : undefined);
  const backgroundErrorMessage =
    backgroundError?.id === background.id ? backgroundError.message : null;
  const backgroundUrl = useObjectUrl(backgroundBlob);
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

  useEffect(() => {
    let isCancelled = false;

    if (background.blob) {
      return () => {
        isCancelled = true;
      };
    }

    void onLoadBackgroundBlob(background.id)
      .then((blob) => {
        if (!isCancelled) {
          setLoadedBackground({
            id: background.id,
            blob,
          });
        }
      })
      .catch((error) => {
        if (!isCancelled) {
          setBackgroundError({
            id: background.id,
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
  }, [background.blob, background.id, onLoadBackgroundBlob]);

  const downloadSwipe = () => {
    void Promise.resolve()
      .then(async () => {
        const blob =
          backgroundBlob ?? (await onLoadBackgroundBlob(background.id));

        setLoadedBackground({
          id: background.id,
          blob,
        });

        await exporter.exportCarousel({
          background: getSwiprBackgroundFromAsset({ ...background, blob }),
          slides: swipe.slides,
          productName: swipe.productName,
        });
      })
      .catch((error) => {
        setBackgroundError({
          id: background.id,
          message:
            error instanceof Error
              ? error.message
              : "Unable to load this Swipe background.",
        });
      });
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
      disabled: exporter.status === "rendering",
      onClick: downloadSwipe,
    },
    {
      label: "Edit Swipe",
      icon: <Edit3 aria-hidden className="h-4 w-4" />,
      onClick: () => setIsEditOpen(true),
    },
    {
      label: "Delete Swipe",
      variant: "danger",
      icon: <Trash2 aria-hidden className="h-4 w-4" />,
      onClick: () => {
        setIsDetailsOpen(false);
        setIsEditOpen(false);
        void onDelete(swipe.id);
      },
    },
  ];

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
          {posterUrl || backgroundUrl ? (
            <span
              aria-hidden
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${posterUrl ?? backgroundUrl})` }}
            />
          ) : null}
          <span className="absolute inset-0 bg-slate-950/10" />
          {!posterUrl ? (
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
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge>SWIPE</Badge>
              <MediaCardActionMenu
                label={`Actions for ${swipe.name}`}
                items={actionItems}
              />
            </div>
          </div>
          {backgroundErrorMessage || exporter.error ? (
            <p className="mt-3 text-xs font-semibold text-red-600">
              {backgroundErrorMessage ?? exporter.error}
            </p>
          ) : null}
        </div>
      </Panel>
      {isDetailsOpen ? (
        <SwiprSwipeDetailsDialog
          background={{
            ...background,
            ...(backgroundBlob ? { blob: backgroundBlob } : {}),
          }}
          swipe={swipe}
          isDownloading={exporter.status === "rendering"}
          onClose={() => setIsDetailsOpen(false)}
          onDelete={() => {
            setIsDetailsOpen(false);
            void onDelete(swipe.id);
          }}
          onDownload={downloadSwipe}
          onEdit={() => {
            setIsDetailsOpen(false);
            setIsEditOpen(true);
          }}
        />
      ) : null}
      {isEditOpen ? (
        <SwiprSwipeEditDialog
          background={background}
          backgrounds={backgrounds}
          isSaving={isSaving}
          swipe={swipe}
          onClose={() => setIsEditOpen(false)}
          onLoadBackgroundBlob={onLoadBackgroundBlob}
          onSave={onSave}
        />
      ) : null}
    </>
  );
}
