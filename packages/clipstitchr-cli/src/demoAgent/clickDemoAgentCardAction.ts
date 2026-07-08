import type { Page } from "playwright";
import { clickDemoAgentLocatorAndSettle } from "./clickDemoAgentLocatorAndSettle.js";
import { getDemoAgentLibraryCardLocator } from "./getDemoAgentLibraryCardLocator.js";
import { scrollDemoAgentLocatorIntoRecordedView } from "./scrollDemoAgentLocatorIntoRecordedView.js";

export async function clickDemoAgentCardAction(input: {
  actionName: string;
  cardText: string;
  page: Page;
}) {
  const card = getDemoAgentLibraryCardLocator(input.page, input.cardText);
  const button = card
    .getByRole("button", { name: input.actionName })
    .first();
  const checkbox = card.getByRole("checkbox").first();
  const isSelectionAction = /^(select|deselect)\b/i.test(input.actionName);

  await scrollDemoAgentLocatorIntoRecordedView(card);

  if (isSelectionAction && (await checkbox.count()) > 0) {
    await clickDemoAgentLocatorAndSettle(input.page, checkbox);

    return;
  }

  try {
    await clickDemoAgentLocatorAndSettle(input.page, button);
  } catch (error) {
    if (!isSelectionAction) {
      throw error;
    }

    await clickDemoAgentLocatorAndSettle(input.page, checkbox);
  }
}
