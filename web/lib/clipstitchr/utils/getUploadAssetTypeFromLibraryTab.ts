import type { UploadAssetType } from "@/lib/clipstitchr/types/UploadAssetType";
import type { UploadLibraryTab } from "@/lib/clipstitchr/types/UploadLibraryTab";

export function getUploadAssetTypeFromLibraryTab(
  tab: UploadLibraryTab,
): UploadAssetType {
  return tab === "demo" ? "demo" : "ugc";
}
