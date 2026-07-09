import { requestOpenAiComputerRelayResponse } from "../api/requestOpenAiComputerRelayResponse.js";
import type { ClipstitchrCredentials } from "../config/ClipstitchrCredentials.js";
import type { OpenAiComputerRequester } from "./OpenAiComputerRequester.js";

export function createOpenAiComputerRelayRequester(input: {
  credentials: ClipstitchrCredentials;
  runId: string;
  runStartedAt: string;
}): OpenAiComputerRequester {
  let callIndex = 0;

  return async (request) => {
    callIndex += 1;

    return await requestOpenAiComputerRelayResponse(input.credentials, {
      callIndex,
      input: request.input,
      model: request.model,
      previousResponseId: request.previousResponseId,
      runId: input.runId,
      runStartedAt: input.runStartedAt,
    });
  };
}
