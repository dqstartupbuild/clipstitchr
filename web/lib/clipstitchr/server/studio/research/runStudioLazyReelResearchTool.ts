import { api } from "@/convex/_generated/api";
import { createProductProfileFromConvexDocument } from "@/lib/clipstitchr/backend/createProductProfileFromConvexDocument";
import { executeLazyReelResearchTool } from "@/lib/clipstitchr/server/studio/lazyreel/executeLazyReelResearchTool";
import { lazyReelSnapshotVersion } from "@/lib/clipstitchr/server/studio/lazyreel/lazyReelSnapshotVersion";
import { groundLazyReelToolRequestInProduct } from "@/lib/clipstitchr/server/studio/lazyreel/product/groundLazyReelToolRequestInProduct";
import type { StudioLazyReelResearchRunRequest } from "@/lib/clipstitchr/types/lazyreel/StudioLazyReelResearchRunRequest";
import type { StudioLazyReelResearchRunResult } from "@/lib/clipstitchr/types/lazyreel/StudioLazyReelResearchRunResult";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { createStudioLazyReelArtifactSummary } from "./createStudioLazyReelArtifactSummary";
import { createStudioLazyReelInputSnapshot } from "./createStudioLazyReelInputSnapshot";
import { createStudioLazyReelResultSnapshot } from "./createStudioLazyReelResultSnapshot";
import { getStudioLazyReelPublicErrorMessage } from "./getStudioLazyReelPublicErrorMessage";
import { getStudioLazyReelConvexClient } from "./getStudioLazyReelConvexClient";
import { parseStudioLazyReelStoredResult } from "./parseStudioLazyReelStoredResult";

export async function runStudioLazyReelResearchTool(
  input: StudioLazyReelResearchRunRequest,
): Promise<StudioLazyReelResearchRunResult> {
  const convex = await getStudioLazyReelConvexClient();
  const productDocument = await convex.query(api.products.get, {
    id: input.productId,
  });

  if (!productDocument) {
    throw new Error("Choose an active saved Product first.");
  }

  const request = groundLazyReelToolRequestInProduct(
    input.request,
    createProductProfileFromConvexDocument(productDocument),
  );
  const proposedRunId = createId();
  const pending = await convex.mutation(
    api.studioLazyReelResearchRuns.createPending.createPending,
    {
      id: proposedRunId,
      idempotencyKey: input.idempotencyKey,
      identity: { kind: "tool", key: request.tool },
      inputSnapshot: createStudioLazyReelInputSnapshot(request),
      productId: input.productId,
      sourceSnapshotVersion: lazyReelSnapshotVersion,
    },
  );

  if (!pending.created && pending.run.status === "completed") {
    if (!pending.run.resultSnapshot) {
      throw new Error("Saved research run has no result.");
    }

    return {
      created: false,
      result: parseStudioLazyReelStoredResult(
        pending.run.resultSnapshot.payloadJson,
      ),
      runId: pending.run.id,
    };
  }

  if (!pending.created && pending.run.status === "failed") {
    throw new Error(
      pending.run.failure?.message ?? "This research run failed previously.",
    );
  }

  try {
    const result = executeLazyReelResearchTool(request);

    await convex.mutation(
      api.studioLazyReelResearchRuns.complete.complete,
      {
        artifactSummary: createStudioLazyReelArtifactSummary(result),
        id: pending.run.id,
        outcome: "complete",
        productId: input.productId,
        resultSnapshot: createStudioLazyReelResultSnapshot(result),
      },
    );

    return { created: pending.created, result, runId: pending.run.id };
  } catch (error) {
    const message = getStudioLazyReelPublicErrorMessage(
      error,
      "Research failed.",
    );

    await convex
      .mutation(api.studioLazyReelResearchRuns.fail.fail, {
        failure: {
          code: "research_execution_failed",
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
