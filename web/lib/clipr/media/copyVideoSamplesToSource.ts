import { VideoSampleSink, type Input, type VideoSampleSource } from "mediabunny";
import { createRetimedVideoSample } from "@/lib/clipr/media/createRetimedVideoSample";

type CopyVideoSamplesOptions = {
  input: Input;
  source: VideoSampleSource;
  timelineOffset: number;
  onProgress?: (progress: number) => void;
};

type CopyVideoSamplesResult = {
  endTimestamp: number;
};

export async function copyVideoSamplesToSource({
  input,
  source,
  timelineOffset,
  onProgress,
}: CopyVideoSamplesOptions): Promise<CopyVideoSamplesResult> {
  const track = await input.getPrimaryVideoTrack();

  if (!track) {
    throw new Error("A normalized clip was missing its video track.");
  }

  const sink = new VideoSampleSink(track);
  const sourceOffset = await track.getFirstTimestamp();
  const duration = await track.computeDuration();
  let isFirstSample = true;
  let endTimestamp = timelineOffset;

  for await (const sample of sink.samples()) {
    const sourceTimestamp = sample.timestamp;
    const retimedSample = createRetimedVideoSample(
      sample,
      timelineOffset,
      sourceOffset,
    );

    try {
      await source.add(
        retimedSample,
        isFirstSample ? { keyFrame: true } : undefined,
      );
      isFirstSample = false;
      endTimestamp = Math.max(
        endTimestamp,
        retimedSample.timestamp + retimedSample.duration,
      );
      onProgress?.(
        duration > 0
          ? Math.min(1, Math.max(0, (sourceTimestamp - sourceOffset) / duration))
          : 1,
      );
    } finally {
      retimedSample.close();
    }
  }

  return { endTimestamp };
}
