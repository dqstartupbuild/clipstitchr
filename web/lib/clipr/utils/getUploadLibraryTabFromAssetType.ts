import type { UploadAssetType } from "@/lib/clipr/types/UploadAssetType";
import type { UploadLibraryTab } from "@/lib/clipr/types/UploadLibraryTab";

export function getUploadLibraryTabFromAssetType(
  assetType: UploadAssetType,
): UploadLibraryTab {
  return assetType === "photo" ? "photos" : assetType;
}
