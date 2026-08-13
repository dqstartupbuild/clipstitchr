import { createCachedR2DownloadUrl } from "@/lib/clipstitchr/client/r2/createCachedR2DownloadUrl";
import type { StudioEditorResolvedSource } from "@/lib/clipstitchr/types/StudioEditorResolvedSource";

export async function loadStudioEditorSourceBlob(
  source: StudioEditorResolvedSource,
) {
  const { url } = await createCachedR2DownloadUrl({
    key: source.objectKey,
    contentType: source.contentType ?? "application/octet-stream",
    size: 0,
  });
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Unable to load ${source.name} for this edit.`);
  }

  return await response.blob();
}
