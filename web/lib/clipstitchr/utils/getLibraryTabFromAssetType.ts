import type { UploadAssetType } from "@/lib/clipstitchr/types/UploadAssetType";
import type { LibraryTab } from "@/lib/clipstitchr/types/LibraryTab";

export function getLibraryTabFromAssetType(
  assetType: UploadAssetType,
): LibraryTab {
  return assetType === "photo" ? "avatars" : assetType;
}
