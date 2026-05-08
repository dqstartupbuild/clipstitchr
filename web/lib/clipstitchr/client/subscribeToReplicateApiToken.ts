"use client";

import { REPLICATE_API_TOKEN_CHANGED_EVENT_NAME } from "@/lib/clipstitchr/constants/replicateApiTokenChangedEventName";
import { REPLICATE_API_TOKEN_STORAGE_KEY } from "@/lib/clipstitchr/constants/replicateApiTokenStorageKey";

export function subscribeToReplicateApiToken(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === REPLICATE_API_TOKEN_STORAGE_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener(
    REPLICATE_API_TOKEN_CHANGED_EVENT_NAME,
    onStoreChange,
  );
  window.addEventListener("storage", handleStorageChange);

  return () => {
    window.removeEventListener(
      REPLICATE_API_TOKEN_CHANGED_EVENT_NAME,
      onStoreChange,
    );
    window.removeEventListener("storage", handleStorageChange);
  };
}
