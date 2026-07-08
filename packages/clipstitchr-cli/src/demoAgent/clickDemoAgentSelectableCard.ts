import type { Page } from "playwright";
import { getDemoAgentLibraryCardLocator } from "./getDemoAgentLibraryCardLocator.js";
import { scrollDemoAgentLocatorIntoRecordedView } from "./scrollDemoAgentLocatorIntoRecordedView.js";
import { waitForDemoAgentPageToSettleAfterClick } from "./waitForDemoAgentPageToSettleAfterClick.js";

export async function clickDemoAgentSelectableCard(input: {
  cardText: string;
  checked: boolean;
  page: Page;
}) {
  const card = getDemoAgentLibraryCardLocator(input.page, input.cardText);
  const checkbox = card.getByRole("checkbox").first();

  await scrollDemoAgentLocatorIntoRecordedView(card);

  if ((await checkbox.count()) > 0) {
    const ariaChecked = await checkbox.getAttribute("aria-checked");
    const isChecked =
      ariaChecked === null ? await checkbox.isChecked() : ariaChecked === "true";

    if (isChecked !== input.checked) {
      await scrollDemoAgentLocatorIntoRecordedView(checkbox);
      await checkbox.click();
      await waitForDemoAgentPageToSettleAfterClick(input.page);
    }

    return;
  }

  const fallbackAction = card
    .getByRole("button", {
      name: input.checked ? /add|choose|select|use/i : /deselect|remove/i,
    })
    .first();

  await scrollDemoAgentLocatorIntoRecordedView(fallbackAction);
  await fallbackAction.click();
  await waitForDemoAgentPageToSettleAfterClick(input.page);
}
