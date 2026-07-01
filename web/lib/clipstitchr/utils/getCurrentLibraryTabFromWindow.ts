import { getLibraryTabFromSearchParams } from "@/lib/clipstitchr/utils/getLibraryTabFromSearchParams";

export function getCurrentLibraryTabFromWindow() {
  if (typeof window === "undefined") {
    return "ugc";
  }

  return getLibraryTabFromSearchParams(
    new URLSearchParams(window.location.search),
  );
}
