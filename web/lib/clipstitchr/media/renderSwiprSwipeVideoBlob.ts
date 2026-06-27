import type { CanvasSource } from "mediabunny";
import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import { SWIPR_VIDEO_SECONDS_PER_SLIDE } from "@/lib/clipstitchr/constants/swiprVideoSecondsPerSlide";
import { createMediaBunnyExportSession } from "@/lib/clipstitchr/media/createMediaBunnyExportSession";
import { createOutputAudioBufferSource } from "@/lib/clipstitchr/media/createOutputAudioBufferSource";
import { createSwiprMusicAudioBuffer } from "@/lib/clipstitchr/media/createSwiprMusicAudioBuffer";
import { createTikTokCanvasSource } from "@/lib/clipstitchr/media/createTikTokCanvasSource";
import { drawSwiprSlideToCanvas } from "@/lib/clipstitchr/media/drawSwiprSlideToCanvas";
import { finalizeMediaBunnyExportSession } from "@/lib/clipstitchr/media/finalizeMediaBunnyExportSession";
import { loadImageFromBlob } from "@/lib/clipstitchr/media/loadImageFromBlob";
import { resolveMediaBunnyOutputCodecs } from "@/lib/clipstitchr/media/resolveMediaBunnyOutputCodecs";
import type { SwiprSlide } from "@/lib/clipstitchr/types/SwiprSlide";

type RenderSwiprSwipeVideoBlobOptions = {
  musicBlob?: Blob | null;
  musicVolume?: number;
  onProgress?: (progress: number) => void;
  slideBackgroundBlobs: Record<string, Blob>;
  slides: SwiprSlide[];
};

export async function renderSwiprSwipeVideoBlob({
  musicBlob = null,
  musicVolume = 1,
  onProgress,
  slideBackgroundBlobs,
  slides,
}: RenderSwiprSwipeVideoBlobOptions) {
  if (!slides.length) {
    throw new Error("Add at least one image before scheduling.");
  }

  const includeAudio = Boolean(musicBlob);
  const codecs = await resolveMediaBunnyOutputCodecs(
    includeAudio,
    "No supported audio encoder found for this export.",
  );
  const canvas = document.createElement("canvas");

  canvas.width = TIKTOK_OUTPUT_WIDTH;
  canvas.height = TIKTOK_OUTPUT_HEIGHT;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to create Swipr video canvas.");
  }

  const session = await createMediaBunnyExportSession({
    audioSource: createOutputAudioBufferSource(includeAudio, codecs.audioCodec),
    videoSource: createTikTokCanvasSource(canvas, codecs.videoCodec),
  });
  const outputDuration = slides.length * SWIPR_VIDEO_SECONDS_PER_SLIDE;

  for (let index = 0; index < slides.length; index += 1) {
    const slide = slides[index];
    const backgroundBlob = slideBackgroundBlobs[slide.id];

    if (!backgroundBlob) {
      throw new Error("Choose photos for every image before scheduling.");
    }

    drawSwiprSlideToCanvas(context, await loadImageFromBlob(backgroundBlob), slide);
    await (session.videoSource as CanvasSource).add(
      index * SWIPR_VIDEO_SECONDS_PER_SLIDE,
      SWIPR_VIDEO_SECONDS_PER_SLIDE,
      { keyFrame: true },
    );
    onProgress?.(((index + 1) / slides.length) * 0.8);
  }

  if (session.audioSource && musicBlob) {
    await session.audioSource.add(
      await createSwiprMusicAudioBuffer({
        duration: outputDuration,
        musicBlob,
        volume: musicVolume,
      }),
    );
    onProgress?.(0.92);
  }

  const { blob, mimeType } = await finalizeMediaBunnyExportSession({
    onProgress,
    session,
  });

  return {
    blob,
    duration: outputDuration,
    mimeType,
  };
}
