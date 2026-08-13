"use client";

import { formatStudioEditorRevisionOperation } from "@/app/_components/studio/editor/formatStudioEditorRevisionOperation";
import { useStudioEditorProjectRevisions } from "@/lib/clipstitchr/hooks/studioEditor/useStudioEditorProjectRevisions";
import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";

type StudioEditorRevisionHistoryProps = {
  productId: string;
  projectId: string;
};

export function StudioEditorRevisionHistory({
  productId,
  projectId,
}: StudioEditorRevisionHistoryProps) {
  const revisions = useStudioEditorProjectRevisions(productId, projectId);

  return (
    <details className={styles.revisionHistory}>
      <summary>Saved versions</summary>
      {revisions === undefined ? (
        <p>Opening save history...</p>
      ) : revisions.length === 0 ? (
        <p>No saved version is available yet.</p>
      ) : (
        <ol>
          {revisions.map((revision) => (
            <li key={revision.revision}>
              <span>
                Version {revision.revision} · {formatStudioEditorRevisionOperation(revision.operation)}
              </span>
              <time dateTime={revision.createdAt}>
                {new Intl.DateTimeFormat(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(revision.createdAt))}
              </time>
            </li>
          ))}
        </ol>
      )}
    </details>
  );
}
