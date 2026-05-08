"use client";

import { useCallback, useSyncExternalStore } from "react";
import { clearStoredReplicateApiToken } from "@/lib/clipstitchr/client/clearStoredReplicateApiToken";
import { getStoredReplicateApiToken } from "@/lib/clipstitchr/client/getStoredReplicateApiToken";
import { saveStoredReplicateApiToken } from "@/lib/clipstitchr/client/saveStoredReplicateApiToken";
import { subscribeToReplicateApiToken } from "@/lib/clipstitchr/client/subscribeToReplicateApiToken";

export function useReplicateApiToken() {
  const token = useSyncExternalStore(
    subscribeToReplicateApiToken,
    getStoredReplicateApiToken,
    () => "",
  );

  const saveToken = useCallback((nextToken: string) => {
    saveStoredReplicateApiToken(nextToken);
  }, []);

  const clearToken = useCallback(() => {
    clearStoredReplicateApiToken();
  }, []);

  return {
    token,
    hasToken: Boolean(token),
    saveToken,
    clearToken,
  };
}
