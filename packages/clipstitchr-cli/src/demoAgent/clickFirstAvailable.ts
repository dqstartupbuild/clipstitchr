import type { Locator } from "playwright";
import { scrollDemoAgentLocatorIntoRecordedView } from "./scrollDemoAgentLocatorIntoRecordedView.js";

export async function clickFirstAvailable(locators: Locator[]) {
  let lastError: unknown;

  for (const locator of locators) {
    const target = locator.first();

    try {
      await scrollDemoAgentLocatorIntoRecordedView(target);
      await target.click({ timeout: 5000 });

      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("No matching control was clickable.");
}
