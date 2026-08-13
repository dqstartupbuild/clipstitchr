"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useStudioClipsStaticReadReservation } from "./useStudioClipsStaticReadReservation";

export function useStudioClipsTaskDetail(
  productId: string | undefined,
  taskId: string | null,
) {
  const enabled = Boolean(productId && taskId);
  const reservation = useStudioClipsStaticReadReservation(productId, enabled);
  const task = useQuery(
    api.studioClipsTasks.get.get,
    reservation.isReady && productId && taskId
      ? { id: taskId, productId }
      : "skip",
  );

  return {
    error: reservation.error,
    isLoading:
      reservation.isLoading ||
      (reservation.isReady && task === undefined),
    isMissing: reservation.isReady && task === null,
    reload: reservation.retry,
    task: task ?? null,
  };
}
