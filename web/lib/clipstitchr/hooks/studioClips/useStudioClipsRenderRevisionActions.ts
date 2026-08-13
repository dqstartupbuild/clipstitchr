"use client";

import { useCallback, useState } from "react";
import type { StudioClipsRenderRevisionActionResponse } from "@/lib/clipstitchr/types/studioClips/StudioClipsRenderRevisionActionResponse";
import type { StudioClipsRenderRevisionSummary } from "@/lib/clipstitchr/types/studioClips/StudioClipsRenderRevisionSummary";
import type { StudioClipsRenderRevisionAction } from "./StudioClipsRenderRevisionAction";
import { createStudioClipsIdempotencyKey } from "./createStudioClipsIdempotencyKey";
import { readStudioClipsJsonResponse } from "./readStudioClipsJsonResponse";

export function useStudioClipsRenderRevisionActions(
  productId: string | undefined,
) {
  const [busyAction, setBusyAction] =
    useState<StudioClipsRenderRevisionAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateRevision = useCallback(
    async (
      revision: StudioClipsRenderRevisionSummary,
      action: StudioClipsRenderRevisionAction,
    ) => {
      if (!productId) return null;
      setBusyAction(action);
      setError(null);
      try {
        const response = await fetch(
          `/api/studio/clips/render-revisions/${encodeURIComponent(revision.id)}/${action}`,
          {
            body: JSON.stringify({
              idempotencyKey: createStudioClipsIdempotencyKey(
                `${action}_render_revision`,
              ),
              productId,
            }),
            headers: { "Content-Type": "application/json" },
            method: "POST",
          },
        );
        return (
          await readStudioClipsJsonResponse<StudioClipsRenderRevisionActionResponse>(
            response,
          )
        ).renderRevision;
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : `Unable to ${action} this render revision.`,
        );
        return null;
      } finally {
        setBusyAction(null);
      }
    },
    [productId],
  );

  return { busyAction, error, updateRevision };
}
