export function readOpenAiApiKey() {
  return process.env.OPENAI_API_KEY?.trim() || undefined;
}
