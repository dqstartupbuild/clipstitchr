import type { CliGlobalOptions } from "./CliGlobalOptions.js";

export type DemoAutoCommandOptions = CliGlobalOptions & {
  audience?: string;
  driver?: string;
  goal?: string;
  openaiMode?: string;
  product?: string;
  start?: string;
  surface?: string;
  steps?: string;
  target?: string;
  url?: string;
};
