import { createMediaInput } from "@/lib/clipstitchr/media/createMediaInput";
import { getClipMetadata } from "@/lib/clipstitchr/media/getClipMetadata";
import { getImageDimensions } from "@/lib/clipstitchr/media/getImageDimensions";
import type { StudioEditorUploadedMediaMetadata } from "@/lib/clipstitchr/types/StudioEditorUploadedMediaMetadata";

export async function readStudioEditorUploadedMediaMetadata(
  file: File,
): Promise<StudioEditorUploadedMediaMetadata> {
  if (file.type.startsWith("image/")) {
    return { kind: "image", ...(await getImageDimensions(file)) };
  }

  const input = createMediaInput(file);

  try {
    if (file.type.startsWith("video/")) {
      const metadata = await getClipMetadata(input);
      return {
        kind: "video",
        durationSeconds: metadata.duration,
        width: metadata.width,
        height: metadata.height,
        hasAudio: metadata.hasAudio,
      };
    }

    if (!(await input.canRead())) {
      throw new Error("That file is not readable in this browser.");
    }

    const audioTrack = await input.getPrimaryAudioTrack();

    if (!audioTrack) {
      throw new Error("Choose a video, image, or audio file.");
    }

    return {
      kind: "audio",
      durationSeconds: await audioTrack.computeDuration(),
    };
  } finally {
    input.dispose();
  }
}
