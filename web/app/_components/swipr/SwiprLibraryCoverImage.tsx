"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";

type SwiprLibraryCoverImageProps = {
  backgroundId: string;
  onLoadBackgroundBlob: (id: string) => Promise<Blob>;
};

export function SwiprLibraryCoverImage({
  backgroundId,
  onLoadBackgroundBlob,
}: SwiprLibraryCoverImageProps) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let isCancelled = false;

    void onLoadBackgroundBlob(backgroundId)
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
  }, [backgroundId, onLoadBackgroundBlob]);

  return url ? (
    <img
      alt=""
      className="h-full w-full object-cover"
      loading="lazy"
      src={url}
    />
  ) : (
    <div className="h-full w-full bg-surface-muted" />
  );
}
