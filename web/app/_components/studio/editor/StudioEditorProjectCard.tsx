import type { StudioEditorProjectSummary } from "@/lib/clipstitchr/types/studioEditor/StudioEditorProjectSummary";
import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";

type StudioEditorProjectCardProps = {
  busy: boolean;
  onArchive: (project: StudioEditorProjectSummary) => void;
  onOpen: (projectId: string) => void;
  onReopen: (project: StudioEditorProjectSummary) => void;
  project: StudioEditorProjectSummary;
};

export function StudioEditorProjectCard({
  busy,
  onArchive,
  onOpen,
  onReopen,
  project,
}: StudioEditorProjectCardProps) {
  const updated = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(project.updatedAt));

  return (
    <article className={styles.projectCard}>
      <div className={styles.projectCardCopy}>
        <p className={styles.projectStatus}>
          {project.status === "active" ? "In progress" : "Archived"}
        </p>
        <h3>{project.name}</h3>
        <p>
          Saved {updated} · version {project.revision}
        </p>
      </div>
      <div className={styles.projectCardActions}>
        {project.status === "active" ? (
          <>
            <button type="button" onClick={() => onOpen(project.id)}>
              Open edit
            </button>
            <button
              className={styles.quietButton}
              disabled={busy}
              type="button"
              onClick={() => onArchive(project)}
            >
              {busy ? "Archiving..." : "Archive"}
            </button>
          </>
        ) : (
          <button
            disabled={busy}
            type="button"
            onClick={() => onReopen(project)}
          >
            {busy ? "Reopening..." : "Reopen edit"}
          </button>
        )}
      </div>
    </article>
  );
}
