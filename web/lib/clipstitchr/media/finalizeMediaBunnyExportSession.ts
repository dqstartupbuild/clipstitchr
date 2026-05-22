import { createVideoBlobFromBuffer } from "@/lib/clipstitchr/media/createVideoBlobFromBuffer";
import { getVideoMimeType } from "@/lib/clipstitchr/media/getVideoMimeType";
import type { MediaBunnyExportSession } from "@/lib/clipstitchr/types/MediaBunnyExportSession";

type FinalizeMediaBunnyExportSessionOptions = {
  onProgress?: (progress: number) => void;
  session: MediaBunnyExportSession;
};

export async function finalizeMediaBunnyExportSession({
  onProgress,
  session,
}: FinalizeMediaBunnyExportSessionOptions) {
  session.videoSource.close();
  session.audioSource?.close();

  await session.output.finalize();

  onProgress?.(1);

  const mimeType = await getVideoMimeType(session.output);
  const blob = createVideoBlobFromBuffer(
    session.output.target.buffer,
    mimeType,
  );

  return { blob, mimeType };
}
