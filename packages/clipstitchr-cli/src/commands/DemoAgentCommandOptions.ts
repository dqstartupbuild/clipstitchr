import type { DemoAutoCommandOptions } from "./DemoAutoCommandOptions.js";

export type DemoAgentCommandOptions = DemoAutoCommandOptions & {
  aiPlanner?: boolean;
  guide?: string;
  upload?: boolean;
};
