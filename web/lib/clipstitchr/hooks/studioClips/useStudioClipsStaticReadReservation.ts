"use client";

import { useCallback, useEffect, useState } from "react";
import {
  useConvexAuth,
  useConvexConnectionState,
  useMutation,
} from "convex/react";
import { api } from "@/convex/_generated/api";

export function useStudioClipsStaticReadReservation(
  productId: string | undefined,
  enabled: boolean,
) {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const connection = useConvexConnectionState();
  const reserve = useMutation(
    api.studioClipsRateLimits.reserveStaticRead.reserveStaticRead,
  );
  const [attempt, setAttempt] = useState(0);
  const [reservedKey, setReservedKey] = useState<string | null>(null);
  const [failure, setFailure] = useState<{
    key: string;
    message: string;
  } | null>(null);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  const key = productId
    ? `${productId}:${connection.connectionCount}:${attempt}`
    : null;

  useEffect(() => {
    if (
      !enabled ||
      !productId ||
      !key ||
      !isAuthenticated ||
      !connection.isWebSocketConnected
    ) {
      return;
    }

    let stopped = false;

    void reserve({ productId })
      .then(() => {
        if (!stopped) setReservedKey(key);
      })
      .catch((caught) => {
        if (!stopped) {
          setFailure({
            key,
            message:
              caught instanceof Error
                ? caught.message
                : "Unable to open live clip updates.",
          });
        }
      });

    return () => {
      stopped = true;
    };
  }, [
    connection.isWebSocketConnected,
    enabled,
    isAuthenticated,
    key,
    productId,
    reserve,
  ]);

  const isReady = Boolean(
    enabled &&
      isAuthenticated &&
      connection.isWebSocketConnected &&
      key &&
      reservedKey === key,
  );
  const error =
    enabled && !isAuthLoading && !isAuthenticated
      ? "Sign in again to open live clip updates."
      : failure?.key === key
        ? failure.message
        : null;

  return {
    error,
    isLoading:
      enabled &&
      (isAuthLoading ||
        (isAuthenticated &&
          (!connection.isWebSocketConnected || (!isReady && !error)))),
    isReady,
    retry,
  };
}
