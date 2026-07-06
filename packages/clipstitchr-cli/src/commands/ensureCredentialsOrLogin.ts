import { confirm } from "@inquirer/prompts";
import { login } from "../auth/login.js";
import { readCredentials } from "../config/readCredentials.js";

export async function ensureCredentialsOrLogin(apiBaseUrl: string) {
  const credentials = await readCredentials();

  if (
    credentials &&
    credentials.apiBaseUrl === apiBaseUrl &&
    new Date(credentials.expiresAt).getTime() > Date.now()
  ) {
    return credentials;
  }

  const shouldLogin = await confirm({
    default: true,
    message: "Connect your ClipStitchr account now?",
  });

  if (!shouldLogin) {
    throw new Error("Run `clipstitchr login` when you are ready.");
  }

  await login(apiBaseUrl);

  const nextCredentials = await readCredentials();

  if (!nextCredentials) {
    throw new Error("Login did not save credentials.");
  }

  return nextCredentials;
}
