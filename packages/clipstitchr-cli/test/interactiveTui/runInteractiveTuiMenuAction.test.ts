import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runInteractiveTuiMenuAction } from "../../dist/interactiveTui/runInteractiveTuiMenuAction.js";
import type { InteractiveShellMenu } from "../../src/interactiveShell/InteractiveShellMenu.js";
import { createInteractiveShellTestPrompts } from "../interactiveShell/createInteractiveShellTestPrompts.js";
import { createInteractiveShellTestServices } from "../interactiveShell/createInteractiveShellTestServices.js";

async function runAction(input: {
  action: string;
  inputs?: string[];
  menu: InteractiveShellMenu;
}) {
  const calls: string[] = [];
  const transition = await runInteractiveTuiMenuAction({
    action: input.action,
    menu: input.menu,
    options: {},
    prompts: createInteractiveShellTestPrompts({ inputs: input.inputs }),
    services: createInteractiveShellTestServices(calls),
  });

  return { calls, transition };
}

describe("runInteractiveTuiMenuAction", () => {
  it("runs every main menu command", async () => {
    const cases = [
      { action: "stitchr-new", call: "stitchr-new::" },
      { action: "swipr-new", call: "swipr-new:" },
      { action: "link", call: "link" },
      { action: "login", call: "login" },
      { action: "status", call: "status" },
      { action: "doctor", call: "doctor" },
      { action: "update", call: "update" },
    ];

    for (const testCase of cases) {
      const result = await runAction({
        action: testCase.action,
        menu: "main",
      });

      assert.deepEqual(result.transition, { menu: "main" }, testCase.action);
      assert.deepEqual(result.calls, [testCase.call], testCase.action);
    }
  });

  it("opens every focused menu from the main menu", async () => {
    for (const menu of [
      "demo",
      "products",
      "queue",
      "native",
      "account",
    ] as const) {
      const result = await runAction({ action: menu, menu: "main" });

      assert.deepEqual(result.transition, { menu }, menu);
      assert.deepEqual(result.calls, [], menu);
    }
  });

  it("runs every demo menu command", async () => {
    const cases = [
      { action: "manual", call: "manual" },
      { action: "agent", call: "agent:Launch guide", inputs: ["Launch guide"] },
      { action: "guide-create", call: "guide-create" },
      { action: "guide-list", call: "guide-list" },
      { action: "guide-show", call: "guide-show:guide-1", inputs: ["guide-1"] },
      { action: "guide-edit", call: "guide-edit:guide-2", inputs: ["guide-2"] },
      {
        action: "guide-delete",
        call: "guide-delete:guide-3",
        inputs: ["guide-3"],
      },
      { action: "policy-init", call: "policy-init" },
      { action: "policy-check", call: "policy-check" },
      { action: "policy-edit", call: "policy-edit" },
      { action: "upload", call: "upload:demo.mp4", inputs: ["demo.mp4"] },
      { action: "logs", call: "logs:run-1", inputs: ["run-1"] },
      { action: "native-setup", call: "native-setup" },
    ];

    for (const testCase of cases) {
      const result = await runAction({
        action: testCase.action,
        inputs: testCase.inputs,
        menu: "demo",
      });

      assert.deepEqual(result.transition, { menu: "demo" }, testCase.action);
      assert.deepEqual(result.calls, [testCase.call], testCase.action);
    }
  });

  it("runs every products menu command", async () => {
    const cases = [
      { action: "list", call: "list" },
      { action: "create", call: "create" },
      { action: "use", call: "use:choose" },
    ];

    for (const testCase of cases) {
      const result = await runAction({
        action: testCase.action,
        menu: "products",
      });

      assert.deepEqual(result.transition, { menu: "products" }, testCase.action);
      assert.deepEqual(result.calls, [testCase.call], testCase.action);
    }
  });

  it("runs every queue menu command", async () => {
    const cases = [
      { action: "list", call: "list" },
      { action: "stitch-latest", call: "stitch:latest" },
      { action: "stitch-all", call: "stitch:latest:all" },
      { action: "swipe-latest", call: "swipe:latest" },
      { action: "swipe-all", call: "swipe:latest:all" },
      { action: "stitch-id", call: "stitch:stitch-1", inputs: ["stitch-1"] },
      { action: "swipe-id", call: "swipe:swipe-1", inputs: ["swipe-1"] },
      { action: "all", call: "all" },
    ];

    for (const testCase of cases) {
      const result = await runAction({
        action: testCase.action,
        inputs: testCase.inputs,
        menu: "queue",
      });

      assert.deepEqual(result.transition, { menu: "queue" }, testCase.action);
      assert.deepEqual(result.calls, [testCase.call], testCase.action);
    }
  });

  it("runs every native menu command", async () => {
    const cases = [
      { action: "native-init", call: "native-init:undefined" },
      { action: "native-check", call: "native-check" },
    ];

    for (const testCase of cases) {
      const result = await runAction({
        action: testCase.action,
        menu: "native",
      });

      assert.deepEqual(result.transition, { menu: "native" }, testCase.action);
      assert.deepEqual(result.calls, [testCase.call], testCase.action);
    }
  });

  it("runs every account menu command", async () => {
    const cases = [
      { action: "link", call: "link" },
      { action: "login", call: "login" },
      { action: "logout", call: "logout" },
      { action: "unlink", call: "unlink" },
      { action: "status", call: "status" },
      { action: "doctor", call: "doctor" },
      { action: "update", call: "update" },
    ];

    for (const testCase of cases) {
      const result = await runAction({
        action: testCase.action,
        menu: "account",
      });

      assert.deepEqual(result.transition, { menu: "account" }, testCase.action);
      assert.deepEqual(result.calls, [testCase.call], testCase.action);
    }

    const nativeResult = await runAction({ action: "native", menu: "account" });
    assert.deepEqual(nativeResult.transition, { menu: "native" });
    assert.deepEqual(nativeResult.calls, []);
  });

  it("handles every shared navigation action", async () => {
    const cases = [
      { action: "nav:back", transition: { menu: "main" } },
      { action: "nav:main", transition: { menu: "main" } },
      { action: "nav:slash", transition: { menu: "queue" } },
      { action: "nav:exit", transition: { exit: true, menu: "queue" } },
    ];

    for (const testCase of cases) {
      const result = await runAction({ action: testCase.action, menu: "queue" });

      assert.deepEqual(result.transition, testCase.transition, testCase.action);
      assert.deepEqual(result.calls, [], testCase.action);
    }
  });

  it("rejects unknown actions instead of running a fallback command", async () => {
    for (const menu of [
      "main",
      "demo",
      "products",
      "queue",
      "native",
      "account",
    ] as const) {
      const calls: string[] = [];

      await assert.rejects(
        runInteractiveTuiMenuAction({
          action: "unknown-action",
          menu,
          options: {},
          prompts: createInteractiveShellTestPrompts({}),
          services: createInteractiveShellTestServices(calls),
        }),
        new RegExp(`Unknown ${menu === "main" ? "main menu" : menu}`),
        menu,
      );
      assert.deepEqual(calls, [], menu);
    }
  });
});
