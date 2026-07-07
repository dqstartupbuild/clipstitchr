import type { Page } from "playwright";
import type { DemoAgentValidatedAction } from "./DemoAgentValidatedAction.js";
import { getDemoAgentLocatorForClickTarget } from "./getDemoAgentLocatorForClickTarget.js";

export async function executeDemoAgentAction(input: {
  action: DemoAgentValidatedAction;
  page: Page;
}) {
  switch (input.action.type) {
    case "click":
      await getDemoAgentLocatorForClickTarget(
        input.page,
        input.action.target,
      ).click();
      break;
    case "finishStep":
    case "screenshot":
    case "stop":
      break;
    case "navigate":
      await input.page.goto(input.action.resolvedUrl ?? input.action.path, {
        waitUntil: "domcontentloaded",
      });
      await input.page
        .waitForLoadState("networkidle", { timeout: 5000 })
        .catch(() => {});
      break;
    case "type":
      await input.page
        .getByLabel(input.action.target.label)
        .fill(input.action.resolvedValue ?? "");
      break;
    case "uploadFile":
      if (input.action.target.label) {
        await input.page
          .getByLabel(input.action.target.label)
          .setInputFiles(input.action.resolvedFilePath ?? "");
      } else {
        await input.page
          .locator("input[type='file']")
          .first()
          .setInputFiles(input.action.resolvedFilePath ?? "");
      }
      break;
    case "waitFor":
      if (input.action.visibleText) {
        await input.page
          .getByText(input.action.visibleText, { exact: false })
          .first()
          .waitFor({
            state: "visible",
            timeout: input.action.timeoutMs,
          });
      } else if (input.action.resolvedUrl) {
        await input.page.waitForURL(input.action.resolvedUrl, {
          timeout: input.action.timeoutMs,
        });
      } else {
        await input.page
          .waitForLoadState("networkidle", {
            timeout: input.action.timeoutMs,
          })
          .catch(() => {});
      }
      break;
  }
}
