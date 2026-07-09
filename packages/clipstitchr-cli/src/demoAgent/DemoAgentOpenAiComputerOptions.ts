import type { OpenAiComputerRequester } from "./OpenAiComputerRequester.js";

export type DemoAgentOpenAiComputerOptions = {
  apiKey: string;
  model: string;
  requester?: OpenAiComputerRequester;
};
