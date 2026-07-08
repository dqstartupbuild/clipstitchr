import type { Locator, Page } from "playwright";
import { scrollDemoAgentLocatorIntoRecordedView } from "./scrollDemoAgentLocatorIntoRecordedView.js";
import { waitForDemoAgentPageToSettleAfterClick } from "./waitForDemoAgentPageToSettleAfterClick.js";

export async function clickDemoAgentLocatorAndSettle(
  page: Page,
  locator: Locator,
) {
  const target = locator.first();

  await scrollDemoAgentLocatorIntoRecordedView(target);
  await target.click();
  await waitForDemoAgentPageToSettleAfterClick(page);
}
