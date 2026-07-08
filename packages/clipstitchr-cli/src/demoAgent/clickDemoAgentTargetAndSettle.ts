import type { Page } from "playwright";
import { clickDemoAgentLocatorAndSettle } from "./clickDemoAgentLocatorAndSettle.js";
import type { DemoAgentClickTarget } from "./DemoAgentClickTarget.js";
import { getDemoAgentFallbackLocatorForClickTarget } from "./getDemoAgentFallbackLocatorForClickTarget.js";
import { getDemoAgentLocatorForClickTarget } from "./getDemoAgentLocatorForClickTarget.js";

export async function clickDemoAgentTargetAndSettle(
  page: Page,
  target: DemoAgentClickTarget,
) {
  const locator = getDemoAgentLocatorForClickTarget(page, target);
  const fallbackLocator = getDemoAgentFallbackLocatorForClickTarget(
    page,
    target,
  );

  if (fallbackLocator && (await fallbackLocator.count()) > 0) {
    await clickDemoAgentLocatorAndSettle(page, fallbackLocator);

    return;
  }

  try {
    await clickDemoAgentLocatorAndSettle(page, locator);
  } catch (error) {
    if (!fallbackLocator) {
      throw error;
    }

    await clickDemoAgentLocatorAndSettle(page, fallbackLocator);
  }
}
