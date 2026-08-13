import "server-only";

import { api } from "@/convex/_generated/api";
import { getStudioStitchConvexClient } from "./getStudioStitchConvexClient";
import { getStudioStitchMaterializationSecret } from "./getStudioStitchMaterializationSecret";
import { verifyStudioStitchOutputObject } from "./verifyStudioStitchOutputObject";

export async function materializeStudioStitchOutput(
  id: string,
  request: { readonly idempotencyKey: string; readonly productId: string },
) {
  const convex = await getStudioStitchConvexClient();
  await convex.mutation(
    api.studioReelRateLimits.consumeStaticRead.consumeStaticRead,
    { productId: request.productId },
  );
  const output = await convex.query(api.studioReelOutputs.get.get, {
    id,
    productId: request.productId,
  });
  if (!output) {
    throw new Error("Studio Stitch output not found.");
  }
  const proof = await verifyStudioStitchOutputObject(output);
  return await convex.mutation(api.studioReelOutputs.materialize.materialize, {
    id,
    idempotencyKey: request.idempotencyKey,
    productId: request.productId,
    proof,
    secret: getStudioStitchMaterializationSecret(),
  });
}
