const QWEN_VIDEO_FALLBACK_MAX_NEW_TOKENS = 512;

export function createQwenVideoFallbackPredictionInput({
  prompt,
  videoInput,
}: {
  prompt: string;
  videoInput: unknown;
}) {
  return {
    media: videoInput,
    prompt,
    max_new_tokens: QWEN_VIDEO_FALLBACK_MAX_NEW_TOKENS,
  };
}
