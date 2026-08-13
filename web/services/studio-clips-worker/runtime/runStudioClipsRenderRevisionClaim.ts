import { completeStudioClipsTask } from "../adapters/http/completeStudioClipsTask";
import { failStudioClipsTask } from "../adapters/http/failStudioClipsTask";
import type { StudioClipsWorkerHttpClient } from "../adapters/http/StudioClipsWorkerHttpClient";
import type { StudioClipsR2ObjectStore } from "../adapters/r2/StudioClipsR2ObjectStore";
import type { StudioClipsRenderRevisionClaimEnvelope } from "../contracts/StudioClipsRenderRevisionClaimEnvelope";
import { processStudioClipsRenderRevisionClaim } from "../processStudioClipsRenderRevisionClaim";
import { createStudioClipsRenderRevisionExecutionSession } from "./createStudioClipsRenderRevisionExecutionSession";
import type { StudioClipsWorkerClaimResult } from "./StudioClipsWorkerClaimResult";
import type { StudioClipsWorkerRuntimeConfig } from "./StudioClipsWorkerRuntimeConfig";

export async function runStudioClipsRenderRevisionClaim(input: {
  availability: unknown;
  claim: StudioClipsRenderRevisionClaimEnvelope;
  config: StudioClipsWorkerRuntimeConfig;
  http: StudioClipsWorkerHttpClient;
  objects: StudioClipsR2ObjectStore;
  sessionFactory?: typeof createStudioClipsRenderRevisionExecutionSession;
}): Promise<StudioClipsWorkerClaimResult> {
  const session = (
    input.sessionFactory ?? createStudioClipsRenderRevisionExecutionSession
  )({
    claim: input.claim,
    config: input.config,
    http: input.http,
    objects: input.objects,
  });
  const result = await processStudioClipsRenderRevisionClaim(
    input.claim,
    session.dependencies,
  );
  if (result.status === "completed") {
    await completeStudioClipsTask({
      claim: input.claim,
      evidence: session.evidence,
      http: input.http,
      outputs: result.outputs,
    });
    return {
      availability: input.availability,
      state: "completed",
      taskId: input.claim.renderRevisionId,
    };
  }
  if (result.status === "error") {
    await failStudioClipsTask({ claim: input.claim, http: input.http, result });
    return {
      availability: input.availability,
      state: "failed",
      taskId: input.claim.renderRevisionId,
    };
  }
  return {
    availability: input.availability,
    state: "cancelled",
    taskId: input.claim.renderRevisionId,
  };
}
