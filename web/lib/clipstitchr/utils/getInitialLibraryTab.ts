import type { LibraryTab } from "@/lib/clipstitchr/types/LibraryTab";
import { getLibraryTabFromSearchParams } from "@/lib/clipstitchr/utils/getLibraryTabFromSearchParams";

export function getInitialLibraryTab(): LibraryTab {
  if (typeof window === "undefined") {
    return "ugc";
  }

  return getLibraryTabFromSearchParams(
    new URLSearchParams(window.location.search),
  );
}
