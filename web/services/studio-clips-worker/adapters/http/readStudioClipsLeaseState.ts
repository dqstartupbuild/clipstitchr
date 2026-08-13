import type { StudioClipsClaimEnvelope } from "../../contracts/StudioClipsClaimEnvelope";
import { getStudioClipsClaimWorkId } from "../../contracts/getStudioClipsClaimWorkId";
import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";
import type { StudioClipsWorkerHttpClient } from "./StudioClipsWorkerHttpClient";

export type StudioClipsLeaseState = {
  cancellationRequested: boolean;
  leaseValid: boolean;
  productOwned: boolean;
  status: string | null;
  studioAccess: boolean;
  taskFound: boolean;
};

export async function readStudioClipsLeaseState(
  http: StudioClipsWorkerHttpClient,
  claim: StudioClipsClaimEnvelope,
): Promise<StudioClipsLeaseState> {
  const value = await http.post("/api/studio/clips/worker/lease-state", {
    attempt: claim.attempt,
    leaseId: claim.leaseId,
    ownerId: claim.ownerId,
    productId: claim.productId,
    taskId: getStudioClipsClaimWorkId(claim),
  });

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new StudioClipsWorkerError({
      code: "INVALID_LEASE_STATE",
      kind: "retryable",
      publicMessage: "The Studio Clips lease state could not be verified.",
    });
  }

  const state = value as Record<string, unknown>;
  if (
    typeof state.cancellationRequested !== "boolean" ||
    typeof state.leaseValid !== "boolean" ||
    typeof state.productOwned !== "boolean" ||
    (state.status !== null && typeof state.status !== "string") ||
    typeof state.studioAccess !== "boolean" ||
    typeof state.taskFound !== "boolean"
  ) {
    throw new StudioClipsWorkerError({
      code: "INVALID_LEASE_STATE",
      kind: "retryable",
      publicMessage: "The Studio Clips lease state could not be verified.",
    });
  }

  return state as StudioClipsLeaseState;
}
