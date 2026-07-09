import { describe, it } from "node:test";
import { runInteractiveShell } from "../../dist/interactiveShell/runInteractiveShell.js";
import { createInteractiveShellTestPrompts } from "./createInteractiveShellTestPrompts.js";
import { createInteractiveShellTestServices } from "./createInteractiveShellTestServices.js";

describe("runInteractiveShell", () => {
  it("exits cleanly from the main menu", async () => {
    await runInteractiveShell({
      options: {},
      prompts: createInteractiveShellTestPrompts({ selections: ["nav:exit"] }),
      services: createInteractiveShellTestServices([]),
    });
  });
});
