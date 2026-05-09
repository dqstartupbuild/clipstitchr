import type { UploadLibraryTab } from "@/lib/clipstitchr/types/UploadLibraryTab";

export function getUploadLibraryTabFromSearchParams(
  searchParams: URLSearchParams,
): UploadLibraryTab {
  const tab = searchParams.get("tab");

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
