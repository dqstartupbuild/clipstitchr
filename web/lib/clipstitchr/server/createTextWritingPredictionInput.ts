import { getIsAnthropicTextWritingModelId } from "@/lib/clipstitchr/server/getIsAnthropicTextWritingModelId";

type CreateTextWritingPredictionInputOptions = {
  maxCompletionTokens: number;
  modelId: string;
  prompt: string;
  systemPrompt: string;
};

export function createTextWritingPredictionInput({
  maxCompletionTokens,
  modelId,
  prompt,
  systemPrompt,
}: CreateTextWritingPredictionInputOptions) {
  if (getIsAnthropicTextWritingModelId(modelId)) {
    return {
      prompt,
      system_prompt: systemPrompt,
      max_tokens: maxCompletionTokens,
    };
  }

  return {
    prompt,
    system_prompt: systemPrompt,
    temperature: 0.65,
    max_completion_tokens: maxCompletionTokens,
  };
}
