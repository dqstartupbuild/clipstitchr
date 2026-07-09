import type { CliGlobalOptions } from "./CliGlobalOptions.js";

export type DemoAutoCommandOptions = CliGlobalOptions & {
  audience?: string;
  driver?: string;
  goal?: string;
  product?: string;
  start?: string;
  steps?: string;
  target?: string;
  url?: string;
};
