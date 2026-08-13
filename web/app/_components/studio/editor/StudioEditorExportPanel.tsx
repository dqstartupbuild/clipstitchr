"use client";

import Link from "next/link";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import { useStudioEditorExport } from "@/lib/clipstitchr/hooks/studioEditor/useStudioEditorExport";
import type { StudioEditorMediaSourceCatalog } from "@/lib/clipstitchr/types/studioEditor/StudioEditorMediaSourceCatalog";
import type { StudioEditorProjectV1 } from "@/lib/clipstitchr/types/studioEditor/StudioEditorProjectV1";
import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";

type StudioEditorExportPanelProps = {
  catalog: StudioEditorMediaSourceCatalog;
  productId: string;
  project: StudioEditorProjectV1;
};

export function StudioEditorExportPanel({
  catalog,
  productId,
  project,
}: StudioEditorExportPanelProps) {
  const exportState = useStudioEditorExport({ catalog, productId, project });
  const downloadUrl = useObjectUrl(exportState.exported?.blob);

  return (
    <section className={styles.exportPanel} aria-labelledby="export-title">
      <div>
        <h2 id="export-title">Finish the cut</h2>
        <p>
          Browser export renders every visible layer, mixes sound, saves the MP4 privately, and adds it to this Product&apos;s Library.
        </p>
      </div>
      <button
        disabled={exportState.isExporting}
        type="button"
        onClick={() => void exportState.exportAndSave().catch(() => undefined)}
      >
        {exportState.isExporting ? "Rendering the edit..." : "Export and save to Library"}
      </button>
      {exportState.isExporting && (
        <div className={styles.exportProgress} role="status">
          <progress max={1} value={exportState.progress} />
          <span>{Math.round(exportState.progress * 100)}%</span>
        </div>
      )}
      {exportState.error && <p className={styles.inlineError} role="alert">{exportState.error}</p>}
      {exportState.savedClipId && downloadUrl && (
        <div className={styles.exportSuccess} role="status">
          <p>Saved to the active Product Library.</p>
          <div className={styles.exportSuccessActions}>
            <a href={downloadUrl} download={`${project.name.replace(/[^A-Za-z0-9_-]+/g, "-") || "studio-edit"}.mp4`}>
              Download this MP4
            </a>
            <Link
              href={`/dashboard/studio/publishing/compose?kind=library-media&recordId=${encodeURIComponent(exportState.savedClipId)}`}
            >
              Open publishing
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
