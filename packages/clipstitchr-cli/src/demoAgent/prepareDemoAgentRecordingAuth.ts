import { input } from "@inquirer/prompts";
import { logStep } from "../terminal/logStep.js";
import { assertDemoAgentObservationAllowed } from "./assertDemoAgentObservationAllowed.js";
import { assertDemoAgentUrlAllowed } from "./assertDemoAgentUrlAllowed.js";
import type { DemoAgentPolicy } from "./DemoAgentPolicy.js";
import { getDemoAgentObservationHasNotFoundState } from "./getDemoAgentObservationHasNotFoundState.js";
import { observeDemoAgentPage } from "./observeDemoAgentPage.js";
import { openDemoAgentBrowserContext } from "./openDemoAgentBrowserContext.js";

export async function prepareDemoAgentRecordingAuth(inputOptions: {
  allowBrowserInstallPrompt?: boolean;
  policy: DemoAgentPolicy;
  promptForSignIn?: boolean;
  startUrl: string;
  userDataDir: string;
}) {
  const context = await openDemoAgentBrowserContext(inputOptions.userDataDir, {
    allowInstallPrompt: inputOptions.allowBrowserInstallPrompt,
  });

  try {
    const page = await context.newPage();

    logStep("Opening the local app before recording.");
    await page.goto(inputOptions.startUrl, { waitUntil: "domcontentloaded" });
    await page
      .waitForLoadState("networkidle", { timeout: 5000 })
      .catch(() => {});
    assertDemoAgentUrlAllowed(inputOptions.policy, page.url());

    if (inputOptions.promptForSignIn === false) {
      const observation = await observeDemoAgentPage(page);

      assertDemoAgentObservationAllowed(inputOptions.policy, observation);

      if (getDemoAgentObservationHasNotFoundState(observation)) {
        throw new Error("The local app opened a not-found page before recording.");
      }

      return;
    }

    await input({
      message:
        "Sign in with a test account if needed, then press Enter to start recording.",
    });
  } finally {
    await context.close();
  }
}
