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
  await expectNoHorizontalOverflow(page);
});
