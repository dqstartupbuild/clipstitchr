import type { FormEvent } from "react";
import type { StudioClipsRenderOperationSave } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsRenderOperationSave";
import type { StudioClipsRenderOperation } from "@/lib/clipstitchr/types/studioClips/StudioClipsRenderOperation";

export function submitStudioClipsRenderOperation(
  event: FormEvent<HTMLFormElement>,
  onSave: StudioClipsRenderOperationSave,
  operation: StudioClipsRenderOperation | null,
) {
  event.preventDefault();
  if (operation) {
    onSave(operation);
  }
}
