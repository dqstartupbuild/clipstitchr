import open from "open";
import { exchangeDeviceAuthorization } from "../api/exchangeDeviceAuthorization.js";
import { startDeviceAuthorization } from "../api/startDeviceAuthorization.js";
import { writeCredentials } from "../config/writeCredentials.js";
import { waitForMilliseconds } from "../utils/waitForMilliseconds.js";

export async function login(apiBaseUrl: string) {
  const authorization = await startDeviceAuthorization(apiBaseUrl);

  console.log("No ClipStitchr account connected.");
  console.log(`Opening ${authorization.verificationUriComplete}`);
  console.log(`Code: ${authorization.userCode}`);

  await open(authorization.verificationUriComplete);

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

      console.log("Connected. You can make or upload demos now.");
      return;
    }

    if (token.status !== "authorization_pending") {
      throw new Error("This sign-in code expired. Run login again.");
    }

    await waitForMilliseconds(authorization.interval * 1000);
  }

  throw new Error("This sign-in code expired. Run login again.");
}
