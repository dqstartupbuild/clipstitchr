"use client";

import { dispatchReplicateApiTokenChangedEvent } from "@/lib/clipstitchr/client/dispatchReplicateApiTokenChangedEvent";
import { REPLICATE_API_TOKEN_STORAGE_KEY } from "@/lib/clipstitchr/constants/replicateApiTokenStorageKey";

export function clearStoredReplicateApiToken() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(REPLICATE_API_TOKEN_STORAGE_KEY);
    dispatchReplicateApiTokenChangedEvent();
  } catch {
    return;
  }
}
