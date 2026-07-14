import { LoopsClient } from "loops";

export function createLoopsClient(apiKey: string) {
  const normalizedApiKey = apiKey.trim();

  if (!normalizedApiKey) {
    throw new Error("Loops is not configured.");
  }

  return new LoopsClient(normalizedApiKey);
}
