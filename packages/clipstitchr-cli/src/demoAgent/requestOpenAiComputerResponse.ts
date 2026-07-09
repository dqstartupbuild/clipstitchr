import { createOpenAiComputerTool } from "./createOpenAiComputerTool.js";
import { defaultOpenAiComputerRequestTimeoutMs } from "./defaultOpenAiComputerRequestTimeoutMs.js";
import type { OpenAiComputerRequestInput } from "./OpenAiComputerRequestInput.js";
import type { OpenAiComputerResponse } from "./OpenAiComputerResponse.js";

export async function requestOpenAiComputerResponse({
  apiKey,
  input,
  model,
  previousResponseId,
}: OpenAiComputerRequestInput): Promise<OpenAiComputerResponse> {
  let response: Response;

  try {
    response = await fetch("https://api.openai.com/v1/responses", {
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
      signal: AbortSignal.timeout(defaultOpenAiComputerRequestTimeoutMs),
    });
  } catch (error) {
    const errorName =
      error && typeof error === "object" && "name" in error
        ? String(error.name)
        : "";

    if (errorName === "AbortError" || errorName === "TimeoutError") {
      throw new Error(
        `OpenAI Computer Use request timed out after ${Math.round(defaultOpenAiComputerRequestTimeoutMs / 1000)} seconds.`,
      );
    }

    throw error;
  }

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `OpenAI Computer Use request failed with HTTP ${response.status}: ${text}`,
    );
  }

  return JSON.parse(text) as OpenAiComputerResponse;
}
