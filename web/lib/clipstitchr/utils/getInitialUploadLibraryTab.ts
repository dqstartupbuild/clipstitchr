import type { UploadLibraryTab } from "@/lib/clipstitchr/types/UploadLibraryTab";

export function getInitialUploadLibraryTab(): UploadLibraryTab {
  if (typeof window === "undefined") {
    return "all";
  }

  const tab = new URLSearchParams(window.location.search).get("tab");

  switch (tab) {
    case "ugc":
    case "demo":
    case "swaps":
    case "stitches":
      return tab;
    default:
      return "all";
  }
}
