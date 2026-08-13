import { createStudioEditorVideoLayer } from "@/lib/clipstitchr/media/studioEditor/createStudioEditorVideoLayer";
import { applyStudioEditorCommand } from "@/lib/clipstitchr/studio/editor/applyStudioEditorCommand";
import { createStudioEditorProjectV1 } from "@/lib/clipstitchr/studio/editor/createStudioEditorProjectV1";
import type { StudioEditorMediaSourceDescriptor } from "@/lib/clipstitchr/types/studioEditor/StudioEditorMediaSourceDescriptor";

export function createStudioEditorProjectFromVideoSource(
  productId: string,
  descriptor: StudioEditorMediaSourceDescriptor,
) {
  const identifier = `${descriptor.kind}-${descriptor.id}`.slice(0, 96);
  const sceneId = `scene-${identifier}`;
  const visualTrackId = `visual-${identifier}`;
  const project = createStudioEditorProjectV1({
    audioTrackId: `audio-${identifier}`,
    captionTrackId: `captions-${identifier}`,
    id: `handoff-${identifier}`,
    name: `${descriptor.name} edit`.slice(0, 200),
    productId,
    sceneId,
    visualTrackId,
  });

  return applyStudioEditorCommand(project, {
    index: 0,
    layer: createStudioEditorVideoLayer({
      descriptor,
      fps: project.canvas.fps,
      layerId: `layer-${identifier}`,
      startSeconds: 0,
    }),
    sceneId,
    trackId: visualTrackId,
    type: "addLayer",
  });
}
