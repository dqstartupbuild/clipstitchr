import { runQueueAllCommand } from "../commands/runQueueAllCommand.js";
import { runQueueListCommand } from "../commands/runQueueListCommand.js";
import { runQueueStitchCommand } from "../commands/runQueueStitchCommand.js";
import { runQueueSwipeCommand } from "../commands/runQueueSwipeCommand.js";
import type { QueueMenuServices } from "./QueueMenuServices.js";

export function createQueueMenuServices(): QueueMenuServices {
  return {
    runAll: runQueueAllCommand,
    runList: runQueueListCommand,
    runStitch: runQueueStitchCommand,
    runSwipe: runQueueSwipeCommand,
  };
}
