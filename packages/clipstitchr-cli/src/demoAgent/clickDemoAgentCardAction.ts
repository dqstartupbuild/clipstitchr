import type { Page } from "playwright";
import { getDemoAgentLibraryCardLocator } from "./getDemoAgentLibraryCardLocator.js";
import { waitForDemoAgentPageToSettleAfterClick } from "./waitForDemoAgentPageToSettleAfterClick.js";

export async function clickDemoAgentCardAction(input: {
  actionName: string;
  cardText: string;
  page: Page;
}) {
  const card = getDemoAgentLibraryCardLocator(input.page, input.cardText);

  await card
    .getByRole("button", { name: input.actionName })
    .first()
    .click();
  await waitForDemoAgentPageToSettleAfterClick(input.page);
}
