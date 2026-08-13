"use client";

import { useEffect, useMemo, useState } from "react";
import { createCachedR2DownloadUrl } from "@/lib/clipstitchr/client/r2/createCachedR2DownloadUrl";
import { getStudioEditorResolvedSources } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorResolvedSources";
import type { StudioEditorMediaSourceCatalog } from "@/lib/clipstitchr/types/studioEditor/StudioEditorMediaSourceCatalog";
import type { StudioEditorProjectV1 } from "@/lib/clipstitchr/types/studioEditor/StudioEditorProjectV1";

export function useStudioEditorSourceUrls(
  project: StudioEditorProjectV1,
  catalog: StudioEditorMediaSourceCatalog,
) {
  const sources = useMemo(
    () => getStudioEditorResolvedSources(project, catalog),
    [catalog, project],
  );
  const sourceKey = sources.map((source) => source.identity).sort().join("|");
  const [urls, setUrls] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(sources.length > 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (sources.length === 0) {
      return () => {
        active = false;
      };
    }

    void Promise.resolve()
      .then(() => {
        if (active) {
          setIsLoading(true);
          setError(null);
        }
        return Promise.all(
          sources.map(async (source) => {
            const signed = await createCachedR2DownloadUrl({
              key: source.objectKey,
              contentType: source.contentType ?? "application/octet-stream",
              size: 0,
            });
            return [source.identity, signed.url] as const;
          }),
        );
      })
      .then((entries) => {
        if (active) setUrls(new Map(entries));
      })
      .catch((caught) => {
        if (active) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Unable to open one of the edit sources.",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
    // sourceKey is the stable identity boundary; signed URLs are cached by key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceKey]);

  return {
    error: sources.length === 0 ? null : error,
    isLoading: sources.length === 0 ? false : isLoading,
    sources,
    urls: sources.length === 0 ? new Map<string, string>() : urls,
  };
}
