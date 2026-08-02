"use client";

import { useSyncExternalStore } from "react";
import { getBrowserTimeZone } from "@/lib/clipstitchr/publishing/client/schedule/getBrowserTimeZone";

const subscribe = () => () => undefined;
const getServerSnapshot = () => null;

export function useBrowserTimeZone() {
  return useSyncExternalStore(subscribe, getBrowserTimeZone, getServerSnapshot);
}
