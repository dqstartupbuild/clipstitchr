import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runInteractiveShellActionWithRecovery } from "../../dist/interactiveShell/runInteractiveShellActionWithRecovery.js";
import { createInteractiveShellTestPrompts } from "./createInteractiveShellTestPrompts.js";

describe("runInteractiveShellActionWithRecovery", () => {
  it("can retry after a failed action", async () => {
    let attempts = 0;
    const result = await runInteractiveShellActionWithRecovery({
      backMenu: "main",
      currentMenu: "demo",
      prompts: createInteractiveShellTestPrompts({ selections: ["retry"] }),
      run: async () => {
        attempts += 1;

        if (attempts === 1) {
          throw new Error("No demo yet.");
        }

        return { menu: "demo" };
      },
    });

    assert.equal(attempts, 2);
    assert.deepEqual(result, {
      menu: "demo",
      notice: {
        kind: "success",
        message: "Pick another action when you are ready.",
      },
    });
  });

  it("can return to the main menu after a failed action", async () => {
    const result = await runInteractiveShellActionWithRecovery({
      backMenu: "main",
      currentMenu: "queue",
      prompts: createInteractiveShellTestPrompts({ selections: ["main"] }),
      run: async () => {
        throw new Error("Queue is empty.");
      },
    });

    assert.deepEqual(result, {
      menu: "main",
      notice: {
        kind: "error",
        message: "Queue is empty.",
      },
    });
  });
});
