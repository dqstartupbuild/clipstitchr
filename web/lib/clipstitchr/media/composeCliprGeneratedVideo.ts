import { CanvasSink } from "mediabunny";
import { copyAudioSamplesToSource } from "@/lib/clipstitchr/media/copyAudioSamplesToSource";
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

type ComposeCliprGeneratedVideoOptions = {
  audioBlob?: Blob;
  onProgress?: (progress: number) => void;
  videoBlobs: Blob[];
};

type ComposeCliprGeneratedVideoResult = {
  blob: Blob;
  duration: number;
  mimeType: string;
};

export async function composeCliprGeneratedVideo({
  audioBlob,
  onProgress,
  videoBlobs,
}: ComposeCliprGeneratedVideoOptions): Promise<ComposeCliprGeneratedVideoResult> {
  if (!videoBlobs.length) {
    throw new Error("Clipr did not return generated video scenes.");
  }

  const videoInputs = videoBlobs.map((blob) => createMediaInput(blob));
  const audioInput = audioBlob ? createMediaInput(audioBlob) : null;

  try {
    const includeAudio = audioInput
      ? Boolean(await audioInput.getPrimaryAudioTrack())
      : false;
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
    let timelineOffset = 0;
    let videoEndTimestamp = 0;

    for (let index = 0; index < videoInputs.length; index += 1) {
      const input = videoInputs[index];
      const track = await input.getPrimaryVideoTrack();

      if (!track) {
        throw new Error("A generated Clipr scene was missing video.");
      }

      const sink = new CanvasSink(track, {
        width: TIKTOK_OUTPUT_WIDTH,
        height: TIKTOK_OUTPUT_HEIGHT,
        fit: "fill",
        rotation: 0,
        poolSize: 1,
      });
      const sourceOffset = await track.getFirstTimestamp();
      const duration = await track.computeDuration();
      let isFirstFrame = true;

      for await (const frame of sink.canvases(
        sourceOffset,
        sourceOffset + duration,
      )) {
        const outputTimestamp =
          Math.max(0, frame.timestamp - sourceOffset) + timelineOffset;

        renderContext.context.clearRect(
          0,
          0,
          TIKTOK_OUTPUT_WIDTH,
          TIKTOK_OUTPUT_HEIGHT,
        );
        renderContext.context.drawImage(
          frame.canvas,
          0,
          0,
          TIKTOK_OUTPUT_WIDTH,
          TIKTOK_OUTPUT_HEIGHT,
        );

        await session.videoSource.add(
          outputTimestamp,
          frame.duration,
          isFirstFrame ? { keyFrame: true } : undefined,
        );
        isFirstFrame = false;
        videoEndTimestamp = Math.max(
          videoEndTimestamp,
          outputTimestamp + frame.duration,
        );
        onProgress?.(
          ((index +
            Math.min(1, Math.max(0, (frame.timestamp - sourceOffset) / duration))) /
            videoInputs.length) *
            0.75,
        );
      }

      timelineOffset = Math.max(timelineOffset + duration, videoEndTimestamp);
    }

    let audioEndTimestamp = 0;

    if (audioInput && audioSource) {
      const audioDuration = await getInputDuration(audioInput);
      const audio = await copyAudioSamplesToSource({
        input: audioInput,
        source: audioSource,
        timelineOffset: 0,
        trimRange: {
          start: 0,
          end: audioDuration,
        },
        onProgress: createMediaBunnyProgressMapper(onProgress, 0.75, 0.15),
      });

      audioEndTimestamp = audio.endTimestamp;
    }

    const { blob, mimeType } = await finalizeMediaBunnyExportSession({
      onProgress,
      session,
    });

    return {
      blob,
      duration: Math.max(videoEndTimestamp, audioEndTimestamp),
      mimeType,
    };
  } finally {
    videoInputs.forEach((input) => input.dispose());
    audioInput?.dispose();
  }
}
