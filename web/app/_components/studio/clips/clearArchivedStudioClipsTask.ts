import type { Dispatch, SetStateAction } from "react";

export function clearArchivedStudioClipsTask(
  setSelectedTaskId: Dispatch<SetStateAction<string | null>>,
  reload: () => void,
) {
  setSelectedTaskId(null);
  reload();
}
