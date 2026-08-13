"use client";

import { StudioEditorAudioLayerPreview } from "@/app/_components/studio/editor/StudioEditorAudioLayerPreview";
import { StudioEditorCaptionLayerPreview } from "@/app/_components/studio/editor/StudioEditorCaptionLayerPreview";
import { StudioEditorTextLayerPreview } from "@/app/_components/studio/editor/StudioEditorTextLayerPreview";
import { StudioEditorVisualLayerPreview } from "@/app/_components/studio/editor/StudioEditorVisualLayerPreview";
import { getStudioEditorActiveScene } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorActiveScene";
import { getStudioEditorLayerIsActive } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorLayerIsActive";
import { getStudioEditorSourceIdentity } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorSourceIdentity";
import type { StudioEditorProjectV1 } from "@/lib/clipstitchr/types/studioEditor/StudioEditorProjectV1";
import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";

type StudioEditorPreviewProps = {
  isLoadingSources: boolean;
  isPlaying: boolean;
  project: StudioEditorProjectV1;
  sourceError: string | null;
  sourceUrls: Map<string, string>;
  timelineSeconds: number;
};

export function StudioEditorPreview({
  isLoadingSources,
  isPlaying,
  project,
  sourceError,
  sourceUrls,
  timelineSeconds,
}: StudioEditorPreviewProps) {
  const scene = getStudioEditorActiveScene(project);

  return (
    <section className={styles.previewPanel} aria-labelledby="preview-title">
      <div className={styles.panelHeading}>
        <div>
          <h2 id="preview-title">Preview</h2>
          <p>{project.canvas.width}×{project.canvas.height} · {project.canvas.fps} fps</p>
        </div>
      </div>
      <div
        className={styles.previewStage}
        style={{
          aspectRatio: `${project.canvas.width} / ${project.canvas.height}`,
          backgroundColor: project.canvas.backgroundColor,
        }}
      >
        {scene.tracks.map((track) =>
          track.hidden
            ? null
            : track.layers.map((layer) => {
                if (!getStudioEditorLayerIsActive(layer, timelineSeconds)) return null;

                if (layer.kind === "text") {
                  return (
                    <StudioEditorTextLayerPreview
                      key={layer.id}
                      canvas={project.canvas}
                      layer={layer}
                      timelineSeconds={timelineSeconds}
                    />
                  );
                }

                if (layer.kind === "caption") {
                  return (
                    <StudioEditorCaptionLayerPreview
                      key={layer.id}
                      canvas={project.canvas}
                      layer={layer}
                      timelineSeconds={timelineSeconds}
                    />
                  );
                }

                const sourceUrl = sourceUrls.get(
                  getStudioEditorSourceIdentity(layer.source),
                );
                if (!sourceUrl) return null;

                if (layer.kind === "video" || layer.kind === "image") {
                  return (
                    <StudioEditorVisualLayerPreview
                      key={layer.id}
                      canvas={project.canvas}
                      isPlaying={isPlaying}
                      layer={layer}
                      sourceUrl={sourceUrl}
                      timelineSeconds={timelineSeconds}
                      trackMuted={track.muted}
                    />
                  );
                }

                return (
                  <StudioEditorAudioLayerPreview
                    key={layer.id}
                    isPlaying={isPlaying}
                    layer={layer}
                    sourceUrl={sourceUrl}
                    timelineSeconds={timelineSeconds}
                    trackMuted={track.muted}
                  />
                );
              }),
        )}
        {isLoadingSources && (
          <p className={styles.previewStatus} role="status">Loading source media...</p>
        )}
        {sourceError && (
          <p className={styles.previewError} role="alert">{sourceError}</p>
        )}
      </div>
    </section>
  );
}
