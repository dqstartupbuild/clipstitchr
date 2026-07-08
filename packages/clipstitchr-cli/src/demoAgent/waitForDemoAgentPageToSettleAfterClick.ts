import type { Page } from "playwright";

export async function waitForDemoAgentPageToSettleAfterClick(page: Page) {
  await page
    .waitForLoadState("domcontentloaded", { timeout: 1500 })
    .catch(() => {});
  await page
    .waitForLoadState("networkidle", { timeout: 1500 })
    .catch(() => {});
  await page.waitForTimeout(250);
}
