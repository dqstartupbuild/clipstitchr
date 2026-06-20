import { createCachedSwiprBackgroundDownloadUrl } from "@/lib/clipstitchr/client/r2/createCachedSwiprBackgroundDownloadUrl";

export async function downloadSwiprBackgroundBlobFromR2(id: string) {
  const downloadUrl = await createCachedSwiprBackgroundDownloadUrl(id);
  const response = await fetch(downloadUrl.url);

  if (!response.ok) {
    throw new Error("Unable to download Swipr background from R2.");
  }

  return await response.blob();
}
