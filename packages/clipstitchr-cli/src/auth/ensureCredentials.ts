import { readCredentials } from "../config/readCredentials.js";

export async function ensureCredentials() {
  const credentials = await readCredentials();

  if (!credentials) {
    throw new Error("Run `clipstitchr login` first.");
  }

  if (new Date(credentials.expiresAt).getTime() <= Date.now()) {
    throw new Error("Your ClipStitchr login expired. Run `clipstitchr login`.");
  }

  return credentials;
}
