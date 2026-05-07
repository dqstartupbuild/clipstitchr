import type { UploadAssetType } from "@/lib/clipr/types/UploadAssetType";
import type { UploadLibraryTab } from "@/lib/clipr/types/UploadLibraryTab";

export function getUploadAssetTypeFromLibraryTab(
  tab: UploadLibraryTab,
): UploadAssetType {
  return tab === "photos" ? "photo" : tab;
}
