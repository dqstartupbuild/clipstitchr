import open from "open";
import { exchangeDeviceAuthorization } from "../api/exchangeDeviceAuthorization.js";
import { startDeviceAuthorization } from "../api/startDeviceAuthorization.js";
import { writeCredentials } from "../config/writeCredentials.js";
import { formatCommandText } from "../terminal/formatCommandText.js";
import { logBrandHeader } from "../terminal/logBrandHeader.js";
import { logInfo } from "../terminal/logInfo.js";
import { logKeyValue } from "../terminal/logKeyValue.js";
import { logNextCommand } from "../terminal/logNextCommand.js";
import { logStep } from "../terminal/logStep.js";
import { logSuccess } from "../terminal/logSuccess.js";
import { waitForMilliseconds } from "../utils/waitForMilliseconds.js";

export async function login(apiBaseUrl: string) {
  const authorization = await startDeviceAuthorization(apiBaseUrl);

  logBrandHeader("Connect this machine to your account.");
  logInfo("No ClipStitchr account is connected on this machine yet.");
  logKeyValue("Browser", authorization.verificationUriComplete);
  logKeyValue("Code", formatCommandText(authorization.userCode));

  await open(authorization.verificationUriComplete);
  logStep("Waiting for browser approval.");

  const expiresAt = Date.now() + authorization.expiresIn * 1000;

  while (Date.now() < expiresAt) {
    const token = await exchangeDeviceAuthorization(
      apiBaseUrl,
      authorization.deviceCode,
    );

    if ("accessToken" in token) {
      await writeCredentials({
        accessToken: token.accessToken,
        apiBaseUrl,
        expiresAt: token.expiresAt,
        savedAt: new Date().toISOString(),
        sessionId: token.sessionId,
      });

      logSuccess("Connected to ClipStitchr.");
      logNextCommand("clipstitchr demo make");
      return;
    }

    if (token.status !== "authorization_pending") {
      throw new Error("This sign-in code expired. Run login again.");
    }

    await waitForMilliseconds(authorization.interval * 1000);
  }

  throw new Error("This sign-in code expired. Run login again.");
}
