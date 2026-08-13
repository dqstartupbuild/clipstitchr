import { api } from "@/convex/_generated/api";
import { getStudioStitchConvexClient } from "./getStudioStitchConvexClient";

export async function acceptStudioStitchOutput(
  id: string,
  request: {
    readonly productId: string;
    readonly expectedRevision: number;
    readonly idempotencyKey: string;
    readonly handoff: {
      readonly libraryAssetId: string | null;
      readonly editorProjectId: string | null;
      readonly publishingSourceId: string | null;
    };
  },
) {
  return await (
    await getStudioStitchConvexClient()
  ).mutation(api.studioReelOutputs.accept.accept, { id, ...request });
}
