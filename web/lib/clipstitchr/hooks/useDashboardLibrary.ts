"use client";

import { useContext } from "react";
import { DashboardLibraryContext } from "@/lib/clipstitchr/context/DashboardLibraryContext";

export function useDashboardLibrary() {
  const value = useContext(DashboardLibraryContext);

  if (!value) {
    throw new Error(
      "useDashboardLibrary must be used inside DashboardLibraryProvider.",
    );
  }

  return value;
}
