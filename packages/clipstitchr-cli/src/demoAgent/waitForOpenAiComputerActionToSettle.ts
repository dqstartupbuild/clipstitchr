import type { Page } from "playwright";

export async function waitForOpenAiComputerActionToSettle(page: Page) {
  await page.waitForTimeout(250);
  await page.waitForLoadState("networkidle", { timeout: 2000 }).catch(() => {});
}
