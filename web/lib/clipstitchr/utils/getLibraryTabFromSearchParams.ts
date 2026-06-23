import type { LibraryTab } from "@/lib/clipstitchr/types/LibraryTab";

export function getLibraryTabFromSearchParams(
  searchParams: URLSearchParams,
): LibraryTab {
  const tab = searchParams.get("tab");

  switch (tab) {
    case "ugc":
    case "demo":
    case "swaps":
    case "swipes":
    case "hooks":
    case "pexels":
    case "stitches":
    case "avatars":
    case "templates":
      return tab;
    case "all":
    case "clips":
      return "ugc";
    default:
      return "ugc";
  }
}
