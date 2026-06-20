import { createCachedMusicTrackDownloadUrl } from "@/lib/clipstitchr/client/r2/createCachedMusicTrackDownloadUrl";

export async function downloadMusicTrackBlobFromR2(id: string) {
  const downloadUrl = await createCachedMusicTrackDownloadUrl(id);
  const response = await fetch(downloadUrl.url);

  if (!response.ok) {
    throw new Error("Unable to download music from R2.");
  }

  return await response.blob();
}
