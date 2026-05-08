"use client";

import { REPLICATE_API_TOKEN_STORAGE_KEY } from "@/lib/clipstitchr/constants/replicateApiTokenStorageKey";
import { normalizeReplicateApiToken } from "@/lib/clipstitchr/utils/normalizeReplicateApiToken";

export function getStoredReplicateApiToken() {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    return normalizeReplicateApiToken(
      window.localStorage.getItem(REPLICATE_API_TOKEN_STORAGE_KEY),
    );
  } catch {
    return "";
  }
}
