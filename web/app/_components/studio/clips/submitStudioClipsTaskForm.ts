import type { FormEvent } from "react";
import type { StudioClipsTaskDetail } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsTaskDetail";

export async function submitStudioClipsTaskForm(
  event: FormEvent<HTMLFormElement>,
  createTask: () => Promise<StudioClipsTaskDetail>,
  onCreated: (task: StudioClipsTaskDetail) => void,
) {
  event.preventDefault();

  try {
    onCreated(await createTask());
  } catch {
    // The task hook owns the nearby user-facing error.
  }
}
