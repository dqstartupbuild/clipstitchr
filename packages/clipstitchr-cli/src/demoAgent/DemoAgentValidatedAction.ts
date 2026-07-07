import type { DemoAgentAction } from "./DemoAgentAction.js";

export type DemoAgentValidatedAction = DemoAgentAction & {
  resolvedFilePath?: string;
  resolvedUrl?: string;
  resolvedValue?: string;
};
