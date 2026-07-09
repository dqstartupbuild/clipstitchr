import type { CliGlobalOptions } from "./CliGlobalOptions.js";

export type DemoAutoCommandOptions = CliGlobalOptions & {
  audience?: string;
  confirmUpload?: boolean;
  driver?: string;
  goal?: string;
  openaiMode?: string;
  product?: string;
  start?: string;
  surface?: string;
  steps?: string;
  target?: string;
  upload?: boolean;
  url?: string;
};
