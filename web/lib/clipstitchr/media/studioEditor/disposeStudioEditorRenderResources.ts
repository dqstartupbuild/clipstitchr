import type { StudioEditorRenderResource } from "@/lib/clipstitchr/types/StudioEditorRenderResource";

export function disposeStudioEditorRenderResources(
  resources: Map<string, StudioEditorRenderResource>,
) {
  for (const resource of resources.values()) {
    resource.image?.close();
    resource.input?.dispose();
  }
}
