"use client";

import { useCallback, useState } from "react";
import type { StudioClipsCaptionStyle } from "@/lib/clipstitchr/types/studioClips/StudioClipsCaptionStyle";
import type { StudioClipsProductStyleResponse } from "@/lib/clipstitchr/types/studioClips/StudioClipsProductStyleResponse";
import { createStudioClipsProductStyleRequest } from "./createStudioClipsProductStyleRequest";
import { readStudioClipsJsonResponse } from "./readStudioClipsJsonResponse";

export function useSaveStudioClipsProductStyle(
  productId: string | undefined,
) {
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const saveStyle = useCallback(
    async (style: StudioClipsCaptionStyle) => {
      if (!productId) return null;
      setError(null);
      setIsSaving(true);
      setStatusMessage(null);
      try {
        const response = await fetch("/api/studio/clips/product-style", {
          body: JSON.stringify(
            createStudioClipsProductStyleRequest(productId, style),
          ),
          headers: { "Content-Type": "application/json" },
          method: "PUT",
        });
        const result =
          await readStudioClipsJsonResponse<StudioClipsProductStyleResponse>(
            response,
          );
        setStatusMessage(
          result.renderRevision?.status === "provider_unavailable"
            ? `Product style saved. ${
                result.renderRevision.failure?.message ??
                "Finished clips could not be updated from their available sources."
              }`
            : result.renderRevision
            ? "Product style saved. A batch render is queued for finished clips."
            : "Product style saved for future renders.",
        );
        return result;
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Unable to save this Product style.",
        );
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [productId],
  );

  return { error, isSaving, saveStyle, statusMessage };
}
