import { createStitchExportBlob } from "@/lib/clipstitchr/client/createStitchExportBlob";
import { uploadBlobsToR2 } from "@/lib/clipstitchr/client/r2/uploadBlobsToR2";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";

type CreateRenderedStitchVideoUploadOptions = {
  loadClip: (id: string) => Promise<VideoClip | null>;
  onProgress?: (progress: number) => void;
  stitch: Stitch;
};

export type RenderedStitchVideoUpload = {
  blob: Blob;
  mimeType: string;
  size: number;
  stitchObject: R2ObjectReference;
};

export async function createRenderedStitchVideoUpload({
  loadClip,
  onProgress,
  stitch,
}: CreateRenderedStitchVideoUploadOptions): Promise<RenderedStitchVideoUpload> {
  const blob = await createStitchExportBlob(stitch, {
    includePosterMetadata: false,
    loadClip,
    onProgress,
  });
  const [stitchObject] = await uploadBlobsToR2([
    {
      blob,
      kind: "stitch-video",
      recordId: stitch.id,
    },
  ]);
  const mimeType = blob.type || stitchObject.contentType || "video/mp4";

  return {
    blob,
    mimeType,
    size: blob.size,
    stitchObject: {
      ...stitchObject,
      contentType: mimeType,
      size: blob.size,
    },
  };
}
