import { chromium, type Page } from "playwright";

export async function withDemoAgentFixturePage(
  runFixture: (page: Page) => Promise<void>,
) {
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({
      viewport: { height: 720, width: 1280 },
    });

    try {
      const page = await context.newPage();

      await runFixture(page);
    } finally {
      await context.close();
    }
  } finally {
    await browser.close();
  }
}
