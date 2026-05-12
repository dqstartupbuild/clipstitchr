import type { UploadLibraryTab } from "@/lib/clipstitchr/types/UploadLibraryTab";

export function getUploadLibraryTabFromSearchParams(
  searchParams: URLSearchParams,
): UploadLibraryTab {
  const tab = searchParams.get("tab");

  switch (tab) {
    case "ugc":
    case "clips":
    case "demo":
    case "swaps":
    case "swipes":
    case "stitches":
      return tab;
    default:
      return "all";
  }
}
