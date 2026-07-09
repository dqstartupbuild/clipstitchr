import { createOpenAiComputerTool } from "./createOpenAiComputerTool.js";
import type { OpenAiComputerRequestInput } from "./OpenAiComputerRequestInput.js";
import type { OpenAiComputerResponse } from "./OpenAiComputerResponse.js";

export async function requestOpenAiComputerResponse({
  apiKey,
  input,
  model,
  previousResponseId,
}: OpenAiComputerRequestInput): Promise<OpenAiComputerResponse> {
  const response = await fetch("https://api.openai.com/v1/responses", {
    body: JSON.stringify({
      input,
      model,
      previous_response_id: previousResponseId,
      tools: [createOpenAiComputerTool()],
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `OpenAI Computer Use request failed with HTTP ${response.status}: ${text}`,
    );
  }

  return JSON.parse(text) as OpenAiComputerResponse;
}
