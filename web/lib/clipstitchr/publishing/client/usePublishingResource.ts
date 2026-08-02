"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function usePublishingResource<Value>(
  request: (signal: AbortSignal) => Promise<Value>,
  requestKey: string | null,
) {
  const requestRef = useRef(request);
  const [reloadKey, setReloadKey] = useState(0);
  const requestToken =
    requestKey === null ? null : `${requestKey}\u0000${reloadKey}`;
  const [result, setResult] = useState<{
    data: Value | null;
    error: string | null;
    requestToken: string;
  } | null>(null);

  useEffect(() => {
    requestRef.current = request;
  }, [request]);

  useEffect(() => {
    if (requestToken === null) {
      return;
    }
    const controller = new AbortController();
    void requestRef.current(controller.signal).then(
      (value) => {
        if (!controller.signal.aborted) {
          setResult({ data: value, error: null, requestToken });
        }
      },
      (reason: unknown) => {
        if (!controller.signal.aborted) {
          setResult({
            data: null,
            error:
              reason instanceof Error
                ? reason.message
                : "Publishing could not load this view.",
            requestToken,
          });
        }
      },
    );
    return () => controller.abort();
  }, [requestToken]);

  const reload = useCallback(() => setReloadKey((value) => value + 1), []);
  const isCurrent = requestToken !== null && result?.requestToken === requestToken;

  return {
    data: isCurrent ? result.data : null,
    error: isCurrent ? result.error : null,
    isLoading: requestToken !== null && !isCurrent,
    reload,
  };
}
