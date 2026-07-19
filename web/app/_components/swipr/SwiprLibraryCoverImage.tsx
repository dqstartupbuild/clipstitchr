"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { useIsNearViewport } from "@/lib/clipstitchr/hooks/useIsNearViewport";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

type SwiprLibraryCoverImageProps = {
  backgroundId: string;
  imageObject?: R2ObjectReference;
  onLoadBackgroundBlob: (
    id: string,
    imageObject?: R2ObjectReference,
  ) => Promise<Blob>;
};

export function SwiprLibraryCoverImage({
  backgroundId,
  imageObject,
  onLoadBackgroundBlob,
}: SwiprLibraryCoverImageProps) {
  const [url, setUrl] = useState<string | null>(null);
  const { elementRef, isNearViewport } = useIsNearViewport();

  useEffect(() => {
    if (!isNearViewport) {
      return;
    }

    let objectUrl: string | null = null;
    let isCancelled = false;

    void onLoadBackgroundBlob(backgroundId, imageObject)
      .then((blob) => {
        if (isCancelled) {
          return;
        }

        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (!isCancelled) {
          setUrl(null);
        }
      });

    return () => {
      isCancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [backgroundId, imageObject, isNearViewport, onLoadBackgroundBlob]);

  return (
    <div ref={elementRef} className="h-full w-full bg-surface-muted">
      {url ? (
        <img
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          src={url}
        />
      ) : null}
    </div>
  );
}
