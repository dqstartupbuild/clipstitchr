import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";
import type { StudioClipsWorkerHttpClient } from "./StudioClipsWorkerHttpClient";

export async function claimStudioClipsTask(input: {
  http: StudioClipsWorkerHttpClient;
  leaseSeconds: number;
  workerId: string;
}): Promise<{ availability: unknown; claim: unknown | null }> {
  const value = await input.http.post("/api/studio/clips/worker/claim", {
    leaseSeconds: input.leaseSeconds,
    workerId: input.workerId,
  });

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new StudioClipsWorkerError({
      code: "INVALID_CLAIM_RESPONSE",
      kind: "retryable",
      publicMessage: "The Studio Clips claim response could not be validated.",
    });
  }
  const record = value as Record<string, unknown>;
  if (!("availability" in record) || !("claim" in record)) {
    throw new StudioClipsWorkerError({
      code: "INVALID_CLAIM_RESPONSE",
      kind: "retryable",
      publicMessage: "The Studio Clips claim response could not be validated.",
    });
  }

  return {
    availability: record.availability,
    claim: record.claim ?? null,
  };
}
