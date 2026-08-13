import type { StudioClipsRenderRevisionSummary } from "@/lib/clipstitchr/types/studioClips/StudioClipsRenderRevisionSummary";
import { StudioClipsRenderRevisionItem } from "./StudioClipsRenderRevisionItem";
import styles from "@/app/dashboard/studio/clips/studioClips.module.css";

type StudioClipsRenderRevisionHistoryProps = {
  hasActiveProductWork: boolean;
  onUpdated: () => void;
  processingAvailable: boolean;
  productId: string;
  revisions: StudioClipsRenderRevisionSummary[];
};

export function StudioClipsRenderRevisionHistory({
  hasActiveProductWork,
  onUpdated,
  processingAvailable,
  productId,
  revisions,
}: StudioClipsRenderRevisionHistoryProps) {
  return (
    <section
      className={styles.renderRevisionHistory}
      aria-labelledby="studio-clips-revisions-title"
    >
      <div>
        <h2 id="studio-clips-revisions-title">Render history</h2>
        <p>New versions keep their own progress, failures, and finished outputs.</p>
      </div>
      {revisions.length === 0 ? (
        <p className={styles.emptyEvidence}>
          No edited or platform-specific versions have been rendered yet.
        </p>
      ) : (
        <ol className={styles.renderRevisionList}>
          {revisions.map((revision) => (
            <StudioClipsRenderRevisionItem
              hasActiveProductWork={hasActiveProductWork}
              key={`${revision.id}-${revision.revision}`}
              onUpdated={onUpdated}
              processingAvailable={processingAvailable}
              productId={productId}
              revision={revision}
            />
          ))}
        </ol>
      )}
    </section>
  );
}
