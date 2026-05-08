"use client";

import { useDashboardLibrary } from "@/lib/clipstitchr/hooks/useDashboardLibrary";

export function useClipLibrary() {
  return useDashboardLibrary().clipLibrary;
}
