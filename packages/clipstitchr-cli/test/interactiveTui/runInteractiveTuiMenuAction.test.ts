import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runInteractiveTuiMenuAction } from "../../dist/interactiveTui/runInteractiveTuiMenuAction.js";
import { createInteractiveShellTestPrompts } from "../interactiveShell/createInteractiveShellTestPrompts.js";
import { createInteractiveShellTestServices } from "../interactiveShell/createInteractiveShellTestServices.js";

describe("runInteractiveTuiMenuAction", () => {
  it("runs a menu action without creating a replacement shell", async () => {
    const calls: string[] = [];
    const transition = await runInteractiveTuiMenuAction({
      action: "status",
      menu: "main",
      options: {},
      prompts: createInteractiveShellTestPrompts({}),
      services: createInteractiveShellTestServices(calls),
    });

    assert.deepEqual(transition, { menu: "main" });
    assert.deepEqual(calls, ["status"]);
  });

  it("keeps focused menu actions in their current menu", async () => {
    const calls: string[] = [];
    const transition = await runInteractiveTuiMenuAction({
      action: "list",
      menu: "queue",
      options: {},
      prompts: createInteractiveShellTestPrompts({}),
      services: createInteractiveShellTestServices(calls),
    });

    assert.deepEqual(transition, { menu: "queue" });
    assert.deepEqual(calls, ["list"]);
  });
});
