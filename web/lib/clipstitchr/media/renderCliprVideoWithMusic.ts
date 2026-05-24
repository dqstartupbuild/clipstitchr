import { AudioBufferSource, VideoSampleSource } from "mediabunny";
import {
  OUTPUT_AUDIO_NUMBER_OF_CHANNELS,
  OUTPUT_AUDIO_SAMPLE_RATE,
} from "@/lib/clipstitchr/constants/audioOutputParameters";
import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import { copyVideoSamplesToSource } from "@/lib/clipstitchr/media/copyVideoSamplesToSource";
import { copyTextOverlayVideoFramesToSource } from "@/lib/clipstitchr/media/copyTextOverlayVideoFramesToSource";
import { createCliprMixedAudioBuffer } from "@/lib/clipstitchr/media/createCliprMixedAudioBuffer";
import { createTextOverlayRenderContext } from "@/lib/clipstitchr/media/createTextOverlayRenderContext";
import { createTikTokCanvasSource } from "@/lib/clipstitchr/media/createTikTokCanvasSource";
import { createMediaInput } from "@/lib/clipstitchr/media/createMediaInput";
import { createMp4Output } from "@/lib/clipstitchr/media/createMp4Output";
import { createVideoBlobFromBuffer } from "@/lib/clipstitchr/media/createVideoBlobFromBuffer";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { getInputDuration } from "@/lib/clipstitchr/media/getInputDuration";
import { getSupportedOutputCodecs } from "@/lib/clipstitchr/media/getSupportedOutputCodecs";
import { getVideoMimeType } from "@/lib/clipstitchr/media/getVideoMimeType";
import { registerAacEncoderIfNeeded } from "@/lib/clipstitchr/media/registerAacEncoderIfNeeded";

type RenderCliprVideoWithMusicOptions = {
  musicBlob: Blob;
  onProgress?: (progress: number) => void;
  textOverlay?: TextOverlay | null;
  videoBlob: Blob;
  volume: number;
};

type RenderCliprVideoWithMusicResult = {
  blob: Blob;
  duration: number;
  mimeType: string;
};

export async function renderCliprVideoWithMusic({
  musicBlob,
  onProgress,
  textOverlay = null,
  videoBlob,
  volume,
}: RenderCliprVideoWithMusicOptions): Promise<RenderCliprVideoWithMusicResult> {
  const input = createMediaInput(videoBlob);

  try {
    await registerAacEncoderIfNeeded();

    const duration = await getInputDuration(input);
    const mixedAudioBuffer = await createCliprMixedAudioBuffer({
      duration,
      musicBlob,
      videoInput: input,
      volume,
    });

    onProgress?.(0.15);

    const codecs = await getSupportedOutputCodecs(true);

    if (!codecs.videoCodec) {
      throw new Error(codecs.warnings[0] ?? "No supported video encoder found.");
    }

    if (!codecs.audioCodec) {
      throw new Error(
        codecs.warnings[1] ?? "No supported audio encoder found for this export.",
      );
    }

    const output = createMp4Output();
    const renderContext = textOverlay
      ? createTextOverlayRenderContext(TIKTOK_OUTPUT_WIDTH, TIKTOK_OUTPUT_HEIGHT)
      : null;
    const videoSource = renderContext
      ? createTikTokCanvasSource(renderContext.canvas, codecs.videoCodec)
      : new VideoSampleSource({
          codec: codecs.videoCodec,
          bitrate: 8_000_000,
          keyFrameInterval: 2,
          sizeChangeBehavior: "contain",
          transform: {
            width: TIKTOK_OUTPUT_WIDTH,
            height: TIKTOK_OUTPUT_HEIGHT,
          },
        });
    const audioSource = new AudioBufferSource({
      codec: codecs.audioCodec,
      bitrate: 160_000,
      transform: {
        numberOfChannels: OUTPUT_AUDIO_NUMBER_OF_CHANNELS,
        sampleRate: OUTPUT_AUDIO_SAMPLE_RATE,
      },
    });

    output.addVideoTrack(videoSource, {
      rotation: 0,
    });
    output.addAudioTrack(audioSource);

    await output.start();
    if (renderContext && textOverlay) {
      await copyTextOverlayVideoFramesToSource({
        input,
        source: videoSource as ReturnType<typeof createTikTokCanvasSource>,
        renderContext,
        timelineOffset: 0,
        trimRange: {
          start: 0,
          end: duration,
        },
        textOverlay,
        onProgress: (progress) => onProgress?.(0.15 + progress * 0.7),
      });
    } else {
      await copyVideoSamplesToSource({
        input,
        source: videoSource as VideoSampleSource,
        timelineOffset: 0,
        trimRange: {
          start: 0,
          end: duration,
        },
        onProgress: (progress) => onProgress?.(0.15 + progress * 0.7),
      });
    }
    await audioSource.add(mixedAudioBuffer);

    onProgress?.(0.95);

    videoSource.close();
    audioSource.close();

    await output.finalize();

    const mimeType = await getVideoMimeType(output);
    const blob = createVideoBlobFromBuffer(output.target.buffer, mimeType);

    onProgress?.(1);

    return {
      blob,
      duration,
      mimeType,
    };
  } finally {
    input.dispose();
  }
}
