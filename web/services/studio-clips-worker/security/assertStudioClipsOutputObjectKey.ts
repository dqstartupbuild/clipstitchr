import { assertStudioClipsOwnedObjectKey } from "./assertStudioClipsOwnedObjectKey";
import { StudioClipsWorkerError } from "../errors/StudioClipsWorkerError";

export function assertStudioClipsOutputObjectKey(input: {
  objectKey: string;
  ownerId: string;
  productId: string;
  taskId: string;
}): void {
  assertStudioClipsOwnedObjectKey(input.ownerId, input.objectKey);
  const prefix = [
    `users/${encodeURIComponent(input.ownerId)}/studio/v1/studio-clips`,
    encodeURIComponent(input.productId),
    encodeURIComponent(input.taskId),
    "",
  ].join("/");

  if (!input.objectKey.startsWith(prefix)) {
    throw new StudioClipsWorkerError({
      code: "OUTPUT_SCOPE_MISMATCH",
      kind: "permanent",
      publicMessage: "A generated clip was outside this Product workspace.",
    });
  }
}
