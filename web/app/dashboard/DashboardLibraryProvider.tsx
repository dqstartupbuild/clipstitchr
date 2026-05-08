"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { DashboardLibraryContext } from "@/lib/clipstitchr/context/DashboardLibraryContext";
import { useClipLibraryState } from "@/lib/clipstitchr/hooks/useClipLibraryState";
import { usePhotoLibraryState } from "@/lib/clipstitchr/hooks/usePhotoLibraryState";

type DashboardLibraryProviderProps = {
  children: ReactNode;
};

export function DashboardLibraryProvider({
  children,
}: DashboardLibraryProviderProps) {
  const clipLibrary = useClipLibraryState();
  const photoLibrary = usePhotoLibraryState();
  const value = useMemo(
    () => ({
      clipLibrary,
      photoLibrary,
    }),
    [clipLibrary, photoLibrary],
  );

  return (
    <DashboardLibraryContext.Provider value={value}>
      {children}
    </DashboardLibraryContext.Provider>
  );
}
