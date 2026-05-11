"use client";

import { Download, Edit3, Eye, Trash2 } from "lucide-react";
import { useState } from "react";
import { SwiprSwipeDetailsDialog } from "@/app/_components/dashboard/SwiprSwipeDetailsDialog";
import { Badge } from "@/app/_components/ui/Badge";
import { IconButton } from "@/app/_components/ui/IconButton";
import { Panel } from "@/app/_components/ui/Panel";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import { useSwiprExport } from "@/lib/clipstitchr/hooks/useSwiprExport";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";
import { formatDate } from "@/lib/clipstitchr/utils/formatDate";
import { getSwiprBackgroundFromAsset } from "@/lib/clipstitchr/utils/getSwiprBackgroundFromAsset";

type SwiprSwipeCardProps = {
  background: SwiprBackgroundAsset;
  swipe: SwiprSwipe;
  onDelete: (id: string) => void | Promise<void>;
};

export function SwiprSwipeCard({
  background,
  swipe,
  onDelete,
}: SwiprSwipeCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const backgroundUrl = useObjectUrl(background.blob);
  const exporter = useSwiprExport();
  const downloadSwipe = () => {
    void exporter.exportCarousel({
      background: getSwiprBackgroundFromAsset(background),
      slides: swipe.slides,
      productName: swipe.productName,
    });
  };

  return (
    <>
      <Panel className="w-full max-w-[260px] justify-self-center overflow-hidden">
        <button
          type="button"
          aria-label={`Open details for ${swipe.name}`}
          className="relative block aspect-[9/11] w-full bg-slate-100 text-left"
          onClick={() => setIsDetailsOpen(true)}
        >
          {backgroundUrl ? (
            <span
              aria-hidden
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${backgroundUrl})` }}
            />
          ) : null}
          <span className="absolute inset-0 bg-slate-950/10" />
          <span className="absolute bottom-3 left-3 right-3 rounded-md bg-white/95 px-3 py-2 shadow-sm">
            <span className="block truncate text-sm font-bold text-text-primary">
              {swipe.name}
            </span>
            <span className="mt-0.5 block text-xs font-semibold text-text-secondary">
              {swipe.slides.length} images
            </span>
          </span>
        </button>
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
            <Badge>SWIPE</Badge>
          </div>
          {exporter.error ? (
            <p className="mt-3 text-xs font-semibold text-red-600">
              {exporter.error}
            </p>
          ) : null}
          <div className="mt-3 flex gap-2">
            <IconButton
              label="View Swipe details"
              icon={<Eye aria-hidden className="h-4 w-4" />}
              onClick={() => setIsDetailsOpen(true)}
            />
            <IconButton
              label="Download Swipe"
              icon={<Download aria-hidden className="h-4 w-4" />}
              disabled={exporter.status === "rendering"}
              onClick={downloadSwipe}
            />
            <a
              href={`/dashboard/swipr?swipe=${encodeURIComponent(swipe.id)}`}
              aria-label="Edit Swipe"
              title="Edit Swipe"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-text-secondary transition-colors hover:border-accent hover:text-accent"
            >
              <Edit3 aria-hidden className="h-4 w-4" />
            </a>
            <IconButton
              label="Delete Swipe"
              variant="danger"
              icon={<Trash2 aria-hidden className="h-4 w-4" />}
              onClick={() => void onDelete(swipe.id)}
            />
          </div>
        </div>
      </Panel>
      {isDetailsOpen ? (
        <SwiprSwipeDetailsDialog
          background={background}
          swipe={swipe}
          isDownloading={exporter.status === "rendering"}
          onClose={() => setIsDetailsOpen(false)}
          onDownload={downloadSwipe}
        />
      ) : null}
    </>
  );
}
