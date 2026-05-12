import { createCliprSeedanceNativeAudioPrompt } from "@/lib/clipstitchr/server/createCliprSeedanceNativeAudioPrompt";
import { getCliprSeedancePredictionInput } from "@/lib/clipstitchr/server/getCliprSeedancePredictionInput";

export function createCliprSeedanceFallbackInput(
  input: unknown,
): Record<string, unknown> | null {
  const predictionInput = getCliprSeedancePredictionInput(input);

  if (!predictionInput?.reference_audios?.length) {
    return null;
  }

  const fallbackInput = { ...predictionInput };

  delete fallbackInput.reference_audios;

  return {
    ...fallbackInput,
    prompt: createCliprSeedanceNativeAudioPrompt(predictionInput.prompt),
  };
}
