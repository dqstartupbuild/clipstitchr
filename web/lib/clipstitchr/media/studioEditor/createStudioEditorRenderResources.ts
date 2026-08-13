import { createStudioEditorRenderResource } from "@/lib/clipstitchr/media/studioEditor/createStudioEditorRenderResource";
import type { StudioEditorRenderResource } from "@/lib/clipstitchr/types/StudioEditorRenderResource";
import type { StudioEditorResolvedSource } from "@/lib/clipstitchr/types/StudioEditorResolvedSource";
import type { StudioEditorCanvasV1 } from "@/lib/clipstitchr/types/studioEditor/StudioEditorCanvasV1";

export async function createStudioEditorRenderResources(
  sources: StudioEditorResolvedSource[],
  canvas: StudioEditorCanvasV1,
) {
  const resources = new Map<string, StudioEditorRenderResource>();

  for (const source of sources) {
    resources.set(
      source.identity,
      await createStudioEditorRenderResource(source, canvas),
    );
  }

  return resources;
}
