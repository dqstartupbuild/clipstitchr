import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow } from "./expectNoHorizontalOverflow";
import { openSocialPublishingAcceptancePage } from "./openSocialPublishingAcceptancePage";

test("shows loading and independent partial-failure results", async ({
  page,
}) => {
  await openSocialPublishingAcceptancePage(page);

  const deliverySection = page.getByRole("region", {
    name: "Delivery feedback",
  });
  await deliverySection
    .getByRole("button", { name: "Show loading state" })
    .click();
  await expect(
    deliverySection.getByText("Publishing to 2 accounts..."),
  ).toBeVisible();
  await expect(
    deliverySection.getByRole("progressbar", {
      name: "Social delivery progress",
    }),
  ).toHaveAttribute("aria-valuenow", "50");

  await deliverySection
    .getByRole("button", { name: "Show partial failure" })
    .click();
  await expect(deliverySection.getByText("Posted")).toBeVisible();
  await expect(deliverySection.getByText("Needs your review")).toBeVisible();
  await expect(
    deliverySection.getByText(
      "Instagram needs you to reconnect before this post can continue.",
    ),
  ).toBeVisible();

  const confirmationSection = page.getByRole("region", {
    name: "Destructive action confirmation",
  });
  await confirmationSection
    .getByRole("button", { name: "Review confirmation" })
    .click();
  const confirmationDialog = page.getByRole("alertdialog", {
    name: "Continue with this action?",
  });
  await expect(confirmationDialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(confirmationDialog).toBeHidden();

  await confirmationSection
    .getByRole("button", { name: "Review confirmation" })
    .click();
  await confirmationDialog
    .getByRole("button", { name: "Confirm action" })
    .click();
  await expect(confirmationSection.getByRole("status")).toHaveText(
    "Action confirmed.",
  );
  await expectNoHorizontalOverflow(page);
});
