import { copyAudioSamplesToSource } from "@/lib/clipstitchr/media/copyAudioSamplesToSource";
import { copyTextOverlayVideoFramesToSource } from "@/lib/clipstitchr/media/copyTextOverlayVideoFramesToSource";
import { createMediaBunnyExportSession } from "@/lib/clipstitchr/media/createMediaBunnyExportSession";
import { createMediaBunnyProgressMapper } from "@/lib/clipstitchr/media/createMediaBunnyProgressMapper";
import { createMediaInput } from "@/lib/clipstitchr/media/createMediaInput";
import { createOutputAudioSampleSource } from "@/lib/clipstitchr/media/createOutputAudioSampleSource";
import { createTextOverlayRenderContext } from "@/lib/clipstitchr/media/createTextOverlayRenderContext";
import { createTikTokCanvasSource } from "@/lib/clipstitchr/media/createTikTokCanvasSource";
import { finalizeMediaBunnyExportSession } from "@/lib/clipstitchr/media/finalizeMediaBunnyExportSession";
import { getInputDuration } from "@/lib/clipstitchr/media/getInputDuration";
import { resolveMediaBunnyOutputCodecs } from "@/lib/clipstitchr/media/resolveMediaBunnyOutputCodecs";
import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";

type RenderCliprVideoWithTextOverlayOptions = {
  onProgress?: (progress: number) => void;
  textOverlay: TextOverlay;
  videoBlob: Blob;
};

export async function renderCliprVideoWithTextOverlay({
  onProgress,
  textOverlay,
  videoBlob,
}: RenderCliprVideoWithTextOverlayOptions) {
  const input = createMediaInput(videoBlob);

  try {
    const includeAudio = Boolean(await input.getPrimaryAudioTrack());
    const duration = await getInputDuration(input);
    const codecs = await resolveMediaBunnyOutputCodecs(
      includeAudio,
      "No supported audio encoder found for this export.",
    );
    const renderContext = createTextOverlayRenderContext(
      TIKTOK_OUTPUT_WIDTH,
      TIKTOK_OUTPUT_HEIGHT,
    );
    const audioSource = createOutputAudioSampleSource(
      includeAudio,
      codecs.audioCodec,
    );
    const session = await createMediaBunnyExportSession({
      audioSource,
      videoSource: createTikTokCanvasSource(
        renderContext.canvas,
        codecs.videoCodec,
      ),
    });

    await copyTextOverlayVideoFramesToSource({
      input,
      source: session.videoSource,
      renderContext,
      timelineOffset: 0,
      trimRange: {
        start: 0,
        end: duration,
      },
      textOverlay,
      onProgress: createMediaBunnyProgressMapper(onProgress, 0, 0.75),
    });

    if (audioSource) {
      await copyAudioSamplesToSource({
        input,
        source: audioSource,
        timelineOffset: 0,
        trimRange: {
          start: 0,
          end: duration,
        },
        onProgress: createMediaBunnyProgressMapper(onProgress, 0.75, 0.15),
      });
    }

    return {
      ...(await finalizeMediaBunnyExportSession({
        onProgress,
        session,
      })),
      duration,
    };
  } finally {
    input.dispose();
  }
}
