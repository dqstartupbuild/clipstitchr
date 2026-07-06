import type { ClipstitchrCredentials } from "../config/ClipstitchrCredentials.js";
import { requestJson } from "./requestJson.js";

type CreateStitchrBatchOptions = {
  productId?: string;
  soundTrackId?: string;
  stitchrTextBackgroundColorChoice?: string;
  stitchrTextColorChoice?: string;
  stitchrTextStrokeColorChoice?: string;
  stitchrTextStyleChoice?: string;
  templateId?: string;
  timeZone?: string;
};

export type CreateStitchrBatchResult = {
  batchDate: string;
  count: number;
  hookPlanStatus: string;
  message?: string;
  providerDispatchStatus: string;
  runId: string;
  status: string;
  taskIds: string[];
};

export async function createStitchrBatch(
  credentials: ClipstitchrCredentials,
  options: CreateStitchrBatchOptions,
) {
  return await requestJson<CreateStitchrBatchResult>(
    credentials,
    "/api/cli/stitchr/batches",
    {
      body: JSON.stringify(options),
      method: "POST",
    },
  );
}
