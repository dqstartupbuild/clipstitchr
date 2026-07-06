import type { ClipstitchrCredentials } from "../config/ClipstitchrCredentials.js";
import { requestJson } from "./requestJson.js";

type CreateSwiprBatchOptions = {
  productId?: string;
};

export type CreateSwiprBatchResult = {
  automationDate: string;
  count: number;
  runId: string;
  status: string;
  taskIds: string[];
};

export async function createSwiprBatch(
  credentials: ClipstitchrCredentials,
  options: CreateSwiprBatchOptions,
) {
  return await requestJson<CreateSwiprBatchResult>(
    credentials,
    "/api/cli/swipr/batches",
    {
      body: JSON.stringify(options),
      method: "POST",
    },
  );
}
