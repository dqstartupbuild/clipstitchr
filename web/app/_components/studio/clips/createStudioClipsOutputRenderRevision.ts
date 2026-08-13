import type { StudioClipsOutput } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsOutput";
import type { StudioClipsRenderOperation } from "@/lib/clipstitchr/types/studioClips/StudioClipsRenderOperation";

export async function createStudioClipsOutputRenderRevision(
  taskId: string,
  output: StudioClipsOutput,
  operation: StudioClipsRenderOperation,
  createRevision: (
    taskId: string,
    output: StudioClipsOutput,
    operation: StudioClipsRenderOperation,
  ) => Promise<unknown>,
  onUpdated: () => void,
) {
  if (await createRevision(taskId, output, operation)) {
    onUpdated();
  }
}
