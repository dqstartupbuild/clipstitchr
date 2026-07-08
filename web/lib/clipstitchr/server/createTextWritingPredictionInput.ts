import { ANTHROPIC_TEXT_WRITING_MINIMUM_MAX_TOKENS } from "@/lib/clipstitchr/constants/anthropicTextWritingMinimumMaxTokens";
import { getIsAnthropicTextWritingModelId } from "@/lib/clipstitchr/server/getIsAnthropicTextWritingModelId";

type CreateTextWritingPredictionInputOptions = {
  maxCompletionTokens: number;
  modelId: string;
  prompt: string;
  systemPrompt: string;
  temperature?: number;
};

export function createTextWritingPredictionInput({
  maxCompletionTokens,
  modelId,
  prompt,
  systemPrompt,
  temperature = 0.65,
}: CreateTextWritingPredictionInputOptions) {
  if (getIsAnthropicTextWritingModelId(modelId)) {
    return {
      prompt,
      system_prompt: systemPrompt,
      max_tokens: Math.max(
        ANTHROPIC_TEXT_WRITING_MINIMUM_MAX_TOKENS,
        maxCompletionTokens,
      ),
    };
  }

  return {
    prompt,
    system_prompt: systemPrompt,
    temperature,
    max_completion_tokens: maxCompletionTokens,
  };
}
