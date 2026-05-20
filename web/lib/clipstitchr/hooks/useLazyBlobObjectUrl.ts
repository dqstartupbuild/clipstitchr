"use client";

import { useEffect, useState } from "react";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";

type UseLazyBlobObjectUrlOptions = {
  cacheKey?: string;
  fallbackBlob?: Blob | null;
  loadBlob: () => Promise<Blob | null | undefined>;
};

export function useLazyBlobObjectUrl({
  cacheKey,
  fallbackBlob,
  loadBlob,
}: UseLazyBlobObjectUrlOptions) {
  const [blobState, setBlobState] = useState<{
    blob: Blob | null;
    cacheKey?: string;
  }>(() => ({
    blob: fallbackBlob ?? null,
    cacheKey,
  }));
  const isCachedState = blobState.cacheKey === cacheKey;
  const blob = isCachedState ? blobState.blob : (fallbackBlob ?? null);
  const url = useObjectUrl(blob);

  useEffect(() => {
    let isActive = true;

    if (fallbackBlob) {
      void Promise.resolve().then(() => {
        if (isActive) {
          setBlobState({ blob: fallbackBlob, cacheKey });
        }
      });

      return () => {
        isActive = false;
      };
    }

    if (!cacheKey) {
      void Promise.resolve().then(() => {
        if (isActive) {
          setBlobState({ blob: null, cacheKey });
        }
      });

      return () => {
        isActive = false;
      };
    }

    void loadBlob()
      .then((nextBlob) => {
        if (isActive) {
          setBlobState({ blob: nextBlob ?? null, cacheKey });
        }
      })
      .catch(() => {
        if (isActive) {
          setBlobState({ blob: null, cacheKey });
        }
      });

    return () => {
      isActive = false;
    };
  }, [cacheKey, fallbackBlob, loadBlob]);

  return url;
}
