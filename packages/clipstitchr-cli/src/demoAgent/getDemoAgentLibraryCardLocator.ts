import type { Page } from "playwright";
import { createCaseInsensitiveTextPattern } from "./createCaseInsensitiveTextPattern.js";

export function getDemoAgentLibraryCardLocator(page: Page, text: string) {
  return page
    .locator("article,[role='article'],[role='listitem'],li,[data-card],div")
    .filter({ hasText: createCaseInsensitiveTextPattern(text) })
    .first();
}
