"use client";

import { useEffect, useMemo, useState } from "react";
import { createCachedR2DownloadUrl } from "@/lib/clipstitchr/client/r2/createCachedR2DownloadUrl";
import type { StudioEditorMediaSourceCatalog } from "@/lib/clipstitchr/types/studioEditor/StudioEditorMediaSourceCatalog";

export function useStudioEditorCatalogPosterUrls(
  catalog: StudioEditorMediaSourceCatalog,
) {
  const descriptors = useMemo(
    () => [...catalog.videoClips, ...catalog.stitches],
    [catalog],
  );
  const posterKey = descriptors
    .map((descriptor) => descriptor.posterKey ?? "")
    .filter(Boolean)
    .sort()
    .join("|");
  const [urls, setUrls] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    let active = true;
    const withPosters = descriptors.filter(
      (descriptor): descriptor is typeof descriptor & { posterKey: string } =>
        Boolean(descriptor.posterKey),
    );

    void Promise.all(
      withPosters.map(async (descriptor) => {
        const result = await createCachedR2DownloadUrl({
          key: descriptor.posterKey,
          contentType: "image/jpeg",
          size: 0,
        });
        return [descriptor.id, result.url] as const;
      }),
    ).then((entries) => {
      if (active) setUrls(new Map(entries));
    }).catch(() => {
      if (active) setUrls(new Map());
    });

    return () => {
      active = false;
    };
    // posterKey is the stable R2 identity set and the URL helper caches by key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posterKey]);

  return urls;
}
