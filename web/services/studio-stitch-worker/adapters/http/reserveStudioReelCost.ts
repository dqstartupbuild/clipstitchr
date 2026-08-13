import type { StudioReelWorkerClaimEnvelope } from "../../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerClaimEnvelope";
import type { StudioReelWorkerProvider } from "../../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerProvider";
import type { StudioReelWorkerCostReservation } from "../../contracts/StudioReelWorkerCostReservation";
import type { StudioReelWorkerHttpClient } from "../../contracts/StudioReelWorkerHttpClient";
import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";

const operations = {
  dansugc: "acquire_reaction",
  gemini: "analyze_demo",
  elevenlabs: "generate_voice",
  render: "render_recipe",
} as const;

export async function reserveStudioReelCost(input: {
  claim: StudioReelWorkerClaimEnvelope;
  http: StudioReelWorkerHttpClient;
  invocationId: string;
  provider: StudioReelWorkerProvider;
  recipeId: string;
}): Promise<StudioReelWorkerCostReservation> {
  const response = (await input.http.post(
    "/api/studio/stitch/worker/cost-reservations",
    {
      invocationId: input.invocationId,
      leaseAttempt: input.claim.leaseAttempt,
      leaseId: input.claim.leaseId,
      operation: operations[input.provider],
      ownerId: input.claim.ownerId,
      productId: input.claim.productId,
      provider: input.provider,
      recipeId: input.recipeId,
      runAttempt: input.claim.runAttempt,
      runId: input.claim.runId,
    },
  )) as Partial<StudioReelWorkerCostReservation>;
  if (
    typeof response.alreadyReserved !== "boolean" ||
    !["reserved", "uncertain"].includes(response.disposition ?? "") ||
    typeof response.reservationId !== "string"
  ) {
    throw new StudioReelWorkerError({
      code: "INVALID_COST_RESERVATION",
      kind: "permanent",
      publicMessage: "The Studio Stitch cost reservation was invalid.",
    });
  }
  if (response.disposition === "uncertain") {
    throw new StudioReelWorkerError({
      code: "PROVIDER_OUTCOME_UNCERTAIN",
      kind: "uncertain",
      publicMessage:
        "Studio Stitch cannot safely repeat a provider call with an unknown outcome.",
    });
  }
  return response as StudioReelWorkerCostReservation;
}
