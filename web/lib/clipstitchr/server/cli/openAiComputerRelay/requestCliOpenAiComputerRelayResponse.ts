import type { CliOpenAiComputerRelayRequest } from "@/lib/clipstitchr/server/cli/openAiComputerRelay/CliOpenAiComputerRelayRequest";
import { createCliOpenAiComputerTool } from "@/lib/clipstitchr/server/cli/openAiComputerRelay/createCliOpenAiComputerTool";
import { filterCliOpenAiComputerRelayResponse } from "@/lib/clipstitchr/server/cli/openAiComputerRelay/filterCliOpenAiComputerRelayResponse";
import { getOpenAiApiKey } from "@/lib/clipstitchr/server/cli/openAiComputerRelay/getOpenAiApiKey";
import { openAiComputerRelayRequestTimeoutMs } from "@/lib/clipstitchr/server/cli/openAiComputerRelay/openAiComputerRelayRequestTimeoutMs";
import { openAiResponsesApiUrl } from "@/lib/clipstitchr/server/cli/openAiComputerRelay/openAiResponsesApiUrl";

export async function requestCliOpenAiComputerRelayResponse(
  request: CliOpenAiComputerRelayRequest,
) {
  const response = await fetch(openAiResponsesApiUrl, {
    body: JSON.stringify({
      input: request.input,
      model: request.model,
      previous_response_id: request.previousResponseId,
      tools: [createCliOpenAiComputerTool()],
    }),
    headers: {
      Authorization: `Bearer ${getOpenAiApiKey()}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    signal: AbortSignal.timeout(openAiComputerRelayRequestTimeoutMs),
  });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `OpenAI Computer Use relay failed with HTTP ${response.status}: ${text}`,
    );
  }

  return filterCliOpenAiComputerRelayResponse(JSON.parse(text) as unknown);
}
