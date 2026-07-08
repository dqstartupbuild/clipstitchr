import type { Locator } from "playwright";

export async function scrollDemoAgentLocatorIntoRecordedView(locator: Locator) {
  const target = locator.first();

  await target.waitFor({ state: "attached", timeout: 5000 });
  await target.evaluate((element) => {
    element.scrollIntoView({
      behavior: "auto",
      block: "center",
      inline: "center",
    });
  });
}
