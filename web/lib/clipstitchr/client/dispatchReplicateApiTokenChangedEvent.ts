"use client";

import { REPLICATE_API_TOKEN_CHANGED_EVENT_NAME } from "@/lib/clipstitchr/constants/replicateApiTokenChangedEventName";

export function dispatchReplicateApiTokenChangedEvent() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(REPLICATE_API_TOKEN_CHANGED_EVENT_NAME));
}
