"use client";

import { useState } from "react";
import { submitStudioClipsTrimOperation } from "./submitStudioClipsTrimOperation";
import type { StudioClipsRenderOperationSave } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsRenderOperationSave";

type StudioClipsTrimFormProps = {
  disabled: boolean;
  onSave: StudioClipsRenderOperationSave;
};

export function StudioClipsTrimForm({
  disabled,
  onSave,
}: StudioClipsTrimFormProps) {
  const [startSeconds, setStartSeconds] = useState("0");
  const [endSeconds, setEndSeconds] = useState("");
  const [error, setError] = useState<string | null>(null);
  return (
    <form onSubmit={(event) => submitStudioClipsTrimOperation(event, startSeconds, endSeconds, setError, onSave)}>
      <h5>Trim</h5>
      <label>
        Start in seconds
        <input min={0} required step="0.01" type="number" value={startSeconds} onChange={(event) => setStartSeconds(event.target.value)} />
      </label>
      <label>
        End in seconds
        <input min={0.01} required step="0.01" type="number" value={endSeconds} onChange={(event) => setEndSeconds(event.target.value)} />
      </label>
      <button disabled={disabled} type="submit">Render trimmed clip</button>
      {error ? <p role="alert">{error}</p> : null}
    </form>
  );
}
