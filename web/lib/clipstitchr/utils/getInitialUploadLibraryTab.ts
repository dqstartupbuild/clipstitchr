import type { UploadLibraryTab } from "@/lib/clipstitchr/types/UploadLibraryTab";
import { getUploadLibraryTabFromSearchParams } from "@/lib/clipstitchr/utils/getUploadLibraryTabFromSearchParams";

export function getInitialUploadLibraryTab(): UploadLibraryTab {
  if (typeof window === "undefined") {
    return "all";
  }

  return getUploadLibraryTabFromSearchParams(
    new URLSearchParams(window.location.search),
  );
}
