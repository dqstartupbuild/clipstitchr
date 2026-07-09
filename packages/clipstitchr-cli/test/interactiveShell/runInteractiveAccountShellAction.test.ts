import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runInteractiveAccountShellAction } from "../../dist/interactiveShell/runInteractiveAccountShellAction.js";
import { createInteractiveShellTestPrompts } from "./createInteractiveShellTestPrompts.js";
import { createInteractiveShellTestServices } from "./createInteractiveShellTestServices.js";

describe("runInteractiveAccountShellAction", () => {
  it("opens native tools from setup and account", async () => {
    const transition = await runInteractiveAccountShellAction({
      action: "native",
      options: {},
      prompts: createInteractiveShellTestPrompts({}),
      services: createInteractiveShellTestServices([]),
    });

    assert.deepEqual(transition, { menu: "native" });
  });

  it("runs maintenance actions from setup and account", async () => {
    const calls: string[] = [];
    const transition = await runInteractiveAccountShellAction({
      action: "doctor",
      options: {},
      prompts: createInteractiveShellTestPrompts({}),
      services: createInteractiveShellTestServices(calls),
    });

    assert.equal(transition.menu, "account");
    assert.deepEqual(calls, ["doctor"]);
  });
});
