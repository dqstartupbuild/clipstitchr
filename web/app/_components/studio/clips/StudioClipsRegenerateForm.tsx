"use client";

import type { StudioClipsRenderOperationSave } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsRenderOperationSave";
import { submitStudioClipsRenderOperation } from "./submitStudioClipsRenderOperation";

type StudioClipsRegenerateFormProps = {
  disabled: boolean;
  onSave: StudioClipsRenderOperationSave;
};

export function StudioClipsRegenerateForm({
  disabled,
  onSave,
}: StudioClipsRegenerateFormProps) {
  return (
    <form onSubmit={(event) => submitStudioClipsRenderOperation(event, onSave, { kind: "regenerate" })}>
      <h5>Clean rerender</h5>
      <p>
        Render this clip again from its clean source using the saved Product
        choices. New written instructions are not supported here.
      </p>
      <button disabled={disabled} type="submit">Render clean version</button>
    </form>
  );
}
