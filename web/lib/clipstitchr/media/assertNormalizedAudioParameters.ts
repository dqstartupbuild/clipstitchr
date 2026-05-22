import {
  OUTPUT_AUDIO_NUMBER_OF_CHANNELS,
  OUTPUT_AUDIO_SAMPLE_RATE,
} from "@/lib/clipstitchr/constants/audioOutputParameters";
import type { InputAudioParameters } from "@/lib/clipstitchr/types/InputAudioParameters";

type AssertNormalizedAudioParametersOptions = {
  audioParameters: InputAudioParameters | null;
  subject: string;
  workflow: string;
};

export function assertNormalizedAudioParameters({
  audioParameters,
  subject,
  workflow,
}: AssertNormalizedAudioParametersOptions) {
  if (
    !audioParameters ||
    (audioParameters.numberOfChannels === OUTPUT_AUDIO_NUMBER_OF_CHANNELS &&
      audioParameters.sampleRate === OUTPUT_AUDIO_SAMPLE_RATE)
  ) {
    return;
  }

  throw new Error(
    `${subject} has audio at ${audioParameters.numberOfChannels} channels and ` +
      `${audioParameters.sampleRate} Hz. Re-upload it so ClipStitchr can normalize audio to ` +
      `${OUTPUT_AUDIO_NUMBER_OF_CHANNELS} channels at ${OUTPUT_AUDIO_SAMPLE_RATE} Hz before ${workflow}.`,
  );
}
