"use client";

import { useEffect, useState } from "react";
import type { HookLibraryTemplateSummary } from "@/lib/clipstitchr/types/HookLibraryTemplateSummary";

export function useHookLabRelatedTemplates(postId: string) {
  const [result, setResult] = useState<{
    postId: string;
    templates: HookLibraryTemplateSummary[];
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void fetch(
      `/api/hook-lab/templates/related?postId=${encodeURIComponent(postId)}`,
      { signal: controller.signal },
    )
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load related hooks.");
        }

        return (await response.json()) as {
          items?: HookLibraryTemplateSummary[];
        };
      })
      .then((response) =>
        setResult({ postId, templates: response.items ?? [] }),
      )
      .catch((error) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setResult({ postId, templates: [] });
        }
      });

    return () => controller.abort();
  }, [postId]);

  return {
    isLoading: result?.postId !== postId,
    templates: result?.postId === postId ? result.templates : [],
  };
}
