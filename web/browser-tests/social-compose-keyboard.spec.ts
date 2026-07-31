import { expect, test } from "@playwright/test";
import { openSocialPublishingAcceptancePage } from "./openSocialPublishingAcceptancePage";

test("supports the compose workflow and focus trap from the keyboard", async ({
  page,
}) => {
  await openSocialPublishingAcceptancePage(page);

  const openButton = page.getByRole("button", {
    name: "Open compose workflow",
  });
  await openButton.focus();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("dialog", {
    name: "Review and schedule a post",
  });
  const closeButton = page.getByRole("button", {
    name: "Close post dialog",
  });
  await expect(dialog).toBeVisible();
  await expect(closeButton).toBeFocused();

  await page.keyboard.press("Shift+Tab");
  await expect
    .poll(() =>
      page.evaluate(() => {
        const activeElement = document.activeElement;
        const activeDialog = activeElement?.closest('[role="dialog"]');

        return Boolean(activeElement && activeDialog);
      }),
    )
    .toBe(true);

  const tiktokAccount = page.getByRole("checkbox", {
    name: /ClipStitchr Creator/,
  });
  await tiktokAccount.focus();
  await page.keyboard.press("Space");
  await expect(tiktokAccount).toBeChecked();

  const privacySelect = page.getByRole("combobox", {
    name: "Who can watch",
  });
  await privacySelect.focus();
  await page.keyboard.type("public");
  await expect(privacySelect).toHaveValue("PUBLIC_TO_EVERYONE");

  const aiDisclosure = page.getByRole("checkbox", {
    name: /generated or significantly edited with AI/,
  });
  await aiDisclosure.focus();
  await page.keyboard.press("Space");
  await expect(aiDisclosure).toBeChecked();

  const chooseTime = page.getByRole("radio", { name: "Choose a time" });
  await chooseTime.focus();
  await page.keyboard.press("Space");
  await expect(chooseTime).toBeChecked();

  const scheduleInput = page.getByLabel("Local date and time");
  await scheduleInput.focus();
  await page.keyboard.type("081520261030AM");

  const consent = page.getByRole("checkbox", {
    name: /I reviewed the accounts, media, caption, visibility/,
  });
  await consent.focus();
  await page.keyboard.press("Space");
  await expect(consent).toBeChecked();

  await closeButton.focus();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(openButton).toBeFocused();
});
