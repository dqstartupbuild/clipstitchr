import type { ClipstitchrCredentials } from "../config/ClipstitchrCredentials.js";
import { requestJson } from "./requestJson.js";

export type DemoUploadResponse = {
  clipId: string;
  expiresIn: number;
  product: {
    id: string;
    name: string;
  };
  sourceVideoObject: {
    contentType: string;
    key: string;
    size: number;
  };
  uploadUrl: string;
};

export async function createDemoUpload(
  credentials: ClipstitchrCredentials,
  input: {
    contentType: string;
    productId: string;
    sizeBytes: number;
  },
) {
  return await requestJson<DemoUploadResponse>(
    {
      accessToken: credentials.accessToken,
      apiBaseUrl: credentials.apiBaseUrl,
    },
    "/api/cli/uploads/demo",
    {
      body: JSON.stringify(input),
      method: "POST",
    },
  );
}
