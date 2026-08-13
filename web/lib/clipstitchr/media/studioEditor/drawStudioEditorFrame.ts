import { drawStudioEditorCaptionLayer } from "@/lib/clipstitchr/media/studioEditor/drawStudioEditorCaptionLayer";
import { drawStudioEditorTextLayer } from "@/lib/clipstitchr/media/studioEditor/drawStudioEditorTextLayer";
import { drawStudioEditorVisualMedia } from "@/lib/clipstitchr/media/studioEditor/drawStudioEditorVisualMedia";
import { getStudioEditorActiveScene } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorActiveScene";
import { getStudioEditorLayerIsActive } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorLayerIsActive";
import { getStudioEditorMediaLayerSourceTime } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorMediaLayerSourceTime";
import { getStudioEditorSourceIdentity } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorSourceIdentity";
import type { StudioEditorRenderResource } from "@/lib/clipstitchr/types/StudioEditorRenderResource";
import type { StudioEditorProjectV1 } from "@/lib/clipstitchr/types/studioEditor/StudioEditorProjectV1";

type DrawStudioEditorFrameOptions = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  project: StudioEditorProjectV1;
  resources: Map<string, StudioEditorRenderResource>;
  timelineSeconds: number;
};

export async function drawStudioEditorFrame({
  canvas,
  context,
  project,
  resources,
  timelineSeconds,
}: DrawStudioEditorFrameOptions) {
  context.save();
  context.globalAlpha = 1;
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.fillStyle = project.canvas.backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.restore();

  const scene = getStudioEditorActiveScene(project);

  for (const track of scene.tracks) {
    if (track.hidden) {
      continue;
    }

    for (const layer of track.layers) {
      if (!getStudioEditorLayerIsActive(layer, timelineSeconds)) {
        continue;
      }

      if (layer.kind === "text") {
        drawStudioEditorTextLayer({ canvas, context, layer, timelineSeconds });
        continue;
      }

      if (layer.kind === "caption") {
        drawStudioEditorCaptionLayer({
          canvas,
          context,
          layer,
          timelineSeconds,
        });
        continue;
      }

      if (layer.kind !== "video" && layer.kind !== "image") {
        continue;
      }

      const identity = getStudioEditorSourceIdentity(layer.source);
      const resource = resources.get(identity);

      if (!resource) {
        throw new Error(`${layer.name} is not available for this export.`);
      }

      if (layer.kind === "image") {
        if (!resource.image) {
          throw new Error(`${layer.name} is not a readable image.`);
        }

        drawStudioEditorVisualMedia({
          canvas,
          context,
          layer,
          media: resource.image,
          mediaWidth: resource.image.width,
          mediaHeight: resource.image.height,
          timelineSeconds,
        });
        continue;
      }

      if (!resource.videoSink) {
        throw new Error(`${layer.name} is missing its video track.`);
      }

      const sourceSeconds =
        (resource.videoFirstTimestamp ?? 0) +
        getStudioEditorMediaLayerSourceTime(layer, timelineSeconds);
      const frame = await resource.videoSink.getCanvas(sourceSeconds);

      if (!frame) {
        continue;
      }

      drawStudioEditorVisualMedia({
        canvas,
        context,
        layer,
        media: frame.canvas,
        mediaWidth: frame.canvas.width,
        mediaHeight: frame.canvas.height,
        timelineSeconds,
      });
    }
  }
}
