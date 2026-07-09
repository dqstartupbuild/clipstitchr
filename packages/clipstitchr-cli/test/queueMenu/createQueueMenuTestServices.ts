import type { QueueMenuServices } from "../../src/queueMenu/QueueMenuServices.js";

export function createQueueMenuTestServices(calls: string[]) {
  return {
    runAll: async () => {
      calls.push("all");
    },
    runList: async () => {
      calls.push("list");
    },
    runStitch: async (stitchId, options) => {
      calls.push(
        `stitch:${stitchId ?? "latest"}${options.all ? ":all" : ""}`,
      );
    },
    runSwipe: async (swipeId, options) => {
      calls.push(`swipe:${swipeId ?? "latest"}${options.all ? ":all" : ""}`);
    },
  } satisfies QueueMenuServices;
}
