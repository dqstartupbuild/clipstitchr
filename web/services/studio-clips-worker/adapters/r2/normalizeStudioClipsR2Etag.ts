import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";

export function normalizeStudioClipsR2Etag(value: unknown): string {
  const etag = typeof value === "string" ? value.replace(/^"|"$/g, "") : "";
  if (!/^[A-Za-z0-9+/=_-]{8,128}$/.test(etag)) {
    throw new StudioClipsWorkerError({
      code: "R2_OBJECT_IDENTITY_MISSING",
      kind: "retryable",
      publicMessage: "R2 did not return an immutable object identity.",
    });
  }
  return etag;
}
