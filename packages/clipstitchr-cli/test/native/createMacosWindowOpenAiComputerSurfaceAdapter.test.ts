import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { createMacosWindowOpenAiComputerSurfaceAdapter } from "../../dist/native/macosWindowHelper/createMacosWindowOpenAiComputerSurfaceAdapter.js";
import { createDemoAgentTestPolicy } from "../demoAgent/createDemoAgentTestPolicy.js";

describe("createMacosWindowOpenAiComputerSurfaceAdapter", () => {
  it("maps OpenAI actions into helper commands and saves screenshots", async () => {
    const calls: Array<[string, unknown]> = [];
    const helper = {
      captureWindow: async () => ({
        base64: Buffer.from("fake-png").toString("base64"),
        height: 200,
        width: 100,
        window: {
          appName: "Simulator",
          bounds: { height: 200, width: 100, x: 10, y: 20 },
          id: 42,
          pid: 123,
          title: "iPhone 16",
        },
      }),
      click: async (input: unknown) => calls.push(["click", input]),
      keypress: async (input: unknown) => calls.push(["keypress", input]),
      scroll: async (input: unknown) => calls.push(["scroll", input]),
      typeText: async (input: unknown) => calls.push(["typeText", input]),
      wait: async (input: unknown) => calls.push(["wait", input]),
    };
    const adapter = createMacosWindowOpenAiComputerSurfaceAdapter({
      helper: helper as never,
      window: {
        appName: "Simulator",
        bounds: { height: 200, width: 100, x: 10, y: 20 },
        id: 42,
        pid: 123,
        title: "iPhone 16",
      },
    });
    const directory = await mkdtemp(join(tmpdir(), "clipstitchr-native-test-"));

    try {
      await adapter.executeAction({
        action: { type: "click", x: 11, y: 22 },
        policy: createDemoAgentTestPolicy(),
      });
      await adapter.executeAction({
        action: { scrollY: 300, type: "scroll", x: 20, y: 30 },
        policy: createDemoAgentTestPolicy(),
      });
      await adapter.executeAction({
        action: { text: "Launch demo", type: "type" },
        policy: createDemoAgentTestPolicy(),
      });
      await adapter.executeAction({
        action: { keys: ["PAGEDOWN"], type: "keypress" },
        policy: createDemoAgentTestPolicy(),
      });
      await adapter.waitForActionToSettle();

      const screenshot = await adapter.captureScreenshot({
        index: 0,
        screenshotsDirectory: directory,
        stepId: "step-1",
      });

      assert.deepEqual(calls, [
        ["click", { button: "left", x: 11, y: 22 }],
        ["scroll", { scrollX: 0, scrollY: 300, x: 20, y: 30 }],
        ["typeText", "Launch demo"],
        ["keypress", ["PAGEDOWN"]],
        ["wait", 500],
      ]);
      assert.equal(
        await readFile(screenshot.filePath, "utf8"),
        "fake-png",
      );
      assert.equal(adapter.getLocation(), "macos-window://42/Simulator%20-%20iPhone%2016");
    } finally {
      await rm(directory, { force: true, recursive: true });
    }
  });
});
