import type { Page } from "playwright";
import type { DemoAgentClickTarget } from "./DemoAgentClickTarget.js";
import { getDemoAgentLocatorForClickTarget } from "./getDemoAgentLocatorForClickTarget.js";
import { waitForDemoAgentPageToSettleAfterClick } from "./waitForDemoAgentPageToSettleAfterClick.js";

export async function clickDemoAgentTargetAndSettle(
  page: Page,
  target: DemoAgentClickTarget,
) {
  await getDemoAgentLocatorForClickTarget(page, target).click();
  await waitForDemoAgentPageToSettleAfterClick(page);
}
