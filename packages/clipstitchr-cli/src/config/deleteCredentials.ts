import { rm } from "node:fs/promises";
import { getCredentialsPath } from "./getCredentialsPath.js";

export async function deleteCredentials() {
  await rm(getCredentialsPath(), { force: true });
}
