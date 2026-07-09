import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runDemoCreationMode } from "../../dist/interactive/runDemoCreationMode.js";
import { createDemoMenuTestServices } from "../demoMenu/createDemoMenuTestServices.js";

describe("runDemoCreationMode", () => {
  it("routes manual recording", async () => {
    const calls: string[] = [];

    await runDemoCreationMode({
      mode: "manual",
      options: {},
      readText: async () => "",
      services: createDemoMenuTestServices(calls),
    });

    assert.deepEqual(calls, ["manual"]);
  });

  it("routes AI recording with a guide reference", async () => {
    const calls: string[] = [];

    await runDemoCreationMode({
      mode: "agent",
      options: {},
      readText: async () => "Checkout flow",
      services: createDemoMenuTestServices(calls),
    });

    assert.deepEqual(calls, ["agent:Checkout flow"]);
  });
});
