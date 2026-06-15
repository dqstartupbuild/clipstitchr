import {
  createRenderedStitchVideoUpload,
  type RenderedStitchVideoUpload,
} from "@/lib/clipstitchr/client/createRenderedStitchVideoUpload";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";

type UpdateRenderedStitchVideo = (args: {
  id: string;
  mimeType: string;
  size: number;
  stitchObject: R2ObjectReference;
}) => Promise<unknown>;

type SaveRenderedStitchVideoOptions = {
  loadClip: (id: string) => Promise<VideoClip | null>;
  onProgress?: (progress: number) => void;
  stitch: Stitch;
  updateRenderedVideo: UpdateRenderedStitchVideo;
};

export async function saveRenderedStitchVideo({
  loadClip,
  onProgress,
  stitch,
  updateRenderedVideo,
}: SaveRenderedStitchVideoOptions): Promise<RenderedStitchVideoUpload> {
  const renderedVideo = await createRenderedStitchVideoUpload({
    loadClip,
    onProgress,
    stitch,
  });

  await updateRenderedVideo({
    id: stitch.id,
    mimeType: renderedVideo.mimeType,
    size: renderedVideo.size,
    stitchObject: renderedVideo.stitchObject,
  });

  return renderedVideo;
}
