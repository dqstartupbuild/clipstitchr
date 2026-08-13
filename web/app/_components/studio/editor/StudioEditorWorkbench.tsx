"use client";

import { useCallback, useMemo, useState } from "react";
import { StudioEditorExportPanel } from "@/app/_components/studio/editor/StudioEditorExportPanel";
import { StudioEditorLayerInspector } from "@/app/_components/studio/editor/StudioEditorLayerInspector";
import { StudioEditorMediaUpload } from "@/app/_components/studio/editor/StudioEditorMediaUpload";
import { StudioEditorPreview } from "@/app/_components/studio/editor/StudioEditorPreview";
import { StudioEditorRevisionHistory } from "@/app/_components/studio/editor/StudioEditorRevisionHistory";
import { StudioEditorShortcutHelp } from "@/app/_components/studio/editor/StudioEditorShortcutHelp";
import { StudioEditorSourceBrowser } from "@/app/_components/studio/editor/StudioEditorSourceBrowser";
import { StudioEditorTimeline } from "@/app/_components/studio/editor/StudioEditorTimeline";
import { StudioEditorToolbar } from "@/app/_components/studio/editor/StudioEditorToolbar";
import { StudioEditorTransport } from "@/app/_components/studio/editor/StudioEditorTransport";
import { useStudioEditorAutosave } from "@/lib/clipstitchr/hooks/studioEditor/useStudioEditorAutosave";
import { useStudioEditorHistory } from "@/lib/clipstitchr/hooks/studioEditor/useStudioEditorHistory";
import { useStudioEditorKeyboardShortcuts } from "@/lib/clipstitchr/hooks/studioEditor/useStudioEditorKeyboardShortcuts";
import { useStudioEditorMediaUpload } from "@/lib/clipstitchr/hooks/studioEditor/useStudioEditorMediaUpload";
import { useStudioEditorPlayback } from "@/lib/clipstitchr/hooks/studioEditor/useStudioEditorPlayback";
import { useStudioEditorSourceCatalog } from "@/lib/clipstitchr/hooks/studioEditor/useStudioEditorSourceCatalog";
import { useStudioEditorSourceUrls } from "@/lib/clipstitchr/hooks/studioEditor/useStudioEditorSourceUrls";
import { createStudioEditorAudioLayer } from "@/lib/clipstitchr/media/studioEditor/createStudioEditorAudioLayer";
import { createStudioEditorCaptionLayer } from "@/lib/clipstitchr/media/studioEditor/createStudioEditorCaptionLayer";
import { createStudioEditorTextLayer } from "@/lib/clipstitchr/media/studioEditor/createStudioEditorTextLayer";
import { createStudioEditorVideoLayer } from "@/lib/clipstitchr/media/studioEditor/createStudioEditorVideoLayer";
import { findStudioEditorLayerSelection } from "@/lib/clipstitchr/media/studioEditor/findStudioEditorLayerSelection";
import { getStudioEditorActiveScene } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorActiveScene";
import { getStudioEditorSafeSourceDuration } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorSafeSourceDuration";
import { getStudioEditorTrackByKind } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorTrackByKind";
import { normalizeStudioEditorUpdatedLayer } from "@/lib/clipstitchr/media/studioEditor/normalizeStudioEditorUpdatedLayer";
import { getStudioEditorSceneDurationSeconds } from "@/lib/clipstitchr/studio/editor/getStudioEditorSceneDurationSeconds";
import { snapStudioEditorSecondsToFrame } from "@/lib/clipstitchr/studio/editor/snapStudioEditorSecondsToFrame";
import type { StudioEditorLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorLayer";
import type { StudioEditorMediaSourceDescriptor } from "@/lib/clipstitchr/types/studioEditor/StudioEditorMediaSourceDescriptor";
import type { StudioEditorProjectRecord } from "@/lib/clipstitchr/types/studioEditor/StudioEditorProjectRecord";
import type { StudioEditorProjectV1 } from "@/lib/clipstitchr/types/studioEditor/StudioEditorProjectV1";
import { createId } from "@/lib/clipstitchr/utils/createId";
import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";

type StudioEditorWorkbenchProps = {
  initialProject: StudioEditorProjectV1;
  onClose: () => void;
  record: StudioEditorProjectRecord;
};

export function StudioEditorWorkbench({
  initialProject,
  onClose,
  record,
}: StudioEditorWorkbenchProps) {
  const history = useStudioEditorHistory(initialProject);
  const project = history.project;
  const scene = getStudioEditorActiveScene(project);
  const durationSeconds = getStudioEditorSceneDurationSeconds(scene);
  const playback = useStudioEditorPlayback(durationSeconds);
  const sourceState = useStudioEditorSourceCatalog(project.productId);
  const sourceUrls = useStudioEditorSourceUrls(project, sourceState.catalog);
  const autosave = useStudioEditorAutosave(project, record);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const selection = useMemo(
    () => findStudioEditorLayerSelection(project, selectedLayerId),
    [project, selectedLayerId],
  );
  const mediaUpload = useStudioEditorMediaUpload({
    execute: history.execute,
    playheadSeconds: playback.playheadSeconds,
    project,
  });
  const frame = 1 / project.canvas.fps;
  const canSplit = Boolean(
    selection &&
      playback.playheadSeconds >= selection.layer.startSeconds + frame - 1e-7 &&
      playback.playheadSeconds <=
        selection.layer.startSeconds + selection.layer.durationSeconds - frame + 1e-7,
  );

  const addLayer = useCallback(
    (layer: StudioEditorLayer, trackKind: "visual" | "audio" | "caption") => {
      const track = getStudioEditorTrackByKind(scene, trackKind);
      history.execute({
        type: "addLayer",
        sceneId: scene.id,
        trackId: track.id,
        index: track.layers.length,
        layer,
      });
      setSelectedLayerId(layer.id);
    },
    [history, scene],
  );

  const onAddVideo = useCallback(
    (descriptor: StudioEditorMediaSourceDescriptor) => {
      addLayer(
        createStudioEditorVideoLayer({
          descriptor,
          fps: project.canvas.fps,
          startSeconds: snapStudioEditorSecondsToFrame(
            playback.playheadSeconds,
            project.canvas.fps,
          ),
        }),
        "visual",
      );
    },
    [addLayer, playback.playheadSeconds, project.canvas.fps],
  );

  const onAddAudio = useCallback(
    (descriptor: StudioEditorMediaSourceDescriptor) => {
      addLayer(
        createStudioEditorAudioLayer({
          descriptor,
          fps: project.canvas.fps,
          kind: "music",
          startSeconds: snapStudioEditorSecondsToFrame(
            playback.playheadSeconds,
            project.canvas.fps,
          ),
        }),
        "audio",
      );
    },
    [addLayer, playback.playheadSeconds, project.canvas.fps],
  );

  const onAddText = useCallback(() => {
    addLayer(
      createStudioEditorTextLayer({
        startSeconds: snapStudioEditorSecondsToFrame(
          playback.playheadSeconds,
          project.canvas.fps,
        ),
        durationSeconds: 3,
      }),
      "visual",
    );
  }, [addLayer, playback.playheadSeconds, project.canvas.fps]);

  const onAddCaption = useCallback(() => {
    const startSeconds = snapStudioEditorSecondsToFrame(
      playback.playheadSeconds,
      project.canvas.fps,
    );
    const remaining = Math.max(3, durationSeconds - startSeconds);
    const captionDuration = snapStudioEditorSecondsToFrame(
      remaining,
      project.canvas.fps,
    );
    addLayer(
      createStudioEditorCaptionLayer({
        startSeconds,
        durationSeconds: captionDuration,
      }),
      "caption",
    );
  }, [addLayer, durationSeconds, playback.playheadSeconds, project.canvas.fps]);

  const onDelete = useCallback(() => {
    if (!selection) return;
    history.execute({
      type: "removeLayer",
      sceneId: scene.id,
      trackId: selection.track.id,
      layerId: selection.layer.id,
    });
    setSelectedLayerId(null);
  }, [history, scene.id, selection]);

  const onSplit = useCallback(() => {
    if (!selection || !canSplit) return;
    history.execute({
      type: "splitLayer",
      sceneId: scene.id,
      trackId: selection.track.id,
      layerId: selection.layer.id,
      splitSeconds: playback.playheadSeconds,
      rightLayerId: createId(),
    });
  }, [canSplit, history, playback.playheadSeconds, scene.id, selection]);

  const onMove = useCallback(
    (direction: -1 | 1) => {
      if (!selection) return;
      history.execute({
        type: "reorderLayer",
        sceneId: scene.id,
        fromTrackId: selection.track.id,
        toTrackId: selection.track.id,
        layerId: selection.layer.id,
        toIndex: selection.index + direction,
      });
    },
    [history, scene.id, selection],
  );

  const onUpdate = useCallback(
    (layer: StudioEditorLayer) => {
      if (!selection) return;
      history.execute({
        type: "updateLayer",
        sceneId: scene.id,
        trackId: selection.track.id,
        layer: normalizeStudioEditorUpdatedLayer(layer, project.canvas.fps),
      });
    },
    [history, project.canvas.fps, scene.id, selection],
  );

  const onTrim = useCallback(
    (values: {
      durationSeconds: number;
      sourceOffsetSeconds: number;
      startSeconds: number;
    }) => {
      if (!selection) return;
      let sourceOffsetSeconds = Math.max(0, values.sourceOffsetSeconds);
      let duration = Math.max(frame, values.durationSeconds);
      const layer = selection.layer;

      if (layer.kind === "image") {
        sourceOffsetSeconds = 0;
      } else if (
        layer.kind === "video" ||
        layer.kind === "voice" ||
        layer.kind === "music"
      ) {
        sourceOffsetSeconds = Math.min(
          sourceOffsetSeconds,
          Math.max(0, layer.sourceDurationSeconds - frame * layer.playbackSpeed),
        );
        duration = Math.min(
          duration,
          getStudioEditorSafeSourceDuration(
            (layer.sourceDurationSeconds - sourceOffsetSeconds) /
              layer.playbackSpeed,
            project.canvas.fps,
          ),
        );
      }

      history.execute({
        type: "trimLayer",
        sceneId: scene.id,
        trackId: selection.track.id,
        layerId: layer.id,
        startSeconds: Math.max(0, values.startSeconds),
        durationSeconds: duration,
        sourceOffsetSeconds,
      });
    },
    [frame, history, project.canvas.fps, scene.id, selection],
  );

  useStudioEditorKeyboardShortcuts({
    onDelete,
    onRedo: history.redo,
    onSplit,
    onTogglePlayback: playback.toggle,
    onUndo: history.undo,
  });

  const onBack = useCallback(() => {
    void autosave.flush().then(onClose).catch(() => undefined);
  }, [autosave, onClose]);

  return (
    <section className={styles.workbench}>
      <StudioEditorToolbar
        canMoveEarlier={Boolean(selection && selection.index > 0)}
        canMoveLater={Boolean(selection && selection.index < selection.track.layers.length - 1)}
        canRedo={history.canRedo}
        canSplit={canSplit}
        canUndo={history.canUndo}
        hasSelection={Boolean(selection)}
        projectName={project.name}
        saveError={autosave.error}
        saveStatus={autosave.status}
        onAddCaption={onAddCaption}
        onAddText={onAddText}
        onBack={onBack}
        onDelete={onDelete}
        onMoveEarlier={() => onMove(-1)}
        onMoveLater={() => onMove(1)}
        onRedo={history.redo}
        onSplit={onSplit}
        onUndo={history.undo}
      />
      <div className={styles.editingGrid}>
        <div className={styles.previewColumn}>
          <StudioEditorPreview
            isLoadingSources={sourceUrls.isLoading}
            isPlaying={playback.isPlaying}
            project={project}
            sourceError={sourceUrls.error}
            sourceUrls={sourceUrls.urls}
            timelineSeconds={playback.playheadSeconds}
          />
          <StudioEditorTransport
            durationSeconds={durationSeconds}
            fps={project.canvas.fps}
            isPlaying={playback.isPlaying}
            playheadSeconds={playback.playheadSeconds}
            onSeek={playback.seek}
            onToggle={playback.toggle}
          />
        </div>
        <StudioEditorLayerInspector
          fps={project.canvas.fps}
          selection={selection}
          onTrim={onTrim}
          onUpdate={onUpdate}
        />
      </div>
      <StudioEditorTimeline
        durationSeconds={durationSeconds}
        playheadSeconds={playback.playheadSeconds}
        project={project}
        selectedLayerId={selectedLayerId}
        onSeek={playback.seek}
        onSelect={setSelectedLayerId}
      />
      <StudioEditorSourceBrowser
        catalog={sourceState.catalog}
        disabled={mediaUpload.isUploading}
        error={sourceState.error}
        isLoading={sourceState.isLoading}
        onAddAudio={onAddAudio}
        onAddVideo={onAddVideo}
        onReload={() => void sourceState.reload()}
      />
      <StudioEditorMediaUpload
        disabled={false}
        error={mediaUpload.error}
        isUploading={mediaUpload.isUploading}
        onUpload={mediaUpload.upload}
      />
      <div className={styles.finishGrid}>
        <StudioEditorExportPanel
          catalog={sourceState.catalog}
          productId={project.productId}
          project={project}
        />
        <div className={styles.finishAside}>
          <StudioEditorRevisionHistory
            productId={project.productId}
            projectId={project.id}
          />
          <StudioEditorShortcutHelp />
        </div>
      </div>
    </section>
  );
}
