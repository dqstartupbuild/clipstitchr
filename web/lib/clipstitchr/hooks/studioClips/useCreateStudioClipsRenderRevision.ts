"use client";

import { useCallback, useState } from "react";
import type { StudioClipsOutput } from "@/lib/clipstitchr/types/studioClips/StudioClipsOutput";
import type { StudioClipsRenderOperation } from "@/lib/clipstitchr/types/studioClips/StudioClipsRenderOperation";
import type { StudioClipsRenderRevisionResponse } from "@/lib/clipstitchr/types/studioClips/StudioClipsRenderRevisionResponse";
import { createStudioClipsRenderRevisionRequest } from "./createStudioClipsRenderRevisionRequest";
import { readStudioClipsJsonResponse } from "./readStudioClipsJsonResponse";

export function useCreateStudioClipsRenderRevision(
  productId: string | undefined,
) {
  const [busyOutputId, setBusyOutputId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const createRevision = useCallback(
    async (
      taskId: string,
      sourceOutput: StudioClipsOutput,
      operation: StudioClipsRenderOperation,
    ) => {
      if (!productId) return null;
      setBusyOutputId(sourceOutput.id);
      setError(null);
      setStatusMessage(null);
      try {
        const response = await fetch("/api/studio/clips/render-revisions", {
          body: JSON.stringify(
            createStudioClipsRenderRevisionRequest(
              productId,
              taskId,
              sourceOutput,
              operation,
            ),
          ),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });
        const result =
          await readStudioClipsJsonResponse<StudioClipsRenderRevisionResponse>(
            response,
          );
        setStatusMessage(
          result.renderRevision.status === "provider_unavailable"
            ? result.renderRevision.failure?.message ??
              "This version could not be rendered from the available source."
            : result.created
            ? "A new render revision is queued."
            : "That render revision was already queued.",
        );
        return result.renderRevision;
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Unable to start this render revision.",
        );
        return null;
      } finally {
        setBusyOutputId(null);
      }
    },
    [productId],
  );

  return {
    busyOutputId,
    createRevision,
    error,
    statusMessage,
  };
}
