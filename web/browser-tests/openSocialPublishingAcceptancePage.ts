import { expect, type Page } from "@playwright/test";

export async function openSocialPublishingAcceptancePage(page: Page) {
  await page.goto("/browser-tests/social-publishing");

  const essentialsOnlyButton = page.getByRole("button", {
    name: "Essentials only",
  });

  if (await essentialsOnlyButton.isVisible()) {
    await essentialsOnlyButton.click();
  }

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Social publishing acceptance workspace",
    }),
  ).toBeVisible();
}
