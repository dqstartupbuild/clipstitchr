import { CanvasSink } from "mediabunny";
import { createMediaInput } from "@/lib/clipstitchr/media/createMediaInput";
import { loadStudioEditorSourceBlob } from "@/lib/clipstitchr/media/studioEditor/loadStudioEditorSourceBlob";
import type { StudioEditorRenderResource } from "@/lib/clipstitchr/types/StudioEditorRenderResource";
import type { StudioEditorResolvedSource } from "@/lib/clipstitchr/types/StudioEditorResolvedSource";
import type { StudioEditorCanvasV1 } from "@/lib/clipstitchr/types/studioEditor/StudioEditorCanvasV1";

export async function createStudioEditorRenderResource(
  source: StudioEditorResolvedSource,
  canvas: StudioEditorCanvasV1,
): Promise<StudioEditorRenderResource> {
  const blob = await loadStudioEditorSourceBlob(source);

  if (blob.type.startsWith("image/")) {
    return {
      source,
      blob,
      image: await createImageBitmap(blob),
    };
  }

  const input = createMediaInput(blob);

  try {
    if (!(await input.canRead())) {
      throw new Error(`${source.name} is not a readable media file.`);
    }

    const videoTrack = await input.getPrimaryVideoTrack();

    if (!videoTrack) {
      return { source, blob, input };
    }

    return {
      source,
      blob,
      input,
      videoSink: new CanvasSink(videoTrack, {
        width: canvas.width,
        height: canvas.height,
        fit: "cover",
        poolSize: 1,
      }),
      videoFirstTimestamp: await videoTrack.getFirstTimestamp(),
    };
  } catch (error) {
    input.dispose();
    throw error;
  }
}
