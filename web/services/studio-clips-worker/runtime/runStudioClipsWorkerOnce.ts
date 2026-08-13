import { claimStudioClipsTask } from "../adapters/http/claimStudioClipsTask";
import type { StudioClipsWorkerHttpClient } from "../adapters/http/StudioClipsWorkerHttpClient";
import type { StudioClipsR2ObjectStore } from "../adapters/r2/StudioClipsR2ObjectStore";
import { readStudioClipsClaimEnvelope } from "../validation/readStudioClipsClaimEnvelope";
import type { StudioClipsWorkerClaimResult } from "./StudioClipsWorkerClaimResult";
import type { StudioClipsWorkerRuntimeConfig } from "./StudioClipsWorkerRuntimeConfig";
import { createStudioClipsExecutionSession } from "./createStudioClipsExecutionSession";
import { createStudioClipsRenderRevisionExecutionSession } from "./createStudioClipsRenderRevisionExecutionSession";
import { runStudioClipsInitialClaim } from "./runStudioClipsInitialClaim";
import { runStudioClipsRenderRevisionClaim } from "./runStudioClipsRenderRevisionClaim";

export async function runStudioClipsWorkerOnce(input: {
  config: StudioClipsWorkerRuntimeConfig;
  fetch?: typeof fetch;
  http: StudioClipsWorkerHttpClient;
  objects: StudioClipsR2ObjectStore;
  sessionFactory?: typeof createStudioClipsExecutionSession;
  revisionSessionFactory?: typeof createStudioClipsRenderRevisionExecutionSession;
}): Promise<StudioClipsWorkerClaimResult> {
  const claimed = await claimStudioClipsTask({
    http: input.http,
    leaseSeconds: input.config.leaseSeconds,
    workerId: input.config.workerId,
  });
  if (!claimed.claim) {
    return { availability: claimed.availability, state: "idle" };
  }
  const claim = readStudioClipsClaimEnvelope(claimed.claim);
  if (claim.mode === "render_revision") {
    return runStudioClipsRenderRevisionClaim({
      availability: claimed.availability,
      claim,
      config: input.config,
      http: input.http,
      objects: input.objects,
      sessionFactory: input.revisionSessionFactory,
    });
  }
  return runStudioClipsInitialClaim({
    availability: claimed.availability,
    claim,
    config: input.config,
    fetch: input.fetch,
    http: input.http,
    objects: input.objects,
    sessionFactory: input.sessionFactory,
  });
}
