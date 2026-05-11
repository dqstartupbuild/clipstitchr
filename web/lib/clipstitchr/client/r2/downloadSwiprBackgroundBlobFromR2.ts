import { createSwiprBackgroundDownloadUrl } from "@/lib/clipstitchr/client/r2/createSwiprBackgroundDownloadUrl";

export async function downloadSwiprBackgroundBlobFromR2(id: string) {
  const downloadUrl = await createSwiprBackgroundDownloadUrl(id);
  const response = await fetch(downloadUrl.url);

  if (!response.ok) {
    throw new Error("Unable to download Swipr background from R2.");
  }

  return await response.blob();
}
