import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { StudioClipsRenderOperationSave } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsRenderOperationSave";

export function submitStudioClipsTrimOperation(
  event: FormEvent<HTMLFormElement>,
  startSeconds: string,
  endSeconds: string,
  setError: Dispatch<SetStateAction<string | null>>,
  onSave: StudioClipsRenderOperationSave,
) {
  event.preventDefault();
  const start = Number(startSeconds);
  const end = Number(endSeconds);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    setError("Choose an end time after the start time.");
    return;
  }

  setError(null);
  onSave({ endSeconds: end, kind: "trim", startSeconds: start });
}
