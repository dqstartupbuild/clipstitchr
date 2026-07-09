import type { Page } from "playwright";
import { assertDemoAgentTextAllowed } from "./assertDemoAgentTextAllowed.js";
import type { DemoAgentPolicy } from "./DemoAgentPolicy.js";
import type { OpenAiComputerAction } from "./OpenAiComputerAction.js";
import { normalizeOpenAiComputerDragPath } from "./normalizeOpenAiComputerDragPath.js";
import { normalizeOpenAiComputerMouseButton } from "./normalizeOpenAiComputerMouseButton.js";
import { pressOpenAiComputerKey } from "./pressOpenAiComputerKey.js";
import { withOpenAiComputerModifierKeys } from "./withOpenAiComputerModifierKeys.js";

export async function executeOpenAiComputerAction(input: {
  action: OpenAiComputerAction;
  page: Page;
  policy: DemoAgentPolicy;
}) {
  switch (input.action.type) {
    case "click": {
      const action = input.action;

      await withOpenAiComputerModifierKeys(
        input.page,
        action.keys,
        async () => {
          await input.page.mouse.click(action.x, action.y, {
            button: normalizeOpenAiComputerMouseButton(action.button),
          });
        },
      );
      break;
    }
    case "double_click": {
      const action = input.action;

      await withOpenAiComputerModifierKeys(
        input.page,
        action.keys,
        async () => {
          await input.page.mouse.click(action.x, action.y, {
            button: normalizeOpenAiComputerMouseButton(action.button),
            clickCount: 2,
          });
        },
      );
      break;
    }
    case "drag": {
      const path = normalizeOpenAiComputerDragPath(input.action.path);

      if (path.length < 2) {
        throw new Error("OpenAI Computer Use returned a drag without a path.");
      }

      await withOpenAiComputerModifierKeys(
        input.page,
        input.action.keys,
        async () => {
          const [startPoint, ...remainingPoints] = path;

          await input.page.mouse.move(startPoint.x, startPoint.y);
          await input.page.mouse.down();

          for (const point of remainingPoints) {
            await input.page.mouse.move(point.x, point.y);
          }

          await input.page.mouse.up();
        },
      );
      break;
    }
    case "keypress":
      for (const key of input.action.keys) {
        await pressOpenAiComputerKey(input.page, key);
      }
      break;
    case "move": {
      const action = input.action;

      await withOpenAiComputerModifierKeys(
        input.page,
        action.keys,
        async () => {
          await input.page.mouse.move(action.x, action.y);
        },
      );
      break;
    }
    case "screenshot":
      break;
    case "scroll": {
      const action = input.action;

      await withOpenAiComputerModifierKeys(
        input.page,
        action.keys,
        async () => {
          await input.page.mouse.move(action.x, action.y);
          await input.page.mouse.wheel(
            action.scrollX ?? 0,
            action.scrollY ?? 0,
          );
        },
      );
      break;
    }
    case "type":
      assertDemoAgentTextAllowed(input.policy, input.action.text);
      await input.page.keyboard.type(input.action.text);
      break;
    case "wait":
      await input.page.waitForTimeout(2000);
      break;
    default:
      throw new Error(
        `Unsupported OpenAI Computer Use action: ${String((input.action as { type?: unknown }).type)}`,
      );
  }
}
