import { AudioSampleSink, type AudioSampleSource, type Input } from "mediabunny";
import { createRetimedAudioSample } from "@/lib/clipr/media/createRetimedAudioSample";

type CopyAudioSamplesOptions = {
  input: Input;
  source: AudioSampleSource;
  timelineOffset: number;
  onProgress?: (progress: number) => void;
};

export async function copyAudioSamplesToSource({
  input,
  source,
  timelineOffset,
  onProgress,
}: CopyAudioSamplesOptions) {
  const track = await input.getPrimaryAudioTrack();

  if (!track) {
    return;
  }

  const sink = new AudioSampleSink(track);
  const sourceOffset = await track.getFirstTimestamp();
  const duration = await track.computeDuration();

  for await (const sample of sink.samples()) {
    const sourceTimestamp = sample.timestamp;
    const retimedSample = createRetimedAudioSample(
      sample,
      timelineOffset,
      sourceOffset,
    );

    try {
      await source.add(retimedSample);
      onProgress?.(
        Math.min(1, Math.max(0, (sourceTimestamp - sourceOffset) / duration)),
      );
    } finally {
      retimedSample.close();
    }
  }
}
