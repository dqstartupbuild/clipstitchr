import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow } from "./expectNoHorizontalOverflow";
import { openSocialPublishingAcceptancePage } from "./openSocialPublishingAcceptancePage";

test("operates queue and analytics controls at the active viewport", async ({
  page,
}) => {
  await openSocialPublishingAcceptancePage(page);
  await expectNoHorizontalOverflow(page);

  const queueSection = page.getByRole("region", {
    name: "Product posting times",
  });
  await expect(queueSection.getByRole("status")).toHaveText(
    "Queue has 2 posting times.",
  );
  await queueSection.getByRole("button", { name: "Remove" }).first().click();
  await expect(queueSection.getByRole("status")).toHaveText(
    "Queue has 1 posting time.",
  );
  await queueSection
    .getByRole("button", { name: "Add a posting time" })
    .click();
  await expect(queueSection.getByRole("status")).toHaveText(
    "Queue has 2 posting times.",
  );

  const analyticsSection = page.getByRole("region", {
    name: "Manual analytics",
  });
  await analyticsSection
    .getByRole("combobox", { name: "What to measure" })
    .selectOption("growth_during_period");
  await analyticsSection
    .getByRole("combobox", { name: "Time range" })
    .selectOption("custom");
  await analyticsSection.getByLabel("Start").fill("2026-07-01T09:00");
  await analyticsSection.getByLabel("End").fill("2026-07-08T09:00");
  await expect(analyticsSection.getByRole("status")).toHaveText(
    "Showing growth during period.",
  );
  await expect(
    analyticsSection.getByText("Not available", { exact: true }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
