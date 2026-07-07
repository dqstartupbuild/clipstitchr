import { input } from "@inquirer/prompts";
import { logStep } from "../terminal/logStep.js";
import { assertDemoAgentUrlAllowed } from "./assertDemoAgentUrlAllowed.js";
import type { DemoAgentPolicy } from "./DemoAgentPolicy.js";
import { openDemoAgentBrowserContext } from "./openDemoAgentBrowserContext.js";

export async function prepareDemoAgentRecordingAuth(inputOptions: {
  policy: DemoAgentPolicy;
  startUrl: string;
  userDataDir: string;
}) {
  const context = await openDemoAgentBrowserContext(inputOptions.userDataDir);

  try {
    const page = await context.newPage();

    logStep("Opening the local app before recording.");
    await page.goto(inputOptions.startUrl, { waitUntil: "domcontentloaded" });
    await page
      .waitForLoadState("networkidle", { timeout: 5000 })
      .catch(() => {});
    assertDemoAgentUrlAllowed(inputOptions.policy, page.url());

    await input({
      message:
        "Sign in with a test account if needed, then press Enter to start recording.",
    });
  } finally {
    await context.close();
  }
}
