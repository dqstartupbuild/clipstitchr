import type { Page } from "playwright";
import { clickDemoAgentLocatorAndSettle } from "./clickDemoAgentLocatorAndSettle.js";
import { fillLibrarySearchField } from "./fillLibrarySearchField.js";
import { getDemoAgentLibraryCardLocator } from "./getDemoAgentLibraryCardLocator.js";
import { scrollDemoAgentLocatorIntoRecordedView } from "./scrollDemoAgentLocatorIntoRecordedView.js";

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

  await scrollDemoAgentLocatorIntoRecordedView(card);

  if ((await actionButton.count()) > 0) {
    await clickDemoAgentLocatorAndSettle(input.page, actionButton);
  } else {
    await clickDemoAgentLocatorAndSettle(input.page, card);
  }
}
