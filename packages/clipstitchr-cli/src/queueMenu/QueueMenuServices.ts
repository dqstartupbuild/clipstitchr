import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import type { QueueContentCommandOptions } from "../commands/QueueContentCommandOptions.js";

export type QueueMenuServices = {
  runAll: (options: CliGlobalOptions) => Promise<void>;
  runList: (options: CliGlobalOptions) => Promise<void>;
  runStitch: (
    stitchId: string | undefined,
    options: QueueContentCommandOptions,
  ) => Promise<void>;
  runSwipe: (
    swipeId: string | undefined,
    options: QueueContentCommandOptions,
  ) => Promise<void>;
};
