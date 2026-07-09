import type { ClipstitchrCredentials } from "../config/ClipstitchrCredentials.js";
import type { OpenAiComputerRelayRequestBody } from "../demoAgent/OpenAiComputerRelayRequestBody.js";
import type { OpenAiComputerResponse } from "../demoAgent/OpenAiComputerResponse.js";
import { requestJson } from "./requestJson.js";

export async function requestOpenAiComputerRelayResponse(
  credentials: ClipstitchrCredentials,
  body: OpenAiComputerRelayRequestBody,
) {
  return await requestJson<OpenAiComputerResponse>(
    {
      accessToken: credentials.accessToken,
      apiBaseUrl: credentials.apiBaseUrl,
    },
    "/api/cli/openai/computer",
    {
      body: JSON.stringify(body),
      method: "POST",
    },
  );
}
