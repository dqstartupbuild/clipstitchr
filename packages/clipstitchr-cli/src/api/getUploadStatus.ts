import type { ClipstitchrCredentials } from "../config/ClipstitchrCredentials.js";
import { requestJson } from "./requestJson.js";

export type UploadStatusResponse = {
  clip: null | {
    duration: number;
    id: string;
    name: string;
    productId?: string;
  };
  job: null | {
    error?: string;
    id: string;
    stage: string;
    status: string;
  };
};

export async function getUploadStatus(
  credentials: ClipstitchrCredentials,
  clipId: string,
) {
  return await requestJson<UploadStatusResponse>(
    {
      accessToken: credentials.accessToken,
      apiBaseUrl: credentials.apiBaseUrl,
    },
    `/api/cli/uploads/${encodeURIComponent(clipId)}`,
  );
}
