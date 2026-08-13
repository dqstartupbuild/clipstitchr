"use client";

import { useEffect, useState } from "react";
import { downloadCachedR2ImageBlobs } from "@/lib/clipstitchr/client/r2/downloadCachedR2ImageBlobs";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import type { StudioBetaWorkspaceMediaCard } from "@/lib/clipstitchr/types/StudioBetaWorkspaceMediaCard";

const emptyStudioBetaPosterUrls: Record<string, string> = {};

export function useStudioBetaPosterUrls(
  mediaCards: StudioBetaWorkspaceMediaCard[],
) {
  const [urlsByKey, setUrlsByKey] = useState<Record<string, string>>({});
  const hasPosterObjects = mediaCards.some((mediaCard) => mediaCard.posterObject);

  useEffect(() => {
    const posterObjects = mediaCards
      .map((mediaCard) => mediaCard.posterObject)
      .filter(
        (posterObject): posterObject is R2ObjectReference =>
          Boolean(posterObject),
      );
    const objectUrls: string[] = [];
    let isActive = true;

    if (posterObjects.length === 0) {
      return () => undefined;
    }

    void downloadCachedR2ImageBlobs(posterObjects)
      .then((blobsByKey) => {
        if (!isActive) {
          return;
        }

        const nextUrlsByKey: Record<string, string> = {};

        for (const [key, blob] of blobsByKey.entries()) {
          const objectUrl = URL.createObjectURL(blob);

          objectUrls.push(objectUrl);
          nextUrlsByKey[key] = objectUrl;
        }

        setUrlsByKey(nextUrlsByKey);
      })
      .catch(() => {
        if (isActive) {
          setUrlsByKey({});
        }
      });

    return () => {
      isActive = false;
      objectUrls.forEach((objectUrl) => URL.revokeObjectURL(objectUrl));
    };
  }, [mediaCards]);

  return hasPosterObjects ? urlsByKey : emptyStudioBetaPosterUrls;
}
