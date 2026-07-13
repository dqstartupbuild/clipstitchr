import { AudioSampleSink, CanvasSink } from "mediabunny";
import { createMediaInput } from "@/lib/clipstitchr/media/createMediaInput";
import { calculateAudioSampleRms } from "@/lib/clipstitchr/tools/deadSpaceFinder/calculateAudioSampleRms";
import { calculateFrameLumaDifference } from "@/lib/clipstitchr/tools/deadSpaceFinder/calculateFrameLumaDifference";
import { createDeadSpaceAbortError } from "@/lib/clipstitchr/tools/deadSpaceFinder/createDeadSpaceAbortError";
import { createDeadSpaceSamplingTimestamps } from "@/lib/clipstitchr/tools/deadSpaceFinder/createDeadSpaceSamplingTimestamps";
import { createDeadSpaceSpans } from "@/lib/clipstitchr/tools/deadSpaceFinder/createDeadSpaceSpans";
import { deadSpaceAnalysisLimits } from "@/lib/clipstitchr/tools/deadSpaceFinder/deadSpaceAnalysisLimits";
import type { DeadSpaceAnalysis } from "@/lib/clipstitchr/tools/deadSpaceFinder/DeadSpaceAnalysis";
import type { DeadSpaceAnalysisOptions } from "@/lib/clipstitchr/tools/deadSpaceFinder/DeadSpaceAnalysisOptions";
import type { DeadSpaceSample } from "@/lib/clipstitchr/tools/deadSpaceFinder/DeadSpaceSample";
import { getCanvasPixelData } from "@/lib/clipstitchr/tools/deadSpaceFinder/getCanvasPixelData";
import { createLocalVideoInputDisposer } from "@/lib/clipstitchr/tools/localVideoInspection/createLocalVideoInputDisposer";

export async function readDeadSpaceAnalysis(
  file: File,
  options: DeadSpaceAnalysisOptions,
  signal?: AbortSignal,
): Promise<DeadSpaceAnalysis> {
  if (file.size > deadSpaceAnalysisLimits.maxFileBytes) {
    throw new Error(
      "Choose a video smaller than 200 MB for this browser-local review.",
    );
  }

  const input = createMediaInput(file);
  const dispose = createLocalVideoInputDisposer(input);
  signal?.addEventListener("abort", dispose, { once: true });

  try {
    if (signal?.aborted) throw createDeadSpaceAbortError();
    const videoTrack = await input.getPrimaryVideoTrack();
    if (!videoTrack)
      throw new Error("Choose a file that contains a video track.");
    if (!(await videoTrack.canDecode())) {
      throw new Error("This browser cannot decode the video's primary track.");
    }

    const duration = await videoTrack.computeDuration();
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error("This video's duration could not be read.");
    }
    if (duration > deadSpaceAnalysisLimits.maxDurationSeconds) {
      throw new Error(
        "Choose a video that is three minutes or shorter for this local review.",
      );
    }

    const timestamps = createDeadSpaceSamplingTimestamps(
      duration,
      options.sampleIntervalSeconds,
    );
    const visualChanges: number[] = [];
    const canvasSink = new CanvasSink(videoTrack, { width: 64, poolSize: 1 });
    let previousPixels: Uint8ClampedArray | null = null;

    for await (const wrapped of canvasSink.canvasesAtTimestamps(timestamps)) {
      if (signal?.aborted) throw createDeadSpaceAbortError();
      if (!wrapped) {
        visualChanges.push(1);
        continue;
      }
      const pixels = getCanvasPixelData(wrapped.canvas);
      visualChanges.push(
        previousPixels
          ? calculateFrameLumaDifference(previousPixels, pixels)
          : 1,
      );
      previousPixels = new Uint8ClampedArray(pixels);
    }

    const audioTrack = await input.getPrimaryAudioTrack();
    const audioValues: Array<number | null> = [];

    if (audioTrack && (await audioTrack.canDecode())) {
      const audioSink = new AudioSampleSink(audioTrack);
      for await (const sample of audioSink.samplesAtTimestamps(timestamps)) {
        if (!sample) {
          if (signal?.aborted) throw createDeadSpaceAbortError();
          audioValues.push(null);
          continue;
        }
        try {
          if (signal?.aborted) throw createDeadSpaceAbortError();
          audioValues.push(calculateAudioSampleRms(sample));
        } finally {
          sample.close();
        }
      }
    }

    const samples: DeadSpaceSample[] = timestamps.map((timestamp, index) => ({
      audioRms: audioValues[index] ?? null,
      timestamp,
      visualChange: visualChanges[index] ?? 1,
    }));

    return {
      duration,
      hasAudio: Boolean(audioTrack),
      sampleCount: samples.length,
      samples,
      spans: createDeadSpaceSpans(samples, options),
    };
  } catch (error) {
    if (signal?.aborted) throw createDeadSpaceAbortError();
    throw error;
  } finally {
    signal?.removeEventListener("abort", dispose);
    dispose();
  }
}
