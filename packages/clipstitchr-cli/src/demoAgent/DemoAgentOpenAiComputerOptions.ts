import type { ClipstitchrCredentials } from "../config/ClipstitchrCredentials.js";
import type { OpenAiComputerMode } from "./OpenAiComputerMode.js";
import type { OpenAiComputerRequester } from "./OpenAiComputerRequester.js";

export type DemoAgentOpenAiComputerOptions = {
  apiKey?: string;
  credentials?: ClipstitchrCredentials;
  mode: OpenAiComputerMode;
  model: string;
  requester?: OpenAiComputerRequester;
};
