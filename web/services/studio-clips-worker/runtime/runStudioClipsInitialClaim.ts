import { completeStudioClipsTask } from "../adapters/http/completeStudioClipsTask";
import { failStudioClipsTask } from "../adapters/http/failStudioClipsTask";
import type { StudioClipsWorkerHttpClient } from "../adapters/http/StudioClipsWorkerHttpClient";
import type { StudioClipsR2ObjectStore } from "../adapters/r2/StudioClipsR2ObjectStore";
import type { StudioClipsInitialClaimEnvelope } from "../contracts/StudioClipsInitialClaimEnvelope";
import { processStudioClipsClaim } from "../processStudioClipsClaim";
import { createStudioClipsExecutionSession } from "./createStudioClipsExecutionSession";
import type { StudioClipsWorkerClaimResult } from "./StudioClipsWorkerClaimResult";
import type { StudioClipsWorkerRuntimeConfig } from "./StudioClipsWorkerRuntimeConfig";

export async function runStudioClipsInitialClaim(input: {
  availability: unknown;
  claim: StudioClipsInitialClaimEnvelope;
  config: StudioClipsWorkerRuntimeConfig;
  fetch?: typeof fetch;
  http: StudioClipsWorkerHttpClient;
  objects: StudioClipsR2ObjectStore;
  sessionFactory?: typeof createStudioClipsExecutionSession;
}): Promise<StudioClipsWorkerClaimResult> {
  const session = (input.sessionFactory ?? createStudioClipsExecutionSession)({
    claim: input.claim,
    config: input.config,
    fetch: input.fetch,
    http: input.http,
    objects: input.objects,
  });
  const result = await processStudioClipsClaim(
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
      taskId: input.claim.taskId,
    };
  }
  if (result.status === "error") {
    await failStudioClipsTask({ claim: input.claim, http: input.http, result });
    return {
      availability: input.availability,
      state: "failed",
      taskId: input.claim.taskId,
    };
  }
  return {
    availability: input.availability,
    state: "cancelled",
    taskId: input.claim.taskId,
  };
}
