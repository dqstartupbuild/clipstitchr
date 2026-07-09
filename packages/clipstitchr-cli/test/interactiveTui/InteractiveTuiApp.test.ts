import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "ink-testing-library";
import { createElement } from "react";
import { InteractiveTuiApp } from "../../dist/interactiveTui/InteractiveTuiApp.js";
import { createInteractiveShellTestPrompts } from "../interactiveShell/createInteractiveShellTestPrompts.js";
import { createInteractiveShellTestServices } from "../interactiveShell/createInteractiveShellTestServices.js";
import { waitForTuiUpdate } from "./waitForTuiUpdate.js";

describe("InteractiveTuiApp", { concurrency: false }, () => {
  it("navigates menus without unmounting the workspace", async () => {
    const tui = render(
      createElement(InteractiveTuiApp, {
        options: {},
        prompts: createInteractiveShellTestPrompts({}),
        services: createInteractiveShellTestServices([]),
      }),
    );

    assert.match(tui.lastFrame() ?? "", /ClipStitchr/);
    assert.match(tui.lastFrame() ?? "", /Demos/);

    tui.stdin.write("\r");
    await waitForTuiUpdate();

    assert.match(tui.lastFrame() ?? "", /Record it myself/);
    assert.match(tui.lastFrame() ?? "", /\/ command/);
    tui.unmount();
  });

  it("keeps slash command results open until the user goes back", async () => {
    const calls: string[] = [];
    const tui = render(
      createElement(InteractiveTuiApp, {
        options: {},
        prompts: createInteractiveShellTestPrompts({}),
        services: createInteractiveShellTestServices(calls),
      }),
    );

    tui.stdin.write("/status");
    await waitForTuiUpdate();

    assert.match(tui.lastFrame() ?? "", /\/status/);

    tui.stdin.write("\r");
    await waitForTuiUpdate();

    assert.deepEqual(calls, ["status"]);
    assert.match(tui.lastFrame() ?? "", /ClipStitchr/);
    assert.match(tui.lastFrame() ?? "", /Finished \/status\./);
    assert.match(tui.lastFrame() ?? "", /Back to Main menu/);
    assert.doesNotMatch(tui.lastFrame() ?? "", /Demos/);

    tui.stdin.write("\r");
    await waitForTuiUpdate();

    assert.match(tui.lastFrame() ?? "", /Demos/);
    assert.match(tui.lastFrame() ?? "", /\/ command/);
    tui.unmount();
  });

  it("keeps action output visible with result controls", async () => {
    const calls: string[] = [];
    const services = createInteractiveShellTestServices(calls);
    services.products.runList = async () => {
      calls.push("list");
      console.log("product_123\tClipStitchr");
    };
    const tui = render(
      createElement(InteractiveTuiApp, {
        initialMenu: "products",
        options: {},
        prompts: createInteractiveShellTestPrompts({}),
        services,
      }),
    );

    tui.stdin.write("\r");
    await waitForTuiUpdate();

    assert.deepEqual(calls, ["list"]);
    assert.match(tui.lastFrame() ?? "", /product_123\s+ClipStitchr/);
    assert.match(tui.lastFrame() ?? "", /> Back to Products/);
    assert.match(tui.lastFrame() ?? "", /Type a slash command/);
    assert.doesNotMatch(tui.lastFrame() ?? "", /Create a product/);

    tui.stdin.write("\r");
    await waitForTuiUpdate();

    assert.match(tui.lastFrame() ?? "", /Create a product/);
    tui.unmount();
  });

  it("keeps partial output and errors in the result view", async () => {
    const services = createInteractiveShellTestServices([]);
    services.runStatus = async () => {
      console.log("Checked local settings");
      throw new Error("Account check failed");
    };
    const tui = render(
      createElement(InteractiveTuiApp, {
        options: {},
        prompts: createInteractiveShellTestPrompts({}),
        services,
      }),
    );

    tui.stdin.write("/status");
    await waitForTuiUpdate();
    tui.stdin.write("\r");
    await waitForTuiUpdate();

    assert.match(tui.lastFrame() ?? "", /Checked local settings/);
    assert.match(tui.lastFrame() ?? "", /\[error\] Account check failed/);
    assert.match(tui.lastFrame() ?? "", /Back to Main menu/);
    tui.unmount();
  });

  it("completes deterministic command suggestions with Tab", async () => {
    const tui = render(
      createElement(InteractiveTuiApp, {
        options: {},
        prompts: createInteractiveShellTestPrompts({}),
        services: createInteractiveShellTestServices([]),
      }),
    );

    tui.stdin.write("/que");
    await waitForTuiUpdate();
    tui.stdin.write("\t");
    await waitForTuiUpdate();

    assert.match(tui.lastFrame() ?? "", /\/queue/);
    tui.unmount();
  });

  it("runs a nested command found from its meaningful tokens", async () => {
    const calls: string[] = [];
    const tui = render(
      createElement(InteractiveTuiApp, {
        options: {},
        prompts: createInteractiveShellTestPrompts({}),
        services: createInteractiveShellTestServices(calls),
      }),
    );

    tui.stdin.write("/policy edit");
    await waitForTuiUpdate();
    assert.match(tui.lastFrame() ?? "", /\/demo policy edit/);

    tui.stdin.write("\r");
    await waitForTuiUpdate();

    assert.deepEqual(calls, ["policy-edit"]);
    assert.match(tui.lastFrame() ?? "", /Finished \/demo policy edit\./);
    tui.unmount();
  });

  it("refreshes local context after setup actions", async () => {
    const calls: string[] = [];
    const tui = render(
      createElement(InteractiveTuiApp, {
        context: {
          isAccountConnected: false,
          isRepoLinked: false,
        },
        options: {},
        prompts: createInteractiveShellTestPrompts({}),
        readContext: async () => ({
          isAccountConnected: true,
          isRepoLinked: false,
        }),
        services: createInteractiveShellTestServices(calls),
      }),
    );

    assert.match(tui.lastFrame() ?? "", /Connect my account/);
    assert.match(tui.lastFrame() ?? "", /Account: not connected/);

    tui.stdin.write("\r");
    await waitForTuiUpdate();

    assert.deepEqual(calls, ["login"]);
    assert.match(tui.lastFrame() ?? "", /Account: connected/);
    assert.match(tui.lastFrame() ?? "", /Back to Main menu/);

    tui.stdin.write("\r");
    await waitForTuiUpdate();

    assert.match(tui.lastFrame() ?? "", /> Set up this repo/);
    tui.unmount();
  });

  it("gives prompt-backed actions a clean terminal handoff", async () => {
    let finishAction: (() => void) | undefined;
    const action = new Promise<void>((resolve) => {
      finishAction = resolve;
    });
    const services = createInteractiveShellTestServices([]);
    services.runStatus = async () => await action;
    const tui = render(
      createElement(InteractiveTuiApp, {
        options: {},
        prompts: createInteractiveShellTestPrompts({}),
        services,
      }),
    );

    tui.stdin.write("/status");
    await waitForTuiUpdate();
    tui.stdin.write("\r");
    await waitForTuiUpdate();

    assert.match(tui.lastFrame() ?? "", /\[working\] \/status/);
    assert.match(tui.lastFrame() ?? "", /Complete any question below/);
    assert.match(tui.lastFrame() ?? "", /ClipStitchr Interactive/);
    assert.doesNotMatch(tui.lastFrame() ?? "", /Action in progress/);

    finishAction?.();
    await waitForTuiUpdate();
    assert.match(tui.lastFrame() ?? "", /ClipStitchr/);
    assert.match(tui.lastFrame() ?? "", /Back to Main menu/);
    tui.unmount();
  });
});
