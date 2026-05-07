import { VideoSampleSink, type Input, type VideoSampleSource } from "mediabunny";
import { createRetimedVideoSample } from "@/lib/clipr/media/createRetimedVideoSample";

type CopyVideoSamplesOptions = {
  input: Input;
  source: VideoSampleSource;
  timelineOffset: number;
  onProgress?: (progress: number) => void;
};

export async function copyVideoSamplesToSource({
  input,
  source,
  timelineOffset,
  onProgress,
}: CopyVideoSamplesOptions) {
  const track = await input.getPrimaryVideoTrack();

  if (!track) {
    throw new Error("A normalized clip was missing its video track.");
  }

  const sink = new VideoSampleSink(track);
  const sourceOffset = await track.getFirstTimestamp();
  const duration = await track.computeDuration();
  let isFirstSample = true;

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
      onProgress?.(
        Math.min(1, Math.max(0, (sourceTimestamp - sourceOffset) / duration)),
      );
    } finally {
      retimedSample.close();
    }
  }
}
