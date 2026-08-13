import { createMediaBunnyExportSession } from "@/lib/clipstitchr/media/createMediaBunnyExportSession";
import { createOutputAudioBufferSource } from "@/lib/clipstitchr/media/createOutputAudioBufferSource";
import { createTikTokCanvasSource } from "@/lib/clipstitchr/media/createTikTokCanvasSource";
import { finalizeMediaBunnyExportSession } from "@/lib/clipstitchr/media/finalizeMediaBunnyExportSession";
import { resolveMediaBunnyOutputCodecs } from "@/lib/clipstitchr/media/resolveMediaBunnyOutputCodecs";
import { createStudioEditorAudioBuffer } from "@/lib/clipstitchr/media/studioEditor/createStudioEditorAudioBuffer";
import { createStudioEditorRenderCanvas } from "@/lib/clipstitchr/media/studioEditor/createStudioEditorRenderCanvas";
import { createStudioEditorRenderResources } from "@/lib/clipstitchr/media/studioEditor/createStudioEditorRenderResources";
import { disposeStudioEditorRenderResources } from "@/lib/clipstitchr/media/studioEditor/disposeStudioEditorRenderResources";
import { drawStudioEditorFrame } from "@/lib/clipstitchr/media/studioEditor/drawStudioEditorFrame";
import { getStudioEditorResolvedSources } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorResolvedSources";
import { getStudioEditorActiveScene } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorActiveScene";
import { getStudioEditorSceneDurationSeconds } from "@/lib/clipstitchr/studio/editor/getStudioEditorSceneDurationSeconds";
import { assertStudioEditorProjectV1 } from "@/lib/clipstitchr/studio/editor/assertStudioEditorProjectV1";
import type { StudioEditorExportResult } from "@/lib/clipstitchr/types/StudioEditorExportResult";
import type { StudioEditorMediaSourceCatalog } from "@/lib/clipstitchr/types/studioEditor/StudioEditorMediaSourceCatalog";
import type { StudioEditorProjectV1 } from "@/lib/clipstitchr/types/studioEditor/StudioEditorProjectV1";

const MAX_BROWSER_EXPORT_SECONDS = 10 * 60;

type RenderStudioEditorProjectOptions = {
  catalog: StudioEditorMediaSourceCatalog;
  onProgress?: (progress: number) => void;
  project: StudioEditorProjectV1;
};

export async function renderStudioEditorProject({
  catalog,
  onProgress,
  project,
}: RenderStudioEditorProjectOptions): Promise<StudioEditorExportResult> {
  assertStudioEditorProjectV1(project);
  const duration = getStudioEditorSceneDurationSeconds(
    getStudioEditorActiveScene(project),
  );

  if (duration <= 0) {
    throw new Error("Add something to the timeline before exporting.");
  }

  if (duration > MAX_BROWSER_EXPORT_SECONDS) {
    throw new Error(
      "This browser export is longer than 10 minutes. Shorten the edit before exporting here.",
    );
  }

  const resolvedSources = getStudioEditorResolvedSources(project, catalog);
  const resources = await createStudioEditorRenderResources(
    resolvedSources,
    project.canvas,
  );
  let session: Awaited<ReturnType<typeof createMediaBunnyExportSession>> | null =
    null;

  try {
    onProgress?.(0.04);
    const audioBuffer = await createStudioEditorAudioBuffer({
      outputDuration: duration,
      project,
      resources,
    });
    onProgress?.(0.12);
    const codecs = await resolveMediaBunnyOutputCodecs(
      Boolean(audioBuffer),
      "This browser cannot encode the edit's audio.",
    );
    const renderCanvas = createStudioEditorRenderCanvas(project.canvas);
    const audioSource = createOutputAudioBufferSource(
      Boolean(audioBuffer),
      codecs.audioCodec,
    );
    const videoSource = createTikTokCanvasSource(
      renderCanvas.canvas,
      codecs.videoCodec,
    );
    session = await createMediaBunnyExportSession({
      audioSource,
      videoSource,
    });
    const frameDuration = 1 / project.canvas.fps;
    const frameCount = Math.max(1, Math.ceil(duration * project.canvas.fps));

    for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
      const timestamp = frameIndex * frameDuration;
      const durationForFrame = Math.min(frameDuration, duration - timestamp);

      await drawStudioEditorFrame({
        ...renderCanvas,
        project,
        resources,
        timelineSeconds: timestamp,
      });
      await videoSource.add(timestamp, durationForFrame, {
        keyFrame: frameIndex === 0,
      });
      onProgress?.(0.12 + ((frameIndex + 1) / frameCount) * 0.76);
    }

    if (audioBuffer && audioSource) {
      await audioSource.add(audioBuffer);
    }

    onProgress?.(0.92);
    const finalized = await finalizeMediaBunnyExportSession({
      session,
      onProgress,
    });
    session = null;

    return {
      ...finalized,
      duration,
      width: project.canvas.width,
      height: project.canvas.height,
      hasAudio: Boolean(audioBuffer),
    };
  } catch (error) {
    if (session) {
      await session.output.cancel().catch(() => undefined);
    }
    throw error;
  } finally {
    disposeStudioEditorRenderResources(resources);
  }
}
