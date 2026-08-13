"use client";

import { useSyncExternalStore } from "react";
import { getBrowserTimeZone } from "@/lib/clipstitchr/publishing/client/schedule/getBrowserTimeZone";
import { getServerBrowserTimeZoneSnapshot } from "@/lib/clipstitchr/publishing/client/schedule/getServerBrowserTimeZoneSnapshot";
import { subscribeToBrowserTimeZone } from "@/lib/clipstitchr/publishing/client/schedule/subscribeToBrowserTimeZone";

export function useBrowserTimeZone() {
  return useSyncExternalStore(
    subscribeToBrowserTimeZone,
    getBrowserTimeZone,
    getServerBrowserTimeZoneSnapshot,
  );
}
