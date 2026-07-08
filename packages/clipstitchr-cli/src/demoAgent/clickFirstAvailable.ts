import type { Locator } from "playwright";

export async function clickFirstAvailable(locators: Locator[]) {
  let lastError: unknown;

  for (const locator of locators) {
    try {
      await locator.first().click({ timeout: 5000 });

      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("No matching control was clickable.");
}
