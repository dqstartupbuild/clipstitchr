import type { Page } from "playwright";
import { scrollDemoAgentLocatorIntoRecordedView } from "./scrollDemoAgentLocatorIntoRecordedView.js";

export async function fillLibrarySearchField(page: Page, searchText: string) {
  const searchFields = [
    page.getByRole("searchbox").first(),
    page.getByRole("textbox", { name: /search/i }).first(),
    page.getByPlaceholder(/search/i).first(),
    page.locator("input[type='search']").first(),
  ];

  for (const searchField of searchFields) {
    try {
      await scrollDemoAgentLocatorIntoRecordedView(searchField);
      await searchField.fill(searchText, { timeout: 2000 });

      return;
    } catch {}
  }
}
