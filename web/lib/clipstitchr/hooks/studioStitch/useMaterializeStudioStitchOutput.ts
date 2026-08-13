"use client";

import { useCallback, useState } from "react";
import type { StudioStitchMaterializeResult } from "@/lib/clipstitchr/types/studioStitch/StudioStitchMaterializeResult";
import type { StudioStitchOutput } from "./StudioStitchOutput";
import { createStudioStitchMaterializeRequest } from "./createStudioStitchMaterializeRequest";
import { readStudioStitchJsonResponse } from "./readStudioStitchJsonResponse";

export function useMaterializeStudioStitchOutput(
  productId: string | undefined,
) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const materialize = useCallback(
    async (output: StudioStitchOutput) => {
      if (!productId) return null;
      setBusyId(output.id);
      setError(null);
      setStatusMessage(null);
      try {
        const response = await fetch(
          `/api/studio/stitch/outputs/${encodeURIComponent(output.id)}/materialize`,
          {
            body: JSON.stringify(
              createStudioStitchMaterializeRequest(productId),
            ),
            headers: { "Content-Type": "application/json" },
            method: "POST",
          },
        );
        const result =
          await readStudioStitchJsonResponse<StudioStitchMaterializeResult>(
            response,
          );
        setStatusMessage(
          result.created
            ? "Accepted and saved to this Product's Library."
            : "This video is already accepted in this Product's Library.",
        );
        return result;
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Unable to accept and save this video.",
        );
        return null;
      } finally {
        setBusyId(null);
      }
    },
    [productId],
  );

  return { busyId, error, materialize, statusMessage };
}
