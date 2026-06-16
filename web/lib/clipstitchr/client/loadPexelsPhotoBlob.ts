import type { PexelsPhotoResult } from "@/lib/clipstitchr/types/PexelsPhotoResult";
import { getPexelsPhotoDownloadUrl } from "@/lib/clipstitchr/utils/getPexelsPhotoDownloadUrl";

export async function loadPexelsPhotoBlob(photo: PexelsPhotoResult) {
  const response = await fetch(getPexelsPhotoDownloadUrl(photo));

  if (!response.ok) {
    throw new Error("Unable to load that Pexels photo.");
  }

  return await response.blob();
}
