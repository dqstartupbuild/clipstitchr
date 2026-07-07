import { readCredentials } from "../config/readCredentials.js";

export async function readDemoAutoCredentials(apiBaseUrl: string) {
  const credentials = await readCredentials();

  if (!credentials) {
    throw new Error("Run `clipstitchr login` before running demo auto.");
  }

  if (credentials.apiBaseUrl !== apiBaseUrl) {
    throw new Error("Run `clipstitchr login` for this ClipStitchr app first.");
  }

  if (new Date(credentials.expiresAt).getTime() <= Date.now()) {
    throw new Error("Your ClipStitchr login expired. Run `clipstitchr login`.");
  }

  return credentials;
}
