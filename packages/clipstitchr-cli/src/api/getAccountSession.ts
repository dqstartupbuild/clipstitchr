import type { ClipstitchrCredentials } from "../config/ClipstitchrCredentials.js";
import { requestJson } from "./requestJson.js";

export async function getAccountSession(credentials: ClipstitchrCredentials) {
  return await requestJson<{ session: { expiresAt: string; ownerId: string } }>(
    {
      accessToken: credentials.accessToken,
      apiBaseUrl: credentials.apiBaseUrl,
    },
    "/api/cli/me",
  );
}
