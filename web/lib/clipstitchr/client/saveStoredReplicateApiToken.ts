"use client";

import { dispatchReplicateApiTokenChangedEvent } from "@/lib/clipstitchr/client/dispatchReplicateApiTokenChangedEvent";
import { REPLICATE_API_TOKEN_STORAGE_KEY } from "@/lib/clipstitchr/constants/replicateApiTokenStorageKey";
import { normalizeReplicateApiToken } from "@/lib/clipstitchr/utils/normalizeReplicateApiToken";

export function saveStoredReplicateApiToken(token: string) {
  const normalizedToken = normalizeReplicateApiToken(token);

  if (typeof window === "undefined") {
    return normalizedToken;
  }

  try {
    if (normalizedToken) {
      window.localStorage.setItem(
        REPLICATE_API_TOKEN_STORAGE_KEY,
        normalizedToken,
      );
    } else {
      window.localStorage.removeItem(REPLICATE_API_TOKEN_STORAGE_KEY);
    }

    dispatchReplicateApiTokenChangedEvent();
  } catch {
    return normalizedToken;
  }

  return normalizedToken;
}
