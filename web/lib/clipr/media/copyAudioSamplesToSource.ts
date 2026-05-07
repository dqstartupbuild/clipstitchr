import { AudioSampleSink, type AudioSampleSource, type Input } from "mediabunny";
import { createRetimedAudioSample } from "@/lib/clipr/media/createRetimedAudioSample";

type CopyAudioSamplesOptions = {
  input: Input;
  source: AudioSampleSource;
  timelineOffset: number;
  onProgress?: (progress: number) => void;
};

type CopyAudioSamplesResult = {
  endTimestamp: number;
};

export async function copyAudioSamplesToSource({
  input,
  source,
  timelineOffset,
  onProgress,
}: CopyAudioSamplesOptions): Promise<CopyAudioSamplesResult> {
  const track = await input.getPrimaryAudioTrack();

  if (!track) {
    return { endTimestamp: timelineOffset };
  }

  const sink = new AudioSampleSink(track);
  const sourceOffset = await track.getFirstTimestamp();
  const duration = await track.computeDuration();
  let endTimestamp = timelineOffset;

  for await (const sample of sink.samples()) {
    const sourceTimestamp = sample.timestamp;
    const retimedSample = createRetimedAudioSample(
      sample,
      timelineOffset,
      sourceOffset,
    );

    try {
      await source.add(retimedSample);
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
