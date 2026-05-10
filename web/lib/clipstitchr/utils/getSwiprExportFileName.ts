import { getAssetDownloadFileName } from "@/lib/clipstitchr/utils/getAssetDownloadFileName";

export function getSwiprExportFileName(productName: string) {
  const name = productName.trim() || "carousel";

  return getAssetDownloadFileName(`swipr-${name}-carousel`, "zip");
}
