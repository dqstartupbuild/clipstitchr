"use client";

import { Download, Shuffle, Trash2 } from "lucide-react";
import { Badge } from "@/app/_components/ui/Badge";
import { IconButton } from "@/app/_components/ui/IconButton";
import { IconButtonLink } from "@/app/_components/ui/IconButtonLink";
import { Panel } from "@/app/_components/ui/Panel";
import { VideoPreview } from "@/app/_components/ui/VideoPreview";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";
import { formatDate } from "@/lib/clipstitchr/utils/formatDate";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { getUseInSwaprStitchHref } from "@/lib/clipstitchr/utils/getUseInSwaprStitchHref";

type StitchCardProps = {
  stitch: Stitch;
  onDelete: (id: string) => void | Promise<void>;
};

export function StitchCard({
  stitch,
  onDelete,
}: StitchCardProps) {
  const url = useObjectUrl(stitch.blob);
  const posterUrl = useObjectUrl(stitch.posterBlob);

  return (
    <Panel className="w-full max-w-[390px] justify-self-center overflow-hidden">
      <div className="mx-auto max-w-[390px]">
        <VideoPreview
          src={url}
          posterSrc={posterUrl}
          label={stitch.name}
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-text-primary">
              {stitch.name}
            </h3>
            <p className="mt-1 text-xs text-text-tertiary">
              {formatDuration(stitch.duration)} . {formatBytes(stitch.size)}
            </p>
            <p className="mt-2 text-xs text-text-secondary">
              {formatDate(stitch.createdAt)}
            </p>
          </div>
          <Badge>STITCH</Badge>
        </div>
        <div className="mt-4 flex gap-2">
          <IconButtonLink
            label="Use in Swapr"
            href={getUseInSwaprStitchHref(stitch)}
            icon={<Shuffle aria-hidden className="h-4 w-4" />}
          />
          <a
            href={url ?? undefined}
            download={stitch.name}
            aria-label="Download stitch"
            title="Download stitch"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-text-secondary transition-colors hover:border-accent hover:text-accent"
          >
            <Download aria-hidden className="h-4 w-4" />
          </a>
          <IconButton
            label="Delete stitch"
            variant="danger"
            icon={<Trash2 aria-hidden className="h-4 w-4" />}
            onClick={() => void onDelete(stitch.id)}
          />
        </div>
      </div>
    </Panel>
  );
}
