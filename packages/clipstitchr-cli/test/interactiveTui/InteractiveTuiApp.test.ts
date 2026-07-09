import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "ink-testing-library";
import { createElement } from "react";
import { InteractiveTuiApp } from "../../dist/interactiveTui/InteractiveTuiApp.js";
import { createInteractiveShellTestPrompts } from "../interactiveShell/createInteractiveShellTestPrompts.js";
import { createInteractiveShellTestServices } from "../interactiveShell/createInteractiveShellTestServices.js";
import { waitForTuiUpdate } from "./waitForTuiUpdate.js";

describe("InteractiveTuiApp", () => {
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
    assert.match(tui.lastFrame() ?? "", /Press \/ to type a command/);
    tui.unmount();
  });

  it("runs slash commands and returns to the same workspace", async () => {
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
    assert.match(tui.lastFrame() ?? "", /Press \/ to type a command/);
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
});
