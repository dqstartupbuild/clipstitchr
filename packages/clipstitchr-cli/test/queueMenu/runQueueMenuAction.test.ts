import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runQueueMenuAction } from "../../dist/queueMenu/runQueueMenuAction.js";
import { createQueueMenuTestServices } from "./createQueueMenuTestServices.js";

describe("runQueueMenuAction", () => {
  it("routes latest and all queue actions", async () => {
    const calls: string[] = [];
    const services = createQueueMenuTestServices(calls);

    await runQueueMenuAction({
      action: "stitch-latest",
      options: {},
      readText: async () => "",
      services,
    });
    await runQueueMenuAction({
      action: "stitch-all",
      options: {},
      readText: async () => "",
      services,
    });
    await runQueueMenuAction({
      action: "swipe-latest",
      options: {},
      readText: async () => "",
      services,
    });
    await runQueueMenuAction({
      action: "swipe-all",
      options: {},
      readText: async () => "",
      services,
    });
    await runQueueMenuAction({
      action: "all",
      options: {},
      readText: async () => "",
      services,
    });

    assert.deepEqual(calls, [
      "stitch:latest",
      "stitch:latest:all",
      "swipe:latest",
      "swipe:latest:all",
      "all",
    ]);
  });

  it("prompts for specific content IDs", async () => {
    const calls: string[] = [];
    const services = createQueueMenuTestServices(calls);

    await runQueueMenuAction({
      action: "stitch-id",
      options: {},
      readText: async () => "stitch_123",
      services,
    });
    await runQueueMenuAction({
      action: "swipe-id",
      options: {},
      readText: async () => "swipe_123",
      services,
    });

    assert.deepEqual(calls, ["stitch:stitch_123", "swipe:swipe_123"]);
  });

  it("routes upcoming queue listing", async () => {
    const calls: string[] = [];

    await runQueueMenuAction({
      action: "list",
      options: {},
      readText: async () => "",
      services: createQueueMenuTestServices(calls),
    });

    assert.deepEqual(calls, ["list"]);
  });
});
