import type { OpenAiComputerAction } from "./OpenAiComputerAction.js";

export type OpenAiComputerCall = {
  actions: OpenAiComputerAction[];
  call_id: string;
  type: "computer_call";
};
