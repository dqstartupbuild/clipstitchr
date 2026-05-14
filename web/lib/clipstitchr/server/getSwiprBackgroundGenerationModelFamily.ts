type SwiprBackgroundGenerationModelFamily =
  | "openai-gpt-image"
  | "pruna-p-image"
  | "pruna-wan-2.2-image";

export function getSwiprBackgroundGenerationModelFamily(
  modelId: string,
): SwiprBackgroundGenerationModelFamily {
  const trimmedModelId = modelId.trim();

  if (trimmedModelId === "prunaai/p-image") {
    return "pruna-p-image";
  }

  if (trimmedModelId === "prunaai/wan-2.2-image") {
    return "pruna-wan-2.2-image";
  }

  return "openai-gpt-image";
}
