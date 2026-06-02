import { getCliprHookModelFamily } from "@/lib/clipstitchr/server/getCliprHookModelFamily";

const CLIPR_TEXT_MAX_OUTPUT_TOKENS = 1200;

type CreateCliprTextGenerationInputOptions = {
  modelId: string;
  prompt: string;
  systemPrompt: string;
};

export function createCliprTextGenerationInput({
  modelId,
  prompt,
  systemPrompt,
}: CreateCliprTextGenerationInputOptions) {
  if (getCliprHookModelFamily(modelId) === "anthropic-claude") {
    return {
      prompt,
      system_prompt: systemPrompt,
      max_tokens: CLIPR_TEXT_MAX_OUTPUT_TOKENS,
    };
  }

  return {
    prompt,
    system_prompt: systemPrompt,
    temperature: 0.65,
    max_completion_tokens: CLIPR_TEXT_MAX_OUTPUT_TOKENS,
  };
}
