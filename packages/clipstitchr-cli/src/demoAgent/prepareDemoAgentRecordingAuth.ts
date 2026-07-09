import { input } from "@inquirer/prompts";
import { logStep } from "../terminal/logStep.js";
import { assertDemoAgentObservationAllowed } from "./assertDemoAgentObservationAllowed.js";
import { assertDemoAgentUrlAllowed } from "./assertDemoAgentUrlAllowed.js";
import type { DemoAgentPolicy } from "./DemoAgentPolicy.js";
import { getDemoAgentObservationHasAuthState } from "./getDemoAgentObservationHasAuthState.js";
import { getDemoAgentObservationHasNotFoundState } from "./getDemoAgentObservationHasNotFoundState.js";
import { getDemoAgentUrlIsAuthRoute } from "./getDemoAgentUrlIsAuthRoute.js";
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

    logStep("Opening the app before recording.");
    await page.goto(inputOptions.startUrl, { waitUntil: "domcontentloaded" });
    await page
      .waitForLoadState("networkidle", { timeout: 5000 })
      .catch(() => {});
    let needsSignIn = false;

    try {
      assertDemoAgentUrlAllowed(inputOptions.policy, page.url());
    } catch (error) {
      if (!getDemoAgentUrlIsAuthRoute(page.url())) {
        throw error;
      }

      needsSignIn = true;
    }

    let observation = await observeDemoAgentPage(page);

    if (getDemoAgentObservationHasAuthState(observation)) {
      needsSignIn = true;
    }

    if (!needsSignIn) {
      assertDemoAgentObservationAllowed(inputOptions.policy, observation);

      if (getDemoAgentObservationHasNotFoundState(observation)) {
        throw new Error("The app opened a not-found page before recording.");
      }

      return;
    }

    await input({
      message:
        "Sign in with a test account in the browser, then press Enter to continue.",
    });
    await page
      .waitForLoadState("networkidle", { timeout: 5000 })
      .catch(() => {});

    try {
      assertDemoAgentUrlAllowed(inputOptions.policy, page.url());
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? `Sign-in did not return to an allowed app page. ${error.message}`
          : "Sign-in did not return to an allowed app page.",
      );
    }

    observation = await observeDemoAgentPage(page);
    assertDemoAgentObservationAllowed(inputOptions.policy, observation);

    if (getDemoAgentObservationHasNotFoundState(observation)) {
      throw new Error("The app opened a not-found page before recording.");
    }
  } finally {
    await context.close();
  }
}
