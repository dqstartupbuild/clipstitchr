type CliprSeedancePredictionInput = {
  prompt: string;
  reference_audios?: unknown[];
  [key: string]: unknown;
};

export function getCliprSeedancePredictionInput(
  input: unknown,
): CliprSeedancePredictionInput | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const predictionInput = input as Record<string, unknown>;

  if (typeof predictionInput.prompt !== "string") {
    return null;
  }

  return {
    ...predictionInput,
    prompt: predictionInput.prompt,
    reference_audios: Array.isArray(predictionInput.reference_audios)
      ? predictionInput.reference_audios
      : undefined,
  };
}
