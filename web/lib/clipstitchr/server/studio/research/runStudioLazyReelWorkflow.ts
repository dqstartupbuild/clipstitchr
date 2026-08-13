import { api } from "@/convex/_generated/api";
import { createProductProfileFromConvexDocument } from "@/lib/clipstitchr/backend/createProductProfileFromConvexDocument";
import { executeLazyReelWorkflow } from "@/lib/clipstitchr/server/studio/lazyreel/executeLazyReelWorkflow";
import { lazyReelSnapshotVersion } from "@/lib/clipstitchr/server/studio/lazyreel/lazyReelSnapshotVersion";
import { createLazyReelGroundedProductDescription } from "@/lib/clipstitchr/server/studio/lazyreel/product/createLazyReelGroundedProductDescription";
import type { StudioLazyReelWorkflowRunRequest } from "@/lib/clipstitchr/types/lazyreel/StudioLazyReelWorkflowRunRequest";
import type { StudioLazyReelWorkflowRunResult } from "@/lib/clipstitchr/types/lazyreel/StudioLazyReelWorkflowRunResult";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { createStudioLazyReelWorkflowArtifactSummary } from "./createStudioLazyReelWorkflowArtifactSummary";
import { createStudioLazyReelWorkflowInputSnapshot } from "./createStudioLazyReelWorkflowInputSnapshot";
import { createStudioLazyReelWorkflowResultSnapshot } from "./createStudioLazyReelWorkflowResultSnapshot";
import { getStudioLazyReelPublicErrorMessage } from "./getStudioLazyReelPublicErrorMessage";
import { getStudioLazyReelConvexClient } from "./getStudioLazyReelConvexClient";
import { parseStudioLazyReelStoredWorkflowResult } from "./parseStudioLazyReelStoredWorkflowResult";

export async function runStudioLazyReelWorkflow(
  input: StudioLazyReelWorkflowRunRequest,
): Promise<StudioLazyReelWorkflowRunResult> {
  const convex = await getStudioLazyReelConvexClient();
  const productDocument = await convex.query(api.products.get, {
    id: input.productId,
  });

  if (!productDocument) {
    throw new Error("Choose an active saved Product first.");
  }

  const request = {
    ...input.request,
    product: createLazyReelGroundedProductDescription(
      createProductProfileFromConvexDocument(productDocument),
    ),
  };
  const pending = await convex.mutation(
    api.studioLazyReelResearchRuns.createPending.createPending,
    {
      id: createId(),
      idempotencyKey: input.idempotencyKey,
      identity: { kind: "workflow", key: request.workflow },
      inputSnapshot: createStudioLazyReelWorkflowInputSnapshot(request),
      productId: input.productId,
      sourceSnapshotVersion: lazyReelSnapshotVersion,
    },
  );

  if (!pending.created && pending.run.status === "completed") {
    if (!pending.run.resultSnapshot) {
      throw new Error("Saved workflow run has no result.");
    }

    return {
      created: false,
      result: parseStudioLazyReelStoredWorkflowResult(
        pending.run.resultSnapshot.payloadJson,
      ),
      runId: pending.run.id,
    };
  }

  if (!pending.created && pending.run.status === "failed") {
    throw new Error(
      pending.run.failure?.message ?? "This workflow run failed previously.",
    );
  }

  try {
    const result = executeLazyReelWorkflow(request);

    await convex.mutation(
      api.studioLazyReelResearchRuns.complete.complete,
      {
        artifactSummary: createStudioLazyReelWorkflowArtifactSummary(result),
        id: pending.run.id,
        outcome: "complete",
        productId: input.productId,
        resultSnapshot: createStudioLazyReelWorkflowResultSnapshot(result),
      },
    );

    return { created: pending.created, result, runId: pending.run.id };
  } catch (error) {
    const message = getStudioLazyReelPublicErrorMessage(
      error,
      "Workflow planning failed.",
    );

    await convex
      .mutation(api.studioLazyReelResearchRuns.fail.fail, {
        failure: {
          code: "workflow_planning_failed",
          message,
          retryable: false,
        },
        id: pending.run.id,
        productId: input.productId,
      })
      .catch(() => undefined);

    throw error;
  }
}
