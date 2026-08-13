import type { Dispatch, SetStateAction } from "react";
import type { StudioClipsTaskDetail } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsTaskDetail";

export function selectCreatedStudioClipsTask(
  task: StudioClipsTaskDetail,
  setSelectedTaskId: Dispatch<SetStateAction<string | null>>,
  reload: () => void,
) {
  setSelectedTaskId(task.id);
  reload();
}
