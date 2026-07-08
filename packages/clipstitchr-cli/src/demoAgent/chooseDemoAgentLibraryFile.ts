import type { Page } from "playwright";
import { fillLibrarySearchField } from "./fillLibrarySearchField.js";
import { getDemoAgentLibraryCardLocator } from "./getDemoAgentLibraryCardLocator.js";
import { waitForDemoAgentPageToSettleAfterClick } from "./waitForDemoAgentPageToSettleAfterClick.js";

export async function chooseDemoAgentLibraryFile(input: {
  mediaType: string;
  page: Page;
  searchText?: string;
}) {
  if (input.searchText) {
    await fillLibrarySearchField(input.page, input.searchText);
  }

  const cardText = input.searchText ?? input.mediaType;
  const card = getDemoAgentLibraryCardLocator(input.page, cardText);
  const actionButton = card
    .getByRole("button", { name: /add|choose|open|select|use/i })
    .first();

  if ((await actionButton.count()) > 0) {
    await actionButton.click();
  } else {
    await card.click();
  }

  await waitForDemoAgentPageToSettleAfterClick(input.page);
}
