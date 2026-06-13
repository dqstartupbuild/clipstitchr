import { SUPPORTED_ANTHROPIC_TEXT_WRITING_MODEL_IDS } from "@/lib/clipstitchr/constants/supportedAnthropicTextWritingModelIds";

export function getIsAnthropicTextWritingModelId(modelId: string) {
  const trimmedModelId = modelId.trim();

  return (
    SUPPORTED_ANTHROPIC_TEXT_WRITING_MODEL_IDS.some(
      (supportedModelId) => supportedModelId === trimmedModelId,
    ) || trimmedModelId.startsWith("anthropic/claude-")
  );
}
