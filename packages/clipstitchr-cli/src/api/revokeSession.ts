import type { ClipstitchrCredentials } from "../config/ClipstitchrCredentials.js";
import { requestJson } from "./requestJson.js";

export async function revokeSession(credentials: ClipstitchrCredentials) {
  return await requestJson<{ revoked: boolean }>(
    {
      accessToken: credentials.accessToken,
      apiBaseUrl: credentials.apiBaseUrl,
    },
    "/api/cli/auth/revoke",
    { method: "POST" },
  );
}
