import type { CliGlobalOptions } from "./CliGlobalOptions.js";

export type QueueContentCommandOptions = CliGlobalOptions & {
  accounts?: string;
  all?: boolean;
  caption?: string;
  product?: string;
  title?: string;
};
