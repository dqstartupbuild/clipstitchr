"use client";

import { useCallback } from "react";
import { downloadCachedR2ImageBlobs } from "@/lib/clipstitchr/client/r2/downloadCachedR2ImageBlobs";
import { useLazyBlobObjectUrl } from "@/lib/clipstitchr/hooks/useLazyBlobObjectUrl";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

type HookLabIdeaThumbnailProps = {
  ideaName: string;
  originalText?: string;
  sourceLabel: string;
  thumbnailObject?: R2ObjectReference;
};

export function HookLabIdeaThumbnail({
  ideaName,
  originalText,
  sourceLabel,
  thumbnailObject,
}: HookLabIdeaThumbnailProps) {
  const loadThumbnailBlob = useCallback(async () => {
    if (!thumbnailObject) {
      return null;
    }

    const blobsByKey = await downloadCachedR2ImageBlobs([thumbnailObject]);

    return blobsByKey.get(thumbnailObject.key) ?? null;
  }, [thumbnailObject]);
  const thumbnailUrl = useLazyBlobObjectUrl({
    cacheKey: thumbnailObject?.key,
    loadBlob: loadThumbnailBlob,
  });

  return (
    <div className="mt-4 flex min-h-40 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-muted">
      {thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={`${sourceLabel} preview for ${ideaName}`}
          className="aspect-video size-full object-cover"
          loading="lazy"
          src={thumbnailUrl}
        />
      ) : (
        <div className="max-w-xs px-5 text-center">
          <p className="text-pretty text-sm font-semibold text-text-primary">
            {originalText || "A fresh take is on the way."}
          </p>
        </div>
      )}
    </div>
  );
}
