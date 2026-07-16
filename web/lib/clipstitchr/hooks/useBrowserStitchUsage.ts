"use client";

import { useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { BrowserStitchUsageReservation } from "@/lib/clipstitchr/types/BrowserStitchUsageReservation";

export function useBrowserStitchUsage() {
  const reserveCreationCredits = useMutation(
    api.usage.reserveCreationCredits.reserveCreationCredits,
  );
  const cancelUsageReservation = useMutation(
    api.usage.cancelUsageReservation.cancelUsageReservation,
  );
  const releaseBrowserGenerationSlot = useMutation(
    api.usage.releaseBrowserGenerationSlot.releaseBrowserGenerationSlot,
  );

  const reserveStitchUsage = useCallback(
    async (stitchId: string): Promise<BrowserStitchUsageReservation> => {
      const usageIdempotencyKey = `stitch:${stitchId}`;
      const result = await reserveCreationCredits({
        domainId: stitchId,
        domainKind: "stitch",
        idempotencyKey: usageIdempotencyKey,
        now: new Date().toISOString(),
        operation: "stitch",
        reservationKind: "browser",
      });

      return {
        generationSlotId: result.generationSlotId,
        reservationId: result.reservationId,
        usageIdempotencyKey,
      };
    },
    [reserveCreationCredits],
  );

  const cancelStitchUsage = useCallback(
    async (usage: BrowserStitchUsageReservation) => {
      const now = new Date().toISOString();

      if (usage.reservationId) {
        await cancelUsageReservation({
          now,
          reason: "Browser Stitch did not finish",
          reservationId: usage.reservationId,
        });
        return;
      }

      if (usage.generationSlotId) {
        await releaseBrowserGenerationSlot({
          now,
          reason: "Browser Stitch did not finish",
          slotId: usage.generationSlotId,
        });
      }
    },
    [cancelUsageReservation, releaseBrowserGenerationSlot],
  );

  return { cancelStitchUsage, reserveStitchUsage };
}
