import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { assertDemoAgentTextAllowed } from "../../demoAgent/assertDemoAgentTextAllowed.js";
import type { DemoAgentPolicy } from "../../demoAgent/DemoAgentPolicy.js";
import type { OpenAiComputerAction } from "../../demoAgent/OpenAiComputerAction.js";
import type { OpenAiComputerSurfaceAdapter } from "../../demoAgent/OpenAiComputerSurfaceAdapter.js";
import { normalizeOpenAiComputerDragPath } from "../../demoAgent/normalizeOpenAiComputerDragPath.js";
import { normalizeOpenAiComputerMouseButton } from "../../demoAgent/normalizeOpenAiComputerMouseButton.js";
import { formatMacosWindowLabel } from "./formatMacosWindowLabel.js";
import type { MacosWindowHelperClient } from "./MacosWindowHelperClient.js";
import type { MacosWindowInfo } from "./MacosWindowInfo.js";

export function createMacosWindowOpenAiComputerSurfaceAdapter(input: {
  helper: MacosWindowHelperClient;
  window: MacosWindowInfo;
}): OpenAiComputerSurfaceAdapter {
  let selectedWindow = input.window;

  return {
    captureScreenshot: async (screenshotInput) => {
      const screenshot = await input.helper.captureWindow();
      const buffer = Buffer.from(screenshot.base64, "base64");
      const fileName = `${String(screenshotInput.index + 1).padStart(3, "0")}-${screenshotInput.stepId ?? "window"}-openai-computer.png`;
      const filePath = join(screenshotInput.screenshotsDirectory, fileName);

      selectedWindow = screenshot.window;
      await writeFile(filePath, buffer);

      return {
        base64: screenshot.base64,
        fileName,
        filePath,
        fingerprint: createHash("sha256").update(buffer).digest("hex"),
      };
    },
    executeAction: async ({ action, policy }) => {
      await executeMacosWindowAction({
        action,
        helper: input.helper,
        policy,
      });
    },
    getLocation: () =>
      `macos-window://${selectedWindow.id}/${encodeURIComponent(formatMacosWindowLabel(selectedWindow))}`,
    validateState: async () => ({ ok: true }),
    waitForActionToSettle: async () => {
      await input.helper.wait(500);
    },
  };
}

async function executeMacosWindowAction(input: {
  action: OpenAiComputerAction;
  helper: MacosWindowHelperClient;
  policy: DemoAgentPolicy;
}) {
  switch (input.action.type) {
    case "click":
      await input.helper.click({
        button: normalizeOpenAiComputerMouseButton(input.action.button),
        x: input.action.x,
        y: input.action.y,
      });
      break;
    case "double_click":
      await input.helper.doubleClick({
        button: normalizeOpenAiComputerMouseButton(input.action.button),
        x: input.action.x,
        y: input.action.y,
      });
      break;
    case "drag":
      await input.helper.drag(normalizeOpenAiComputerDragPath(input.action.path));
      break;
    case "keypress":
      await input.helper.keypress(input.action.keys);
      break;
    case "move":
      await input.helper.move({
        x: input.action.x,
        y: input.action.y,
      });
      break;
    case "screenshot":
      break;
    case "scroll":
      await input.helper.scroll({
        scrollX: input.action.scrollX ?? 0,
        scrollY: input.action.scrollY ?? 0,
        x: input.action.x,
        y: input.action.y,
      });
      break;
    case "type":
      assertDemoAgentTextAllowed(input.policy, input.action.text);
      await input.helper.typeText(input.action.text);
      break;
    case "wait":
      await input.helper.wait(2000);
      break;
    default:
      throw new Error(
        `Unsupported OpenAI Computer Use action: ${String((input.action as { type?: unknown }).type)}`,
      );
  }
}
