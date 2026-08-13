"use client";

import { StudioEditorState } from "@/app/_components/studio/editor/StudioEditorState";
import { StudioEditorWorkbench } from "@/app/_components/studio/editor/StudioEditorWorkbench";
import { useStudioEditorProjectRecord } from "@/lib/clipstitchr/hooks/studioEditor/useStudioEditorProjectRecord";
import { parseStudioEditorProjectSnapshot } from "@/lib/clipstitchr/studio/editor/parseStudioEditorProjectSnapshot";
import type { StudioEditorProjectRecord } from "@/lib/clipstitchr/types/studioEditor/StudioEditorProjectRecord";
import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";

type StudioEditorProjectLoaderProps = {
  onClose: () => void;
  productId: string;
  projectId: string;
};

export function StudioEditorProjectLoader({
  onClose,
  productId,
  projectId,
}: StudioEditorProjectLoaderProps) {
  const record = useStudioEditorProjectRecord(productId, projectId);

  if (record === undefined) {
    return (
      <StudioEditorState
        title="Opening the edit"
        message="Restoring the latest saved timeline."
      />
    );
  }

  if (!record) {
    return (
      <section className={styles.editorState} role="alert">
        <h2>This edit is not available</h2>
        <p>It may have moved or no longer belong to the active Product.</p>
        <button type="button" onClick={onClose}>
          Back to edits
        </button>
      </section>
    );
  }

  if (record.status !== "active") {
    return (
      <section className={styles.editorState}>
        <h2>This edit is archived</h2>
        <p>Reopen it from the edit shelf before changing the timeline.</p>
        <button type="button" onClick={onClose}>
          Back to edits
        </button>
      </section>
    );
  }

  let project;

  try {
    project = parseStudioEditorProjectSnapshot(record.snapshotJson);
  } catch {
    return (
      <section className={styles.editorState} role="alert">
        <h2>The saved timeline needs attention</h2>
        <p>This saved timeline could not be read safely.</p>
        <button type="button" onClick={onClose}>
          Back to edits
        </button>
      </section>
    );
  }

  return (
    <StudioEditorWorkbench
      key={record.id}
      initialProject={project}
      onClose={onClose}
      record={record as StudioEditorProjectRecord}
    />
  );
}
