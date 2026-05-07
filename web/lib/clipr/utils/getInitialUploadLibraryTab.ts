import type { UploadLibraryTab } from "@/lib/clipr/types/UploadLibraryTab";

export function getInitialUploadLibraryTab(): UploadLibraryTab {
  if (typeof window === "undefined") {
    return "ugc";
  }

  return window.location.search.includes("tab=photos") ? "photos" : "ugc";
}
