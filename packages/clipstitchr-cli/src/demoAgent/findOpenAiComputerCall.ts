import type { OpenAiComputerCall } from "./OpenAiComputerCall.js";
import type { OpenAiComputerResponse } from "./OpenAiComputerResponse.js";

export function findOpenAiComputerCall(
  response: OpenAiComputerResponse,
): OpenAiComputerCall | undefined {
  return response.output?.find((item): item is OpenAiComputerCall => {
    if (!item || typeof item !== "object") {
      return false;
    }

    const candidate = item as Partial<OpenAiComputerCall>;

    return (
      candidate.type === "computer_call" &&
      typeof candidate.call_id === "string" &&
      Array.isArray(candidate.actions)
    );
  });
}
