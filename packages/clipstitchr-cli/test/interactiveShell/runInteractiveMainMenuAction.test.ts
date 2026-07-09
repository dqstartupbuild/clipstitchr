import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runInteractiveMainMenuAction } from "../../dist/interactiveShell/runInteractiveMainMenuAction.js";
import { createInteractiveShellTestPrompts } from "./createInteractiveShellTestPrompts.js";
import { createInteractiveShellTestServices } from "./createInteractiveShellTestServices.js";

describe("runInteractiveMainMenuAction", () => {
  it("routes primary groups to submenus", async () => {
    const result = await runInteractiveMainMenuAction({
      action: "demo",
      options: {},
      prompts: createInteractiveShellTestPrompts({}),
      services: createInteractiveShellTestServices([]),
    });

    assert.deepEqual(result, { menu: "demo" });
  });

  it("runs main menu commands and returns home", async () => {
    const calls: string[] = [];
    const result = await runInteractiveMainMenuAction({
      action: "stitchr-new",
      options: {},
      prompts: createInteractiveShellTestPrompts({}),
      services: createInteractiveShellTestServices(calls),
    });

    assert.deepEqual(result, {
      menu: "main",
      notice: {
        kind: "success",
        message: "Pick another action when you are ready.",
      },
    });
    assert.deepEqual(calls, ["stitchr-new::"]);
  });

  it("runs slash commands from the main menu", async () => {
    const result = await runInteractiveMainMenuAction({
      action: "nav:slash",
      options: {},
      prompts: createInteractiveShellTestPrompts({ inputs: ["/products"] }),
      services: createInteractiveShellTestServices([]),
    });

    assert.deepEqual(result, {
      menu: "products",
      notice: {
        kind: "success",
        message: "Pick another action when you are ready.",
      },
    });
  });
});
