import { downloadBlobFromR2 } from "@/lib/clipstitchr/client/r2/downloadBlobFromR2";
import { downloadMusicTrackBlobFromR2 } from "@/lib/clipstitchr/client/r2/downloadMusicTrackBlobFromR2";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

type DownloadMusicBlobOptions = {
  audioObject: R2ObjectReference;
  sharedTrackId?: string;
};

export async function downloadMusicBlob({
  audioObject,
  sharedTrackId,
}: DownloadMusicBlobOptions) {
  if (sharedTrackId) {
    const blob = await downloadMusicTrackBlobFromR2(sharedTrackId);

    if (blob.type === audioObject.contentType) {
      return blob;
    }

    return new Blob([blob], { type: audioObject.contentType });
  }

  return await downloadBlobFromR2(audioObject);
}
