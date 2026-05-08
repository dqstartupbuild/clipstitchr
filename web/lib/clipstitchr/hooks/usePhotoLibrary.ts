"use client";

import { useDashboardLibrary } from "@/lib/clipstitchr/hooks/useDashboardLibrary";

export function usePhotoLibrary() {
  return useDashboardLibrary().photoLibrary;
}
