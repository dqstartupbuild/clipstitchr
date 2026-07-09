import type { OpenAiComputerRequestInput } from "./OpenAiComputerRequestInput.js";
import type { OpenAiComputerResponse } from "./OpenAiComputerResponse.js";

export type OpenAiComputerRequester = (
  input: OpenAiComputerRequestInput,
) => Promise<OpenAiComputerResponse>;
