"use client";

import { useCallback, useState } from "react";
import type { StudioStitchReviewSubset } from "./StudioStitchReviewSubset";
import { createStudioStitchClientId } from "./createStudioStitchClientId";
import { readStudioStitchJsonResponse } from "./readStudioStitchJsonResponse";

export function useApproveStudioStitchReview(productId: string | undefined) {
  const [error, setError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  const approve = useCallback(
    async (
      reviewSubset: StudioStitchReviewSubset,
      approvedOutputIds: readonly string[],
    ) => {
      if (!productId) return null;
      setError(null);
      setIsApproving(true);
      try {
        const response = await fetch(
          `/api/studio/stitch/reviews/${encodeURIComponent(reviewSubset.id)}/approve`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId,
              approvedOutputIds,
              expectedRevision: reviewSubset.revision,
              idempotencyKey: createStudioStitchClientId("approve_review"),
            }),
          },
        );
        return (
          await readStudioStitchJsonResponse<{
            changed: boolean;
            reviewSubset: StudioStitchReviewSubset;
          }>(response)
        ).reviewSubset;
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Unable to approve this sample review.",
        );
        return null;
      } finally {
        setIsApproving(false);
      }
    },
    [productId],
  );

  return { approve, error, isApproving };
}
