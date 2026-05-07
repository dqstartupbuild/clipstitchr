import type { Input } from "mediabunny";
import type { InputAudioParameters } from "@/lib/clipr/types/InputAudioParameters";

export async function getInputAudioParameters(
  input: Input,
): Promise<InputAudioParameters | null> {
  const audioTrack = await input.getPrimaryAudioTrack();

  if (!audioTrack) {
    return null;
  }

  return {
    numberOfChannels: await audioTrack.getNumberOfChannels(),
    sampleRate: await audioTrack.getSampleRate(),
  };
}
