import { revokeSession } from "../api/revokeSession.js";
import { deleteCredentials } from "../config/deleteCredentials.js";
import { readCredentials } from "../config/readCredentials.js";

export async function logout() {
  const credentials = await readCredentials();

  if (credentials) {
    await revokeSession(credentials).catch(() => null);
  }

  await deleteCredentials();
}
