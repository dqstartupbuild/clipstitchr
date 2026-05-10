export function getSwiprBackgroundGenerationModelId() {
  return process.env.SWIPR_BACKGROUND_MODEL_ID || "openai/gpt-image-2";
}
