"use client";

import { useState } from "react";
import type { StudioClipsOutput } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsOutput";
import { useCreateStudioClipsRenderRevision } from "@/lib/clipstitchr/hooks/studioClips/useCreateStudioClipsRenderRevision";
import { createStudioClipsMergeRevision } from "./createStudioClipsMergeRevision";
import { toggleStudioClipsMergeOutputSelection } from "./toggleStudioClipsMergeOutputSelection";
import styles from "@/app/dashboard/studio/clips/studioClips.module.css";

type StudioClipsMergeControlsProps = {
  hasActiveProductWork: boolean;
  onUpdated: () => void;
  outputs: StudioClipsOutput[];
  processingAvailable: boolean;
  productId: string;
  taskId: string;
};

export function StudioClipsMergeControls({
  hasActiveProductWork,
  onUpdated,
  outputs,
  processingAvailable,
  productId,
  taskId,
}: StudioClipsMergeControlsProps) {
  const revisions = useCreateStudioClipsRenderRevision(productId);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const firstSelected = outputs.find((output) => output.id === selectedIds[0]);

  if (outputs.length < 2) return null;

  return (
    <details className={styles.mergeControls}>
      <summary>Merge output plan</summary>
      <p className={styles.intentNote}>Choose two or more clips in order. This starts a real merged render revision.</p>
      <div>
        {outputs.map((output, index) => (
          <label key={output.id}>
            <input checked={selectedIds.includes(output.id)} disabled={hasActiveProductWork || !processingAvailable || Boolean(revisions.busyOutputId)} type="checkbox" onChange={() => toggleStudioClipsMergeOutputSelection(output.id, setSelectedIds)} />
            Output {index + 1} · {output.fileName ?? "prepared clip"}
          </label>
        ))}
      </div>
      <button disabled={selectedIds.length < 2 || Boolean(revisions.busyOutputId) || hasActiveProductWork || !processingAvailable} type="button" onClick={() => void createStudioClipsMergeRevision(taskId, firstSelected, selectedIds, revisions.createRevision, setSelectedIds, onUpdated)}>Render merged clip</button>
      {hasActiveProductWork ? <p role="status">Finish the active clip job before starting a merge.</p> : null}
      {!processingAvailable ? <p role="status">Merged renders are unavailable in this environment.</p> : null}
      {revisions.busyOutputId ? <p role="status">Starting the merged render...</p> : null}
      {revisions.statusMessage ? <p role="status">{revisions.statusMessage}</p> : null}
      {revisions.error ? <p className={styles.inlineError} role="alert">{revisions.error}</p> : null}
    </details>
  );
}
