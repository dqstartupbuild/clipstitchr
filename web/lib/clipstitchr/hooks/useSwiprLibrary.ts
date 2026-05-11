"use client";

import { useDashboardLibrary } from "@/lib/clipstitchr/hooks/useDashboardLibrary";

export function useSwiprLibrary() {
  return useDashboardLibrary().swiprLibrary;
}
