"use client";

import { StudioEditorSourceCard } from "@/app/_components/studio/editor/StudioEditorSourceCard";
import { useStudioEditorCatalogPosterUrls } from "@/lib/clipstitchr/hooks/studioEditor/useStudioEditorCatalogPosterUrls";
import type { StudioEditorMediaSourceCatalog } from "@/lib/clipstitchr/types/studioEditor/StudioEditorMediaSourceCatalog";
import type { StudioEditorMediaSourceDescriptor } from "@/lib/clipstitchr/types/studioEditor/StudioEditorMediaSourceDescriptor";
import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";

type StudioEditorSourceBrowserProps = {
  catalog: StudioEditorMediaSourceCatalog;
  disabled: boolean;
  error: string | null;
  isLoading: boolean;
  onAddAudio: (descriptor: StudioEditorMediaSourceDescriptor) => void;
  onAddVideo: (descriptor: StudioEditorMediaSourceDescriptor) => void;
  onReload: () => void;
};

export function StudioEditorSourceBrowser({
  catalog,
  disabled,
  error,
  isLoading,
  onAddAudio,
  onAddVideo,
  onReload,
}: StudioEditorSourceBrowserProps) {
  const posterUrls = useStudioEditorCatalogPosterUrls(catalog);
  const sources = [...catalog.videoClips, ...catalog.stitches];

  return (
    <section className={styles.sourceBrowser} aria-labelledby="source-browser-title">
      <div className={styles.panelHeading}>
        <div>
          <h2 id="source-browser-title">Source shelf</h2>
          <p>Active Product clips and finished Stitches.</p>
        </div>
        <button className={styles.quietButton} disabled={isLoading} type="button" onClick={onReload}>
          Refresh
        </button>
      </div>
      {error ? (
        <p className={styles.inlineError} role="alert">{error}</p>
      ) : isLoading ? (
        <p className={styles.loadingMessage}>Reading the source shelf...</p>
      ) : sources.length === 0 ? (
        <p className={styles.emptySourceMessage}>
          No Product clips yet. You can upload a local file below or add media in the Library.
        </p>
      ) : (
        <div className={styles.sourceStrip}>
          {sources.map((descriptor) => (
            <StudioEditorSourceCard
              key={`${descriptor.kind}:${descriptor.id}`}
              descriptor={descriptor}
              disabled={disabled}
              posterUrl={posterUrls.get(descriptor.id)}
              onAddAudio={onAddAudio}
              onAddVideo={onAddVideo}
            />
          ))}
        </div>
      )}
    </section>
  );
}
