"use client";

import { useState } from "react";
import { submitStudioClipsRenderOperation } from "./submitStudioClipsRenderOperation";
import type { StudioClipsRenderOperationSave } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsRenderOperationSave";

type StudioClipsSplitFormProps = {
  disabled: boolean;
  onSave: StudioClipsRenderOperationSave;
};

export function StudioClipsSplitForm({
  disabled,
  onSave,
}: StudioClipsSplitFormProps) {
  const [pointSeconds, setPointSeconds] = useState("");
  return (
    <form onSubmit={(event) => submitStudioClipsRenderOperation(event, onSave, { kind: "split", pointsSeconds: [Number(pointSeconds)] })}>
      <h5>Split</h5>
      <label>
        Split at seconds
        <input min={0.01} required step="0.01" type="number" value={pointSeconds} onChange={(event) => setPointSeconds(event.target.value)} />
      </label>
      <button disabled={disabled} type="submit">Render split clips</button>
    </form>
  );
}
