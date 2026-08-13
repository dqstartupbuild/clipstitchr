import { createStudioStitchClientId } from "./createStudioStitchClientId";

export function createStudioStitchMaterializeRequest(productId: string) {
  return {
    idempotencyKey: createStudioStitchClientId("materialize_output"),
    productId,
  };
}
