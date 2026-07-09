import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runDemoMenuAction } from "../../dist/demoMenu/runDemoMenuAction.js";
import { createDemoMenuTestServices } from "./createDemoMenuTestServices.js";

describe("runDemoMenuAction", () => {
  it("routes manual recording directly", async () => {
    const calls: string[] = [];

    await runDemoMenuAction({
      action: "manual",
      options: {},
      readText: async () => "",
      services: createDemoMenuTestServices(calls),
    });

    assert.deepEqual(calls, ["manual"]);
  });

  it("prompts for a guide before automated recording", async () => {
    const calls: string[] = [];

    await runDemoMenuAction({
      action: "agent",
      options: {},
      readText: async () => "Checkout flow",
      services: createDemoMenuTestServices(calls),
    });

    assert.deepEqual(calls, ["agent:Checkout flow"]);
  });

  it("can start automated recording without an existing guide", async () => {
    const calls: string[] = [];

    await runDemoMenuAction({
      action: "agent",
      options: {},
      readText: async () => "",
      services: createDemoMenuTestServices(calls),
    });

    assert.deepEqual(calls, ["agent:new"]);
  });

  it("prompts for run IDs before showing logs", async () => {
    const calls: string[] = [];

    await runDemoMenuAction({
      action: "logs",
      options: {},
      readText: async () => "agent_run_123",
      services: createDemoMenuTestServices(calls),
    });

    assert.deepEqual(calls, ["logs:agent_run_123"]);
  });
});
