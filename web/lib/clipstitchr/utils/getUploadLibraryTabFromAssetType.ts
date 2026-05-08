import type { UploadAssetType } from "@/lib/clipstitchr/types/UploadAssetType";
import type { UploadLibraryTab } from "@/lib/clipstitchr/types/UploadLibraryTab";

export function getUploadLibraryTabFromAssetType(
  assetType: UploadAssetType,
): UploadLibraryTab {
  return assetType === "photo" ? "photos" : assetType;
}
