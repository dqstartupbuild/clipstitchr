import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow } from "./expectNoHorizontalOverflow";
import { openSocialPublishingAcceptancePage } from "./openSocialPublishingAcceptancePage";

test("completes the platform-aware compose workflow without clipping", async ({
  page,
}, testInfo) => {
  await openSocialPublishingAcceptancePage(page);
  await page.getByRole("button", { name: "Open compose workflow" }).click();

  const dialog = page.getByRole("dialog", {
    name: "Review and schedule a post",
  });
  await expect(dialog).toBeVisible();
  await expectNoHorizontalOverflow(page);

  const dialogBox = await dialog.boundingBox();
  const viewport = page.viewportSize();
  expect(dialogBox).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(dialogBox!.x).toBeGreaterThanOrEqual(0);
  expect(dialogBox!.x + dialogBox!.width).toBeLessThanOrEqual(
    viewport!.width + 1,
  );
  expect(
    Math.abs(dialogBox!.x + dialogBox!.width / 2 - viewport!.width / 2),
  ).toBeLessThanOrEqual(1);

  await page
    .getByRole("checkbox", { name: /ClipStitchr Creator/ })
    .check();
  await page
    .getByRole("checkbox", { name: /ClipStitchr Studio/ })
    .check();
  await page
    .getByRole("combobox", { name: "Who can watch" })
    .selectOption("PUBLIC_TO_EVERYONE");

  const scrollMetrics = await dialog.evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
    scrollTop: element.scrollTop,
  }));
  expect(scrollMetrics.scrollHeight).toBeGreaterThan(
    scrollMetrics.clientHeight,
  );
  await dialog.hover();
  await page.mouse.wheel(0, 360);
  await expect
    .poll(() => dialog.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(scrollMetrics.scrollTop);

  await page.getByRole("radio", { name: "Photo slideshow" }).check();
  const soundCheckbox = page.getByRole("checkbox", {
    name: "Let TikTok pick a sound",
  });
  await expect(soundCheckbox).toBeChecked();
  await soundCheckbox.uncheck();

  await page.getByRole("radio", { name: "Video" }).check();
  await expect(soundCheckbox).toBeHidden();
  await page
    .getByRole("combobox", { name: "Delivery" })
    .selectOption("draft");
  await expect(
    page.getByRole("combobox", { name: "Who can watch" }),
  ).toBeHidden();
  await page
    .getByRole("combobox", { name: "Delivery" })
    .selectOption("direct");
  await page
    .getByRole("combobox", { name: "Who can watch" })
    .selectOption("PUBLIC_TO_EVERYONE");

  await page.getByRole("radio", { name: "Choose a time" }).check();
  await page
    .getByLabel("Local date and time")
    .fill("2026-08-15T10:30");
  await page
    .getByRole("checkbox", {
      name: /I reviewed the accounts, media, caption, visibility/,
    })
    .check();

  const approveButton = page.getByRole("button", {
    name: "Approve and schedule",
  });
  await expect(approveButton).toBeEnabled();
  await page.screenshot({
    fullPage: true,
    path: testInfo.outputPath("compose-workflow.png"),
  });
  await approveButton.click();
  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole("status").filter({
      hasText: "Acceptance post is ready for its selected schedule.",
    }),
  ).toBeVisible();
});
