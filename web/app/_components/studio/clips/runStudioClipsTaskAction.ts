import type { StudioClipsTaskAction } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsTaskAction";

export async function runStudioClipsTaskAction(
  taskId: string,
  action: StudioClipsTaskAction,
  updateTask: (
    taskId: string,
    action: StudioClipsTaskAction,
  ) => Promise<unknown>,
  onArchived: () => void,
  onUpdated: () => void,
) {
  if (!(await updateTask(taskId, action))) {
    return;
  }

  if (action === "archive") {
    onArchived();
  } else {
    onUpdated();
  }
}
