import type { ClipstitchrCredentials } from "../config/ClipstitchrCredentials.js";
import { requestJson } from "./requestJson.js";

export async function completeDemoUpload(
  credentials: ClipstitchrCredentials,
  input: {
    clipId: string;
    contentType: string;
    key: string;
    originalName: string;
    productId: string;
    size: number;
  },
) {
  return await requestJson<{ job: { id: string; stage: string; status: string } }>(
    {
      accessToken: credentials.accessToken,
      apiBaseUrl: credentials.apiBaseUrl,
    },
    "/api/cli/uploads/demo/complete",
    {
      body: JSON.stringify(input),
      method: "POST",
    },
  );
}
