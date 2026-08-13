import type { Dispatch, SetStateAction } from "react";
import type { StudioClipsOutput } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsOutput";
import type { StudioClipsRenderOperation } from "@/lib/clipstitchr/types/studioClips/StudioClipsRenderOperation";

export async function createStudioClipsMergeRevision(
  taskId: string,
  firstSelected: StudioClipsOutput | undefined,
  selectedIds: string[],
  createRevision: (
    taskId: string,
    output: StudioClipsOutput,
    operation: StudioClipsRenderOperation,
  ) => Promise<unknown>,
  setSelectedIds: Dispatch<SetStateAction<string[]>>,
  onUpdated: () => void,
) {
  if (!firstSelected || selectedIds.length < 2) {
    return;
  }

  const result = await createRevision(taskId, firstSelected, {
    kind: "merge",
    outputIds: selectedIds,
  });
  if (result) {
    setSelectedIds([]);
    onUpdated();
  }
}
